import crypto from 'crypto'
import Organization from '../models/Organization'
import OrganizationMember from '../models/OrganizationMember'
import OrganizationAssignment from '../models/OrganizationAssignment'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { Permission } from '../types'
import {
  canAccessOrganizationScope,
} from '../utils/organizationScope'
import {
  getScopedOrganizationIdsForPermissions,
  hasAnyGlobalPermission,
  ORGANIZATION_MANAGEMENT_PERMISSIONS,
} from '../utils/rbac'
import { TypedCache } from '../utils/cache'
import { invalidateDashboardCache } from './dashboard.service'

const ORGANIZATION_MUTABLE_FIELDS = [
  'id', 'name', 'fullName', 'description', 'longDescription', 'logo', 'banner',
  'established', 'mission', 'vision', 'values', 'achievements', 'color',
  'email', 'phone', 'website', 'facebookUrl', 'twitterUrl', 'instagramUrl',
  'tiktokUrl', 'linkedinUrl', 'building', 'room', 'campus', 'advisorName',
  'advisorEmail', 'moderatorName', 'moderatorEmail', 'organizationType', 'tags',
  'gallery', 'seoDescription', 'isActive', 'tagline', 'officialEmail',
  'socialLinks', 'adviserItems', 'officeLocation', 'meetingSchedule',
  'membershipSize', 'joinRequirements', 'joinSteps', 'joinUrl', 'benefits',
  'programs', 'flagshipEvents', 'partnerItems', 'committeeItems',
  'structuredAchievements',
] as const

const orgDetailCache = new TypedCache<any>({ namespace: 'org:detail', ttlMs: 300_000 })
const orgListCache = new TypedCache<any>({ namespace: 'org:list', ttlMs: 300_000 })
const orgAdminCache = new TypedCache<any>({ namespace: 'org:admin', ttlMs: 60_000 })

const invalidateOrganization = async (id: string): Promise<void> => {
  await orgDetailCache.invalidate(id)
  await orgListCache.clear()
  await orgAdminCache.clear()
  await invalidateDashboardCache()
}

const buildOrganizationPayload = (body: Record<string, unknown>) => {
  const updates: Partial<Record<(typeof ORGANIZATION_MUTABLE_FIELDS)[number], unknown>> = {}
  for (const field of ORGANIZATION_MUTABLE_FIELDS) {
    if (body[field] !== undefined) {
      updates[field] = field === 'id' && typeof body[field] === 'string'
        ? body[field].trim().toLowerCase()
        : body[field]
    }
  }
  return updates
}

const attachOrganizationAdminAssignments = async <T extends { id: string }>(
  organizations: T[]
): Promise<Array<T & { adminAssignments: Array<Record<string, unknown>> }>> => {
  if (organizations.length === 0) {return []}

  const organizationIds = organizations.map((organization) => organization.id)
  const assignments = await OrganizationAssignment.find({ organizationId: { $in: organizationIds } })
    .populate('user', 'firstName lastName email')
    .populate('role', 'name permissions')
    .lean()

  const assignmentsByOrganization = new Map<string, Array<Record<string, unknown>>>()
  for (const assignment of assignments) {
    const user = assignment.user && typeof assignment.user === 'object' ? assignment.user : null
    const role = assignment.role && typeof assignment.role === 'object' ? assignment.role : null

    const serializedAssignment = {
      id: String(assignment._id),
      organizationId: assignment.organizationId,
      roleId: role?._id ? String(role._id) : null,
      roleName: role?.name ?? 'Scoped Role',
      permissions: role?.permissions ?? [],
      userId: user?._id ? String(user._id) : null,
      userName: user ? `${user.firstName} ${user.lastName}`.trim() : null,
      userEmail: user?.email ?? null,
    }

    const current = assignmentsByOrganization.get(assignment.organizationId) ?? []
    current.push(serializedAssignment)
    assignmentsByOrganization.set(assignment.organizationId, current)
  }

  return organizations.map((organization) => ({
    ...organization,
    adminAssignments: assignmentsByOrganization.get(organization.id) ?? [],
  }))
}

const ensureCanManageOrganization = (
  req: AuthRequest,
  organizationId: string,
  permission: Permission
) => {
  if (!req.user) {throw new AppError('User not authenticated', 401)}
  if (!canAccessOrganizationScope(req.user, organizationId, permission)) {
    throw new AppError('You do not have access to manage this organization scope', 403)
  }
}

