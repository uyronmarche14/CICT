import { Types } from 'mongoose'
import User from '../models/User'
import Role from '../models/Role'
import OrganizationAssignment from '../models/OrganizationAssignment'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import {
  AdminModule,
  IAdminScopes,
  IResolvedOrganizationAssignment,
  IScopedAdminModulesByOrganization,
  Permission,
  UserRole,
} from '../types'
import logger from '../utils/logger'
import {
  canAccessAdminPanel,
  deriveAdminScopes,
  deriveScopedAdminModulesByOrganization,
  deriveVisibleAdminModules,
  findActiveFullAdminCount,
  getDefaultPermissions,
  getSystemRoleDefinition,
  hasGlobalPermission,
  invalidateUserCache,
} from '../utils/rbac'
import { getResolvedOrganizationAssignmentsForUser } from '../utils/organizationScope'
import { sanitizeSearchInput } from '../utils/escapeRegex'
import { parsePagination } from '../utils/pagination'
import { validateOrganizationAssignments, ensurePermissionSetWithinActorScope } from '../utils/organizationAssignment'
import { TypedCache } from '../utils/cache'
import { invalidateDashboardCache } from './dashboard.service'

const PROTECTED_USER_FIELDS = ['role', 'customRole', 'customRoleId', 'isActive']

type SerializedUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  baseRoleLabel: string
  customRoleId: string | null
  customRole?: {
    id: string
    name: string
    description: string
    permissions?: Permission[]
  } | null
  effectiveRoleLabel: string
  effectiveRoleKind: 'system' | 'custom'
  effectivePermissions: Permission[]
  canAccessAdmin: boolean
  adminScopes: IAdminScopes
  visibleAdminModules: AdminModule[]
  scopedAdminModulesByOrganization: IScopedAdminModulesByOrganization
  organizationAssignments: IResolvedOrganizationAssignment[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const userDetailCache = new TypedCache<any>({ namespace: 'user:detail', ttlMs: 300_000 })
const userListCache = new TypedCache<any>({ namespace: 'user:list', ttlMs: 60_000 })

const invalidateUser = async (id: string): Promise<void> => {
  await userDetailCache.invalidate(id)
  await userListCache.clear()
  await invalidateUserCache(id)
  await invalidateDashboardCache()
}

const getSystemRoleLabel = (role: UserRole): string => getSystemRoleDefinition(role).name

const serializeUser = async (user: any): Promise<SerializedUser> => {
  const customRole =
    user.customRole && typeof user.customRole === 'object' && '_id' in user.customRole
      ? {
          id: String(user.customRole._id),
          name: user.customRole.name,
          description: user.customRole.description,
          permissions: user.customRole.permissions,
        }
      : null

  const effectivePermissions = customRole?.permissions ?? getDefaultPermissions(user.role)
  const organizationAssignments = await getResolvedOrganizationAssignmentsForUser(
    String(user._id)
  )
  const adminScopes = deriveAdminScopes(effectivePermissions, organizationAssignments)
  const visibleAdminModules = deriveVisibleAdminModules(
    effectivePermissions,
    organizationAssignments
  )
  const scopedAdminModulesByOrganization =
    deriveScopedAdminModulesByOrganization(organizationAssignments)

  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    baseRoleLabel: getSystemRoleLabel(user.role),
    customRoleId:
      user.customRole && typeof user.customRole === 'object' && '_id' in user.customRole
        ? String(user.customRole._id)
        : user.customRole
          ? String(user.customRole)
          : null,
    customRole,
    effectiveRoleLabel: customRole?.name ?? getSystemRoleLabel(user.role),
    effectiveRoleKind: customRole ? 'custom' : 'system',
    effectivePermissions,
    canAccessAdmin: canAccessAdminPanel(effectivePermissions, organizationAssignments),
    organizationAssignments,
    adminScopes,
    visibleAdminModules,
    scopedAdminModulesByOrganization,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

const ensureProtectedFieldsAbsent = (body: Record<string, unknown>) => {
  const invalidFields = PROTECTED_USER_FIELDS.filter((field) => field in body)
  if (invalidFields.length > 0) {
    throw new AppError(
      `Protected fields cannot be changed via this endpoint: ${invalidFields.join(', ')}`,
      400
    )
  }
}

const ensureCanRevokeFullAdmin = async (targetUser: any) => {
  if (targetUser.role !== UserRole.FULL_ADMIN || !targetUser.isActive) {
    return
  }
  const activeFullAdminCount = await findActiveFullAdminCount()
  if (activeFullAdminCount <= 1) {
    throw new AppError('You cannot remove access from the last active full admin', 400)
  }
}

const validateAssignableRole = async (
  req: AuthRequest,
  role?: UserRole,
  customRoleId?: string | null
) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401)
  }

  const includesRoleFields = role !== undefined || customRoleId !== undefined
  if (!includesRoleFields) {
    return { role: undefined, customRoleId: undefined }
  }

  if (!hasGlobalPermission(req.user, Permission.ASSIGN_ROLE)) {
    throw new AppError('You do not have permission to assign roles', 403)
  }

  let validatedCustomRoleId: string | null | undefined = customRoleId
  if (customRoleId !== undefined && customRoleId !== null) {
    const customRole = await Role.findById(customRoleId)
    if (!customRole) {
      throw new AppError('Custom role not found', 404)
    }
    if (customRole.isSystemRole) {
      throw new AppError('System roles cannot be assigned as custom role overrides', 400)
    }

    ensurePermissionSetWithinActorScope(
      req.user.permissions,
      customRole.permissions ?? [],
      'You cannot assign a custom role with permissions beyond your own global scope'
    )

    validatedCustomRoleId = String(customRole._id)
  }

  if (role !== undefined) {
    ensurePermissionSetWithinActorScope(
      req.user.permissions,
      getDefaultPermissions(role),
      'You cannot assign a base system role with permissions beyond your own global scope'
    )
  }

  return { role, customRoleId: validatedCustomRoleId }
}

