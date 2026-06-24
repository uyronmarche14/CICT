import Role from '../models/Role'
import User from '../models/User'
import OrganizationAssignment from '../models/OrganizationAssignment'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import logger from '../utils/logger'
import { getSystemRoleCatalog, invalidateUserCache } from '../utils/rbac'
import { Permission, UserRole } from '../types'
import { TypedCache } from '../utils/cache'
import { invalidateDashboardCache } from './dashboard.service'

const roleListCache = new TypedCache<any>({ namespace: 'role:list', ttlMs: 300_000 })
const roleDetailCache = new TypedCache<any>({ namespace: 'role:detail', ttlMs: 300_000 })

const invalidateRoles = async (): Promise<void> => {
  await roleListCache.clear()
  await roleDetailCache.clear()
  await invalidateDashboardCache()
}

const invalidateUsersAssignedToRole = async (roleId: string): Promise<void> => {
  const [users, assignments] = await Promise.all([
    User.find({ customRole: roleId }).select('_id').lean(),
    OrganizationAssignment.find({ role: roleId }).select('user').lean(),
  ])
  const userIds = new Set<string>()

  users.forEach((user) => userIds.add(String(user._id)))
  assignments.forEach((assignment) => userIds.add(String(assignment.user)))

  await Promise.all(Array.from(userIds).map((userId) => invalidateUserCache(userId)))
}

const ensureRolePermissionsWithinActorScope = (
  actorPermissions: Permission[],
  requestedPermissions: Permission[]
) => {
  const unauthorizedPermissions = requestedPermissions.filter(
    (permission) => !actorPermissions.includes(permission)
  )
  if (unauthorizedPermissions.length > 0) {
    throw new AppError(
      `You cannot manage a custom role with permissions beyond your own global scope: ${unauthorizedPermissions.join(', ')}`,
      403
    )
  }
}

const serializeCustomRole = async (role: any) => {
  const [assignedUserCount, assignedOrgCount] = await Promise.all([
    User.countDocuments({ customRole: role._id }),
    OrganizationAssignment.countDocuments({ role: role._id }),
  ])

  return {
    id: String(role._id),
    name: role.name,
    description: role.description,
    kind: 'custom' as const,
    isEditable: true,
    isDeletable: true,
    permissions: role.permissions ?? [],
    assignedUserCount: assignedUserCount + assignedOrgCount,
    createdBy: role.createdBy
      ? {
          id: String(role.createdBy._id ?? role.createdBy),
          firstName: role.createdBy.firstName,
          lastName: role.createdBy.lastName,
          email: role.createdBy.email,
        }
      : null,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }
}

const serializeSystemRole = async (
  systemRole: ReturnType<typeof getSystemRoleCatalog>[number]
) => {
  const assignedUserCount = await User.countDocuments({ role: systemRole.systemRoleKey })
  return {
    id: systemRole.id,
    name: systemRole.name,
    description: systemRole.description,
    kind: 'system' as const,
    isEditable: false,
    isDeletable: false,
    permissions: systemRole.permissions,
    systemRoleKey: systemRole.systemRoleKey,
    assignedUserCount,
    createdBy: null,
    createdAt: null,
    updatedAt: null,
  }
}

const isSystemRoleIdentifier = (id: string): id is `system:${string}` => id.startsWith('system:')

const findSystemRoleById = (id: string) =>
  getSystemRoleCatalog().find((role) => role.id === id || role.systemRoleKey === (id as UserRole))

// ——— Reads ———

export const getAllRoles = async (): Promise<any> => {
  const cached = await roleListCache.get('all')
  if (cached) {return cached}

  const customRoles = await Role.find({ isSystemRole: false })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })

  const [systemRoles, serializedCustomRoles] = await Promise.all([
    Promise.all(getSystemRoleCatalog().map((role) => serializeSystemRole(role))),
    Promise.all(customRoles.map((role) => serializeCustomRole(role))),
  ])

  const roles = [...systemRoles, ...serializedCustomRoles]
  await roleListCache.set('all', roles)
  return roles
}

export const getRoleById = async (id: string): Promise<any> => {
  if (isSystemRoleIdentifier(id) || findSystemRoleById(id)) {
    const systemRole = findSystemRoleById(id)
    if (!systemRole) {throw new AppError('Role not found', 404)}
    return serializeSystemRole(systemRole)
  }

  const cached = await roleDetailCache.get(id)
  if (cached) {return cached}

  const role = await Role.findById(id).populate('createdBy', 'firstName lastName email')
  if (!role) {throw new AppError('Role not found', 404)}

  const serialized = await serializeCustomRole(role)
  await roleDetailCache.set(id, serialized)
  return serialized
}

// ——— Writes ———

export const createRole = async (req: AuthRequest): Promise<any> => {
  if (!req.user) {throw new AppError('User not authenticated', 401)}

  const { name, description, permissions } = req.body
  const requestedPermissions = Array.isArray(permissions) ? permissions : []
  ensureRolePermissionsWithinActorScope(req.user.permissions, requestedPermissions)

  const role = await Role.create({
    name,
    description,
    permissions: requestedPermissions,
    createdBy: req.user.userId,
  })

  logger.info(`Role created: ${role._id} by user ${req.user.userId}`)
  const serializedRole = await serializeCustomRole(role)
  await invalidateRoles()
  return serializedRole
}

export const updateRole = async (id: string, req: AuthRequest): Promise<any> => {
  const { name, description, permissions } = req.body

  const role = await Role.findById(id)
  if (!role) {throw new AppError('Role not found', 404)}

  if (role.isSystemRole) {throw new AppError('Cannot update system roles', 403)}

  const requestedPermissions = Array.isArray(permissions)
    ? permissions
    : role.permissions ?? []
  ensureRolePermissionsWithinActorScope(req.user?.permissions ?? [], requestedPermissions)

  const updates: Record<string, unknown> = {}
  if (name) {updates.name = name}
  if (description) {updates.description = description}
  if (permissions) {updates.permissions = requestedPermissions}

  const updatedRole = await Role.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('createdBy', 'firstName lastName email')

  logger.info(`Role updated: ${id} by user ${req.user?.userId}`)
  await invalidateRoles()
  await invalidateUsersAssignedToRole(id)
  return updatedRole ? serializeCustomRole(updatedRole) : null
}

export const deleteRole = async (id: string, req: AuthRequest): Promise<void> => {
  const role = await Role.findById(id)
  if (!role) {throw new AppError('Role not found', 404)}
  if (role.isSystemRole) {throw new AppError('Cannot delete system roles', 403)}

  const [assignedUserCount, assignedOrgCount] = await Promise.all([
    User.countDocuments({ customRole: role._id }),
    OrganizationAssignment.countDocuments({ role: role._id }),
  ])
  if (assignedUserCount > 0 || assignedOrgCount > 0) {
    throw new AppError(
      'Cannot delete a custom role that is still assigned to users or organization scopes. Reassign or remove it first.',
      409
    )
  }

  await role.deleteOne()
  logger.info(`Role deleted: ${id} by user ${req.user?.userId}`)
  await invalidateRoles()
}