const getAdminVisibleOrganizationIds = (req: AuthRequest): string[] => {
  if (!req.user) {return []}
  return getScopedOrganizationIdsForPermissions(
    req.user.organizationAssignments,
    ORGANIZATION_MANAGEMENT_PERMISSIONS
  )
}

// ——— Public member lookup ———

export const getPublicMember = async (memberId: string): Promise<{ member: unknown; organization: unknown; teamMembers: unknown[] }> => {
  const member = await OrganizationMember.findOne({ id: memberId }).lean()
  if (!member) {throw new AppError('Member not found', 404)}

  const organization = await Organization.findById(member.organizationId)
    .select('id name fullName color mission vision values description')
    .lean()

  const teamMembers = await OrganizationMember.find({
    organizationId: member.organizationId,
    id: { $ne: memberId },
  })
    .sort({ sortOrder: 1 })
    .limit(10)
    .lean()

  return { member, organization, teamMembers }
}

// ——— Reads ———

export const getOrganizations = async (): Promise<unknown[]> => {
  const cached = await orgListCache.get('all')
  if (cached) {return cached}

  const organizations = await Organization.find().lean()
  await orgListCache.set('all', organizations)
  return organizations
}

export const getOrganization = async (id: string): Promise<any> => {
  const cached = await orgDetailCache.get(id)
  if (cached) {return cached}

  const organization = await Organization.findOne({ id }).lean()
  if (!organization) {throw new AppError('Organization not found', 404)}

  await orgDetailCache.set(id, organization)
  return organization
}

export const getAdminOrganizations = async (req: AuthRequest): Promise<unknown[]> => {
  if (!req.user) {throw new AppError('User not authenticated', 401)}

  const scopedOrganizationIds = getAdminVisibleOrganizationIds(req)
  const hasOrganizationManagementAccess =
    hasAnyGlobalPermission(req.user, ORGANIZATION_MANAGEMENT_PERMISSIONS) ||
    scopedOrganizationIds.length > 0

  if (!hasOrganizationManagementAccess) {
    throw new AppError('You do not have access to organization administration', 403)
  }

  const cacheKey = `admin:${JSON.stringify(scopedOrganizationIds.sort())}`
  const cached = await orgAdminCache.get(cacheKey)
  if (cached) {return cached}

  const query = hasAnyGlobalPermission(req.user, ORGANIZATION_MANAGEMENT_PERMISSIONS)
    ? {}
    : scopedOrganizationIds.length > 0
      ? { id: { $in: scopedOrganizationIds } }
      : { _id: null }

  const organizations = await Organization.find(query).lean()
  const organizationsWithAssignments = await attachOrganizationAdminAssignments(organizations)

  await orgAdminCache.set(cacheKey, organizationsWithAssignments)
  return organizationsWithAssignments
}

export const getAdminOrganization = async (req: AuthRequest, id: string): Promise<any> => {
  if (!req.user) {throw new AppError('User not authenticated', 401)}

  const organization = await Organization.findOne({ id }).lean()
  if (!organization) {throw new AppError('Organization not found', 404)}

  const canViewOrganization =
    hasAnyGlobalPermission(req.user, ORGANIZATION_MANAGEMENT_PERMISSIONS) ||
    getAdminVisibleOrganizationIds(req).includes(organization.id)

  if (!canViewOrganization) {
    throw new AppError('You do not have access to this organization scope', 403)
  }

  const [organizationWithAssignments] = await attachOrganizationAdminAssignments([organization])
  return organizationWithAssignments
}

export const getAdminOrganizationAssignments = async (req: AuthRequest, id: string): Promise<any> => {
  if (!req.user) {throw new AppError('User not authenticated', 401)}

  const organization = await Organization.findOne({ id }).select('id').lean()
  if (!organization) {throw new AppError('Organization not found', 404)}

  const canViewAssignments =
    hasAnyGlobalPermission(req.user, ORGANIZATION_MANAGEMENT_PERMISSIONS) ||
    getAdminVisibleOrganizationIds(req).includes(organization.id)

  if (!canViewAssignments) {
    throw new AppError('You do not have access to this organization scope', 403)
  }

  const [organizationWithAssignments] = await attachOrganizationAdminAssignments([{ id: organization.id }])
  return organizationWithAssignments?.adminAssignments ?? []
}

// ——— Writes ———

