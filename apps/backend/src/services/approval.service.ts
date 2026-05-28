import Event from '../models/Event'
import News from '../models/News'
import Announcement from '../models/Announcement'
import ContentApprovalAction from '../models/ContentApprovalAction'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { getAccessibleOrganizationIdsForAuthenticatedUser } from '../utils/organizationScope'
import { hasGlobalPermission } from '../utils/rbac'
import { ContentOwnerType, Permission } from '../types'
import { TypedCache } from '../utils/cache'

const approvalCache = new TypedCache<any>({ namespace: 'approval', ttlMs: 30_000 })

export const invalidateApprovalCache = async (): Promise<void> => {
  await approvalCache.clear()
}

export const getPendingApprovals = async (req: AuthRequest): Promise<any> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
  const type = (req.query.type as string) ?? 'all'
  const skip = (page - 1) * limit

  if (!req.user) {
    throw new AppError('User not authenticated', 401)
  }
  const user = req.user
  const isGlobalApprover = hasGlobalPermission(user, Permission.APPROVE_CONTENT) || hasGlobalPermission(user, Permission.REJECT_CONTENT)
  const accessibleOrgIds = getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.APPROVE_CONTENT)
  const accessibleOrgIdsForReject = getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.REJECT_CONTENT)
  const allAccessibleOrgIds = [...new Set([...accessibleOrgIds, ...accessibleOrgIdsForReject])]

  const buildScopeFilter = (ownerTypeField: string, orgIdField: string): Record<string, unknown> => {
    if (isGlobalApprover) {return {}}
    if (allAccessibleOrgIds.length === 0) {return { [ownerTypeField]: ContentOwnerType.SYSTEM, [orgIdField]: { $exists: false } }}
    return {
      $or: [
        { [ownerTypeField]: ContentOwnerType.SYSTEM },
        { [ownerTypeField]: ContentOwnerType.ORGANIZATION, [orgIdField]: { $in: allAccessibleOrgIds } },
      ],
    }
  }

  const pendingStatus = 'pending_approval'

  const mapItem = (i: any, contentType: string) => ({
    _id: i._id.toString(),
    contentType,
    contentId: i._id.toString(),
    title: i.title,
    status: i.status,
    submittedAt: i.approvalSummary?.submittedAt?.toISOString() ?? i.createdAt.toISOString(),
    submittedBy: { _id: i.approvalSummary?.submittedBy ?? '', firstName: '', lastName: '' },
    organizationId: i.organizationId ?? null,
    ownerType: i.ownerType,
  })

  const fetchItems = async () => {
    if (type !== 'all' && type !== 'events') {return { items: [], total: 0 }}
    const scopeFilter = buildScopeFilter('ownerType', 'organizationId')
    const [items, total] = await Promise.all([
      Event.find({ status: pendingStatus, ...scopeFilter })
        .select('title ownerType organizationId approvalSummary createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Event.countDocuments({ status: pendingStatus, ...scopeFilter }),
    ])
    return { items: items.map((i) => mapItem(i, 'event')), total }
  }

  const fetchNews = async () => {
    if (type !== 'all' && type !== 'news') {return { items: [], total: 0 }}
    const scopeFilter = buildScopeFilter('ownerType', 'organizationId')
    const [items, total] = await Promise.all([
      News.find({ status: pendingStatus, ...scopeFilter })
        .select('title ownerType organizationId approvalSummary createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      News.countDocuments({ status: pendingStatus, ...scopeFilter }),
    ])
    return { items: items.map((i) => mapItem(i, 'news')), total }
  }

  const fetchAnnouncements = async () => {
    if (type !== 'all' && type !== 'announcements') {return { items: [], total: 0 }}
    const scopeFilter = buildScopeFilter('ownerType', 'organizationId')
    const [items, total] = await Promise.all([
      Announcement.find({ status: pendingStatus, ...scopeFilter })
        .select('title ownerType organizationId approvalSummary createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Announcement.countDocuments({ status: pendingStatus, ...scopeFilter }),
    ])
    return { items: items.map((i) => mapItem(i, 'announcement')), total }
  }

  const [events, news, announcements] = await Promise.all([
    fetchItems(),
    fetchNews(),
    fetchAnnouncements(),
  ])

  const allItems = [...events.items, ...news.items, ...announcements.items].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )

  const total = events.total + news.total + announcements.total
  const totalPages = Math.ceil(total / limit)
  const paginatedItems = allItems.slice(skip, skip + limit)

  return { items: paginatedItems, pagination: { page, limit, total, pages: Math.max(1, totalPages) } }
}

export const getApprovalStats = async (req: AuthRequest): Promise<any> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401)
  }
  const user = req.user
  const isGlobalApprover = hasGlobalPermission(user, Permission.APPROVE_CONTENT) || hasGlobalPermission(user, Permission.REJECT_CONTENT)
  const accessibleOrgIds = [...new Set([
    ...getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.APPROVE_CONTENT),
    ...getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.REJECT_CONTENT),
  ])]

  const buildCountFilter = (): Record<string, unknown> => {
    if (isGlobalApprover || accessibleOrgIds.length === 0) {return { status: 'pending_approval' }}
    return {
      status: 'pending_approval',
      $or: [
        { ownerType: ContentOwnerType.SYSTEM },
        { ownerType: ContentOwnerType.ORGANIZATION, organizationId: { $in: accessibleOrgIds } },
      ],
    }
  }

  const filter = buildCountFilter()
  const [events, news, announcements] = await Promise.all([
    Event.countDocuments(filter),
    News.countDocuments(filter),
    Announcement.countDocuments(filter),
  ])

  const result = { pending: events + news + announcements, byType: { events, news, announcements } }
  return result
}

export const getApprovalHistory = async (contentType: string, contentId: string): Promise<any> => {
  const validTypes = ['news', 'announcement', 'event']
  if (!validTypes.includes(contentType)) {
    throw { status: 400, message: 'Invalid content type' }
  }

  const actions = await ContentApprovalAction.find({ contentType: contentType as 'news' | 'announcement' | 'event', contentId })
    .populate('actorUserId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .lean()

  return actions.map((a: any) => ({
    action: a.action,
    actorUserId: a.actorUserId && typeof a.actorUserId === 'object' && 'firstName' in a.actorUserId
      ? a.actorUserId._id.toString()
      : a.actorUserId?.toString() ?? '',
    actorDisplayName: a.actorUserId && typeof a.actorUserId === 'object' && 'firstName' in a.actorUserId
      ? `${a.actorUserId.firstName} ${a.actorUserId.lastName}`
      : 'Unknown',
    timestamp: a.createdAt?.toISOString() ?? new Date().toISOString(),
    reason: a.reason,
    comment: a.comment,
    fromStatus: a.fromStatus ?? '',
    toStatus: a.toStatus ?? '',
  }))
}
