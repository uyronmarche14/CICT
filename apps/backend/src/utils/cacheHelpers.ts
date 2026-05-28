import { type IAuthenticatedUser, Permission } from '../types'
import { hasGlobalPermission } from './rbac'

export const buildListCacheKey = (
  filters: Record<string, unknown>,
  pagination: { page: number; limit: number; skip: number },
  scope: string
): string => {
  const sorted = Object.keys(filters).sort().reduce((acc, k) => {
    acc[k] = filters[k]
    return acc
  }, {} as Record<string, unknown>)
  return `${scope}:${JSON.stringify(sorted)}:${pagination.page}:${pagination.limit}`
}

export const hashScope = (user: IAuthenticatedUser | null | undefined, viewPermission: Permission): string => {
  if (!user) {return 'public'}
  const orgIds = user.organizationAssignments?.map(a => a.organizationId).sort() ?? []
  const isGlobal = hasGlobalPermission(user, viewPermission)
  if (isGlobal) {return 'global'}
  return `scope_${orgIds.join(',')}`
}