export const createOrganization = async (req: AuthRequest): Promise<any> => {
  const payload = buildOrganizationPayload(req.body)
  const organizationId = payload.id as string | undefined

  if (!organizationId) {throw new AppError('Organization slug is required', 400)}

  const existingOrganization = await Organization.findOne({ id: organizationId })
  if (existingOrganization) {throw new AppError('Organization slug already exists', 409)}

  const organization = await Organization.create({
    ...(payload as Record<string, unknown>),
    members: [],
  })

  await invalidateOrganization(organizationId)
  return organization
}

export const updateOrganization = async (req: AuthRequest, id: string): Promise<any> => {
  const organization = await Organization.findOne({ id })
  if (!organization) {throw new AppError('Organization not found', 404)}

  ensureCanManageOrganization(req, organization.id, Permission.EDIT_ORGANIZATION)

  const updates = buildOrganizationPayload(req.body)
  const requestedSlug = updates.id as string | undefined

  if (requestedSlug && requestedSlug !== organization.id) {
    const slugConflict = await Organization.findOne({ id: requestedSlug })
    if (slugConflict) {throw new AppError('Organization slug already exists', 409)}
  }

  const updatedOrg = await Organization.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true, runValidators: true }
  )

  await invalidateOrganization(id)
  return updatedOrg
}

export const deleteOrganization = async (req: AuthRequest, id: string): Promise<void> => {
  ensureCanManageOrganization(req, id, Permission.DELETE_ORGANIZATION)
  const organization = await Organization.findOneAndDelete({ id })
  if (!organization) {throw new AppError('Organization not found', 404)}

  await invalidateOrganization(id)
}

export const addMember = async (req: AuthRequest, orgId: string): Promise<any> => {
  const body = req.body

  const organization = await Organization.findOne({ id: orgId })
  if (!organization) {throw new AppError('Organization not found', 404)}

  ensureCanManageOrganization(req, organization.id, Permission.CREATE_MEMBER)

  const member = await OrganizationMember.create({
    organizationId: organization._id,
    id: body.id ?? crypto.randomUUID(),
    name: body.name,
    position: body.position,
    photo: body.photo,
    bio: body.bio,
    joinedDate: body.joinedDate,
    achievements: body.achievements ?? [],
    responsibilities: body.responsibilities ?? [],
    skills: body.skills ?? [],
    timeline: body.timeline ?? [],
    gallery: body.gallery ?? [],
    social: body.social ?? {},
    phone: body.phone,
    personalEmail: body.personalEmail,
    program: body.program,
    yearLevel: body.yearLevel,
    startDate: body.startDate,
    endDate: body.endDate,
    memberType: body.memberType,
    status: body.status ?? 'active',
    sortOrder: body.sortOrder ?? 0,
    batch: body.batch,
    termStart: body.termStart,
    termEnd: body.termEnd,
    leadershipStatus: body.leadershipStatus,
    course: body.course,
    department: body.department,
    committee: body.committee,
    displayOrder: body.displayOrder,
    isAdviser: body.isAdviser,
    contactNumber: body.contactNumber,
    projectItems: body.projectItems ?? [],
    milestoneItems: body.milestoneItems ?? [],
  })

  await invalidateOrganization(orgId)
  return member
}

export const updateMember = async (req: AuthRequest, orgId: string, memberId: string): Promise<any> => {
  const memberUpdate = req.body

  const organization = await Organization.findOne({ id: orgId })
  if (!organization) {throw new AppError('Organization not found', 404)}

  ensureCanManageOrganization(req, organization.id, Permission.EDIT_MEMBER)

  const member = await OrganizationMember.findOne({
    organizationId: organization._id,
    id: memberId,
  })

  if (!member) {throw new AppError('Member not found', 404)}

  Object.assign(member, memberUpdate)
  await member.save()

  await invalidateOrganization(orgId)
  return member
}

export const deleteMember = async (req: AuthRequest, orgId: string, memberId: string): Promise<void> => {
  const organization = await Organization.findOne({ id: orgId })
  if (!organization) {throw new AppError('Organization not found', 404)}

  ensureCanManageOrganization(req, organization.id, Permission.DELETE_MEMBER)

  const member = await OrganizationMember.findOneAndDelete({
    organizationId: organization._id,
    id: memberId,
  })

  if (!member) {throw new AppError('Member not found', 404)}

  await invalidateOrganization(orgId)
}

export const uploadImage = async (req: AuthRequest): Promise<any> => {
  if (!req.body.imageUrl) {throw new AppError('No image uploaded', 400)}
  return { imageUrl: req.body.imageUrl, imageId: req.body.imageId }
}
