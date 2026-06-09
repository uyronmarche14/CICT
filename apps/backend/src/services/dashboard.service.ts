import Announcement from '../models/Announcement'
import Event from '../models/Event'
import News from '../models/News'
import Organization from '../models/Organization'
import Role from '../models/Role'
import Student from '../models/Student'
import User from '../models/User'
import { TypedCache } from '../utils/cache'
import { getAccessibleOrganizationIdsForAuthenticatedUser } from '../utils/organizationScope'
import { hasGlobalPermission } from '../utils/rbac'
import { type IAuthenticatedUser, Permission } from '../types'

type DashboardCardKey =
  | 'users'
  | 'students'
  | 'news'
  | 'announcements'
  | 'roles'
  | 'organizations'
  | 'events'

export interface DashboardSummary {
  cards: Record<DashboardCardKey, number>
  visibleModules: DashboardCardKey[]
}

const dashboardCache = new TypedCache<DashboardSummary>({
  namespace: 'dashboard',
  ttlMs: 30_000,
})

let lastInvalidation = 0
const MIN_INTERVAL_MS = 10_000

export const invalidateDashboardCache = async (): Promise<void> => {
  const now = Date.now()
  if (now - lastInvalidation < MIN_INTERVAL_MS) {return}
  lastInvalidation = now
  await dashboardCache.clear()
}

export const getDashboardSummary = async (
  currentUser: IAuthenticatedUser
): Promise<DashboardSummary> => {
  const cacheKey = `summary:${currentUser.userId}`
  const cached = await dashboardCache.get(cacheKey)
  if (cached) {return cached}

  const scopedOrganizationIdsByPermission = new Map<Permission, string[]>()
  const getScopedOrganizationIds = (permission: Permission) => {
    if (!scopedOrganizationIdsByPermission.has(permission)) {
      scopedOrganizationIdsByPermission.set(
        permission,
        getAccessibleOrganizationIdsForAuthenticatedUser(currentUser, permission)
      )
    }
    return scopedOrganizationIdsByPermission.get(permission) ?? []
  }

  const hasScopedModuleAccess = (permission: Permission) =>
    getScopedOrganizationIds(permission).length > 0

  const visibleModules = (currentUser.visibleAdminModules ?? []).filter(
    (module): module is DashboardCardKey => module !== 'dashboard' && module !== 'faq' && module !== 'logs' && module !== 'approvals' && module !== 'settings' && module !== 'processes'
  )

  const countTasks: Partial<Record<DashboardCardKey, Promise<number>>> = {}

  if (hasGlobalPermission(currentUser, Permission.VIEW_USERS)) {
    countTasks.users = User.countDocuments()
  }
  if (hasGlobalPermission(currentUser, Permission.VIEW_STUDENT)) {
    countTasks.students = Student.countDocuments()
  }
  if (hasGlobalPermission(currentUser, Permission.VIEW_NEWS)) {
    countTasks.news = News.countDocuments()
  } else if (hasScopedModuleAccess(Permission.VIEW_NEWS)) {
    countTasks.news = News.countDocuments({
      ownerType: 'organization',
      organizationId: { $in: getScopedOrganizationIds(Permission.VIEW_NEWS) },
    })
  }
  if (hasGlobalPermission(currentUser, Permission.VIEW_ANNOUNCEMENT)) {
    countTasks.announcements = Announcement.countDocuments()
  } else if (hasScopedModuleAccess(Permission.VIEW_ANNOUNCEMENT)) {
    countTasks.announcements = Announcement.countDocuments({
      ownerType: 'organization',
      organizationId: { $in: getScopedOrganizationIds(Permission.VIEW_ANNOUNCEMENT) },
    })
  }
  if (hasGlobalPermission(currentUser, Permission.VIEW_ROLE)) {
    countTasks.roles = Role.countDocuments()
  }
  if (hasGlobalPermission(currentUser, Permission.VIEW_ORGANIZATION)) {
    countTasks.organizations = Organization.countDocuments()
  } else {
    const scopedOrganizationIds = Object.entries(
      currentUser.scopedAdminModulesByOrganization ?? {}
    )
      .filter(([, modules]) => modules.includes('organizations'))
      .map(([organizationId]) => organizationId)

    if (scopedOrganizationIds.length > 0) {
      countTasks.organizations = Organization.countDocuments({
        id: { $in: scopedOrganizationIds },
      })
    }
  }
  if (hasGlobalPermission(currentUser, Permission.VIEW_EVENT)) {
    countTasks.events = Event.countDocuments()
  } else if (hasScopedModuleAccess(Permission.VIEW_EVENT)) {
    countTasks.events = Event.countDocuments({
      ownerType: 'organization',
      organizationId: { $in: getScopedOrganizationIds(Permission.VIEW_EVENT) },
    })
  }

  const resolvedCounts = await Promise.all(
    Object.entries(countTasks).map(async ([key, task]) => [key, await task] as const)
  )

  const cards: Record<DashboardCardKey, number> = {
    users: 0,
    students: 0,
    news: 0,
    announcements: 0,
    roles: 0,
    organizations: 0,
    events: 0,
  }

  for (const [key, count] of resolvedCounts) {
    cards[key as DashboardCardKey] = count
  }

  const summary: DashboardSummary = { cards, visibleModules }
  await dashboardCache.set(cacheKey, summary)
  return summary
}