// ——— Reads ———

export const getAllUsers = async (req: any): Promise<any> => {
  const { search, role, isActive, customRoleId } = req.query

  const query: Record<string, unknown> = {}
  const normalizedRole =
    typeof role === 'string' && role.trim().length > 0 ? role.trim() : null
  const normalizedIsActive =
    isActive === 'true' || isActive === 'false' ? isActive : null
  const normalizedCustomRoleId =
    typeof customRoleId === 'string' && customRoleId.trim().length > 0
      ? customRoleId.trim()
      : null

  const safeSearch = sanitizeSearchInput(search)
  if (safeSearch) {
    query.$or = [
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  if (normalizedRole) {
    query.role = normalizedRole
  }

  if (normalizedIsActive) {
    query.isActive = normalizedIsActive === 'true'
  }

  if (normalizedCustomRoleId) {
    query.customRole = normalizedCustomRoleId
  }

  const pagination = parsePagination(req.query as Record<string, unknown>, 10, 100)

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .populate('customRole', 'name description permissions')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    User.countDocuments(query),
  ])

  const serializedUsers = await Promise.all(users.map((user) => serializeUser(user)))
  return {
    users: serializedUsers,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  }
}

export const getUserById = async (id: string): Promise<any> => {
  const cached = await userDetailCache.get(id)
  if (cached) {return cached}

  const user = await User.findById(id)
    .select('-password')
    .populate('customRole', 'name description permissions')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const serialized = await serializeUser(user)
  await userDetailCache.set(id, serialized)
  return serialized
}

// ——— Writes ———

export const createUser = async (req: AuthRequest): Promise<any> => {
  const { email, password, firstName, lastName } = req.body
  const role = req.body.role as UserRole | undefined
  const customRoleId = req.body.customRoleId as string | null | undefined
  const organizationAssignmentsData = req.body.organizationAssignments as
    | import('../utils/organizationAssignment').OrganizationAssignmentInput[]
    | undefined

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError('User with this email already exists', 409)
  }

  const assignment = await validateAssignableRole(req, role, customRoleId)
  const validatedOrganizationAssignments = await validateOrganizationAssignments(
    organizationAssignmentsData,
    req
  )

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: assignment.role ?? UserRole.SUPPORT,
    customRole: assignment.customRoleId ?? undefined,
    isActive: true,
  })

  if (validatedOrganizationAssignments.length > 0) {
    await OrganizationAssignment.insertMany(
      validatedOrganizationAssignments.map((scopedAssignment: Record<string, unknown>) => ({
        user: user._id,
        organizationId: scopedAssignment.organizationId,
        role: scopedAssignment.roleId,
      }))
    )
  }

  const populatedUser = await User.findById(user._id)
    .select('-password')
    .populate('customRole', 'name description permissions')

  const serialized = populatedUser ? await serializeUser(populatedUser) : await serializeUser(user)

  logger.info(`User created: ${user.email} by user ${req.user?.userId}`)
  await userListCache.clear()
  await invalidateDashboardCache()

  return serialized
}

export const updateUser = async (id: string, req: AuthRequest): Promise<any> => {
  ensureProtectedFieldsAbsent(req.body)

  const updates: Record<string, string> = {}
  if (typeof req.body.firstName === 'string') {
    updates.firstName = req.body.firstName
  }
  if (typeof req.body.lastName === 'string') {
    updates.lastName = req.body.lastName
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select('-password')
    .populate('customRole', 'name description permissions')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  logger.info(`User updated: ${id} by user ${req.user?.userId}`)
  await invalidateUser(id)

  return serializeUser(user)
}

export const updateUserRole = async (id: string, req: AuthRequest): Promise<any> => {
  const role = req.body.role as UserRole | undefined
  const customRoleId = req.body.customRoleId as string | null | undefined

  if (role === undefined && customRoleId === undefined) {
    throw new AppError('At least one of role or customRoleId must be provided', 400)
  }

  const targetUser = await User.findById(id)
  if (!targetUser) {
    throw new AppError('User not found', 404)
  }

  const assignment = await validateAssignableRole(req, role, customRoleId)

  if (role !== undefined && role !== targetUser.role) {
    await ensureCanRevokeFullAdmin(targetUser)
    targetUser.role = role
  }

  if (customRoleId !== undefined) {
    targetUser.customRole = assignment.customRoleId
      ? new Types.ObjectId(assignment.customRoleId)
      : undefined
  }

  await targetUser.save()

  const populatedUser = await User.findById(id)
    .select('-password')
    .populate('customRole', 'name description permissions')

  logger.info(`Role updated for user: ${id} by user ${req.user?.userId}`)
  await invalidateUser(id)

  const serialized = populatedUser ? await serializeUser(populatedUser) : await serializeUser(targetUser)
  return serialized
}

export const updateUserStatus = async (id: string, req: AuthRequest): Promise<any> => {
  const { isActive } = req.body as { isActive: boolean }

  if (req.user?.userId === id && isActive === false) {
    throw new AppError('You cannot deactivate your own account', 400)
  }

  const user = await User.findById(id)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (user.role === UserRole.FULL_ADMIN && user.isActive && isActive === false) {
    await ensureCanRevokeFullAdmin(user)
  }

  user.isActive = isActive
  await user.save()

  const populatedUser = await User.findById(id)
    .select('-password')
    .populate('customRole', 'name description permissions')

  logger.info(`User status updated: ${id} by user ${req.user?.userId}`)
  await invalidateUser(id)

  const serialized = populatedUser ? await serializeUser(populatedUser) : await serializeUser(user)
  return serialized
}

export const deleteUser = async (id: string, req: AuthRequest): Promise<void> => {
  if (req.user?.userId === id) {
    throw new AppError('You cannot delete your own account', 400)
  }

  const user = await User.findById(id)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  await ensureCanRevokeFullAdmin(user)
  await user.deleteOne()
  await OrganizationAssignment.deleteMany({ user: id })

  logger.info(`User deleted: ${id} by user ${req.user?.userId}`)
  await invalidateUser(id)
}
