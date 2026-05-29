import Announcement from '../models/Announcement'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import {
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  NewsStatus,
  Permission,
} from '../types'
import logger from '../utils/logger'
import { deleteFromCloudinary } from '../middleware/upload'
import { pushNotificationService } from './push-notification.service'
import { sendEmail, buildContentPublishedEmail } from './email.service'
import {
  buildLegacyPlainText,
  normalizeGalleryExcludingCover,
  normalizeMediaAsset,
  normalizeSections,
  normalizeOfficerItems,
  normalizeAwardItems,
  normalizeAttachmentItems,
} from '../utils/content'
import {
  canReassignOwnership,
  ensureCanManageOwnedContent,
  getAccessibleOrganizationIdsForAuthenticatedUser,
  resolveOwnershipInput,
  validateOwnershipPair,
} from '../utils/organizationScope'
import { attachOrganizationName, attachOrganizationNames } from '../utils/ownedContent'
import { hasGlobalPermission } from '../utils/rbac'
import { sanitizeSearchInput } from '../utils/escapeRegex'
import { parsePagination } from '../utils/pagination'
import {
  shouldResetApprovalOnEdit,
} from '../utils/contentApproval'
import { buildOwnershipFilter, buildUpdatePayload, canViewUnpublishedContent } from './content.service'
import * as approvalService from './content-approval.service'
import { TypedCache } from '../utils/cache'
import { buildListCacheKey, hashScope } from '../utils/cacheHelpers'
import { invalidateDashboardCache } from './dashboard.service'

const ANNOUNCEMENT_EDITABLE_FIELDS = [
  'title',
  'bodyHtml',
  'priority',
  'type',
  'expiresAt',
  'targetAudience',
  'coverImage',
  'gallery',
  'sections',
  'imageUrl',
  'imageId',
  'subtype',
  'effectiveDate',
  'termStart',
  'termEnd',
  'relatedOrganizationId',
  'relatedEventId',
  'approvalSource',
  'contactName',
  'contactEmail',
  'ctaLabel',
  'ctaUrl',
  'officerItems',
  'outgoingOfficerItems',
  'awardItems',
  'attachmentItems',
] as const

const announcementDetailCache = new TypedCache<any>({
  namespace: 'announcement:detail',
  ttlMs: 120_000,
})

const announcementListCache = new TypedCache<any>({
  namespace: 'announcement:list',
  ttlMs: 30_000,
})

const getPublicAnnouncementQuery = () => ({
  status: NewsStatus.PUBLISHED,
  isActive: true,
  $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: new Date() } }],
})

const invalidateAnnouncement = async (id: string, invalidateDashboard = true): Promise<void> => {
  await announcementDetailCache.invalidate(id)
  await announcementListCache.clear()
  if (invalidateDashboard) {
    await invalidateDashboardCache()
  }
}

// ——— Reads ———

export const getAnnouncementById = async (id: string, req: AuthRequest): Promise<any> => {
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')

  if (!announcement) {
    throw new AppError('Announcement not found', 404)
  }

  if (!canViewUnpublishedContent(req, Permission.VIEW_ANNOUNCEMENT)) {
    const matchesPublicState =
      announcement.status === NewsStatus.PUBLISHED &&
      announcement.isActive &&
      (!announcement.expiresAt || announcement.expiresAt >= new Date())

    if (!matchesPublicState) {
      await ensureCanManageOwnedContent(
        req.user,
        Permission.VIEW_ANNOUNCEMENT,
        announcement.ownerType,
        announcement.organizationId ?? null
      )
    }
  }

  const cached = await announcementDetailCache.get(id)
  if (cached) {return cached}

  const serializedAnnouncement = await attachOrganizationName(announcement)
  await announcementDetailCache.set(id, serializedAnnouncement)
  return serializedAnnouncement
}

export const getPublicAnnouncementById = async (id: string): Promise<any> => {
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')

  if (!announcement) {
    throw new AppError('Announcement not found', 404)
  }

  const matchesPublicState =
    announcement.status === NewsStatus.PUBLISHED &&
    announcement.isActive &&
    (!announcement.expiresAt || announcement.expiresAt >= new Date())

  if (!matchesPublicState) {
    throw new AppError('Announcement not found', 404)
  }

  const cached = await announcementDetailCache.get(`public:${id}`)
  if (cached) {return cached}

  const serializedAnnouncement = await attachOrganizationName(announcement)
  await announcementDetailCache.set(`public:${id}`, serializedAnnouncement)
  return serializedAnnouncement
}

export const getAllAnnouncements = async (req: AuthRequest): Promise<any> => {
  const { status, priority, search, ownerType, organizationId, subtype, ctaFilter } = req.query

  const conditions: Record<string, unknown>[] = []
  const requestedOwnerType =
    ownerType === ContentOwnerType.ORGANIZATION
      ? ContentOwnerType.ORGANIZATION
      : ownerType === ContentOwnerType.SYSTEM
        ? ContentOwnerType.SYSTEM
        : undefined
  const requestedOrganizationId =
    typeof organizationId === 'string' && organizationId.trim().length > 0
      ? organizationId.trim().toLowerCase()
      : null

  if (!req.user) {
    conditions.push({
      ...getPublicAnnouncementQuery(),
      ...buildOwnershipFilter(requestedOwnerType, requestedOrganizationId),
    })
  } else if (hasGlobalPermission(req.user, Permission.VIEW_ANNOUNCEMENT)) {
    const adminCondition: Record<string, unknown> = {
      ...buildOwnershipFilter(requestedOwnerType, requestedOrganizationId),
    }
    if (status) {
      adminCondition.status = status
    }
    conditions.push(adminCondition)
  } else if (req.user) {
    const accessibleOrganizationIds = getAccessibleOrganizationIdsForAuthenticatedUser(
      req.user,
      Permission.VIEW_ANNOUNCEMENT
    )

    if (accessibleOrganizationIds.length > 0 && requestedOwnerType !== ContentOwnerType.SYSTEM) {
      const allowedOrganizationIds = requestedOrganizationId
        ? accessibleOrganizationIds.filter((id) => id === requestedOrganizationId)
        : accessibleOrganizationIds

      if (allowedOrganizationIds.length > 0) {
        const scopedCondition: Record<string, unknown> = {
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: { $in: allowedOrganizationIds },
        }
        if (status) {
          scopedCondition.status = status
        }
        conditions.push(scopedCondition)
      } else {
        conditions.push({ _id: null })
      }
    } else {
      conditions.push({ _id: null })
    }
  }

  if (priority) {
    conditions.push({ priority })
  }

  if (subtype && typeof subtype === 'string') {
    conditions.push({ subtype })
  }

  if (ctaFilter === 'has_cta') {
    conditions.push({ ctaLabel: { $exists: true, $ne: null } })
  } else if (ctaFilter === 'no_cta') {
    conditions.push({ $or: [{ ctaLabel: { $exists: false } }, { ctaLabel: null }] })
  }

  const safeSearch = sanitizeSearchInput(search)
  if (safeSearch) {
    conditions.push({
      $or: [
        { title: { $regex: safeSearch, $options: 'i' } },
        { content: { $regex: safeSearch, $options: 'i' } },
        { bodyHtml: { $regex: safeSearch, $options: 'i' } },
      ],
    })
  }
  const query = conditions.length <= 1 ? conditions[0] ?? {} : { $and: conditions }

  const pagination = parsePagination(req.query as Record<string, unknown>, 10, 100)

  const scope = hashScope(req.user, Permission.VIEW_ANNOUNCEMENT)
  const cacheKey = buildListCacheKey(query as Record<string, unknown>, pagination, scope)

  const cachedList = await announcementListCache.get(cacheKey)
  if (cachedList) {return cachedList}

  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Announcement.countDocuments(query),
  ])
  const serializedAnnouncements = await attachOrganizationNames(announcements)

  const result = {
    announcements: serializedAnnouncements,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  }

  await announcementListCache.set(cacheKey, result)
  return result
}

export const getPublicAnnouncements = async (req: any): Promise<any> => {
  const { search, type, ownerType, organizationId } = req.query
  const conditions: Record<string, unknown>[] = [getPublicAnnouncementQuery()]
  const requestedOwnerType =
    ownerType === ContentOwnerType.ORGANIZATION
      ? ContentOwnerType.ORGANIZATION
      : ownerType === ContentOwnerType.SYSTEM
        ? ContentOwnerType.SYSTEM
        : undefined
  const requestedOrganizationId =
    typeof organizationId === 'string' && organizationId.trim().length > 0
      ? organizationId.trim().toLowerCase()
      : null
  const pagination = parsePagination(req.query as Record<string, unknown>, 10, 100)

  if (type) {
    conditions.push({ type })
  }

  if (requestedOwnerType || requestedOrganizationId) {
    conditions.push(buildOwnershipFilter(requestedOwnerType, requestedOrganizationId))
  }

  const safeSearch = sanitizeSearchInput(search)
  if (safeSearch) {
    conditions.push({
      $or: [
        { title: { $regex: safeSearch, $options: 'i' } },
        { content: { $regex: safeSearch, $options: 'i' } },
        { bodyHtml: { $regex: safeSearch, $options: 'i' } },
      ],
    })
  }

  const finalQuery = conditions.length === 1 ? conditions[0] : { $and: conditions }

  const scope = 'public'
  const cacheKey = buildListCacheKey(finalQuery as Record<string, unknown>, pagination, scope)

  const cachedList = await announcementListCache.get(cacheKey)
  if (cachedList) {return cachedList}

  const [announcements, total] = await Promise.all([
    Announcement.find(finalQuery)
      .populate('author', 'firstName lastName email')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Announcement.countDocuments(finalQuery),
  ])
  const serializedAnnouncements = await attachOrganizationNames(announcements)

  const result = {
    announcements: serializedAnnouncements,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  }

  await announcementListCache.set(cacheKey, result)
  return result
}

// ——— Writes ———

export const createAnnouncement = async (req: AuthRequest): Promise<any> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401)
  }

  const {
    title,
    content,
    bodyHtml: rawBodyHtml,
    priority = AnnouncementPriority.MEDIUM,
    type = AnnouncementType.GENERAL,
    expiresAt,
    targetAudience,
    imageUrl,
    imageId,
    coverImage,
    gallery,
    sections,
    subtype,
    effectiveDate,
    termStart,
    termEnd,
    relatedOrganizationId,
    relatedEventId,
    approvalSource,
    contactName,
    contactEmail,
    ctaLabel,
    ctaUrl,
    officerItems,
    outgoingOfficerItems,
    awardItems,
    attachmentItems,
  } = req.body
  const ownership = resolveOwnershipInput(req.body)
  await validateOwnershipPair(ownership.ownerType, ownership.organizationId)
  await ensureCanManageOwnedContent(
    req.user,
    Permission.CREATE_ANNOUNCEMENT,
    ownership.ownerType,
    ownership.organizationId
  )

  const bodyHtml =
    typeof rawBodyHtml === 'string' && rawBodyHtml.trim().length > 0
      ? rawBodyHtml
      : typeof content === 'string'
        ? content
        : ''
  const resolvedCoverImage = normalizeMediaAsset(coverImage, { imageUrl, imageId })

  const announcement = await Announcement.create({
    title,
    content: buildLegacyPlainText(bodyHtml),
    bodyHtml,
    author: req.user.userId,
    ownerType: ownership.ownerType,
    organizationId: ownership.organizationId,
    priority,
    type,
    status: NewsStatus.DRAFT,
    isActive: false,
    expiresAt,
    targetAudience: targetAudience ?? ['all'],
    sections: normalizeSections(sections),
    coverImage: resolvedCoverImage,
    gallery: normalizeGalleryExcludingCover(gallery, resolvedCoverImage),
    imageUrl,
    imageId,
    subtype,
    effectiveDate,
    termStart,
    termEnd,
    relatedOrganizationId,
    relatedEventId,
    approvalSource,
    contactName,
    contactEmail,
    ctaLabel,
    ctaUrl,
    officerItems: normalizeOfficerItems(officerItems),
    outgoingOfficerItems: normalizeOfficerItems(outgoingOfficerItems),
    awardItems: normalizeAwardItems(awardItems),
    attachmentItems: normalizeAttachmentItems(attachmentItems),
  })

  logger.info(`Announcement created: ${announcement._id} by user ${req.user.userId}`)
  await invalidateAnnouncement(String(announcement._id))

  return announcement
}

export const updateAnnouncement = async (id: string, req: AuthRequest): Promise<any> => {
  const existingAnnouncement = await Announcement.findById(id)
  if (!existingAnnouncement) {
    throw new AppError('Announcement not found', 404)
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.EDIT_ANNOUNCEMENT,
    existingAnnouncement.ownerType,
    existingAnnouncement.organizationId ?? null
  )

  const currentOwnership = {
    ownerType: existingAnnouncement.ownerType,
    organizationId: existingAnnouncement.organizationId ?? null,
  }
  const nextOwnership = resolveOwnershipInput({
    ownerType: req.body.ownerType ?? currentOwnership.ownerType,
    organizationId:
      req.body.organizationId !== undefined
        ? req.body.organizationId
        : currentOwnership.organizationId,
  })
  await validateOwnershipPair(nextOwnership.ownerType, nextOwnership.organizationId)

  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }
  const canMoveOwnership = await canReassignOwnership(
    req.user,
    currentOwnership.ownerType,
    currentOwnership.organizationId,
    nextOwnership.ownerType,
    nextOwnership.organizationId,
    Permission.EDIT_ANNOUNCEMENT
  )

  if (!canMoveOwnership) {
    throw new AppError('You cannot reassign ownership for this announcement', 403)
  }

  const updates = buildUpdatePayload(req.body, ANNOUNCEMENT_EDITABLE_FIELDS)
  const bodyHtml =
    typeof updates.bodyHtml === 'string'
      ? updates.bodyHtml
      : typeof req.body.content === 'string'
        ? req.body.content
        : undefined
  const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl : undefined
  const imageId = typeof req.body.imageId === 'string' ? req.body.imageId : undefined

  if (bodyHtml !== undefined) {
    updates.bodyHtml = bodyHtml
    ;(updates as Record<string, unknown>).content = buildLegacyPlainText(bodyHtml)
  }

  if (
    req.body.coverImage !== undefined ||
    req.body.imageUrl !== undefined ||
    req.body.imageId !== undefined
  ) {
    updates.coverImage = normalizeMediaAsset(req.body.coverImage, { imageUrl, imageId })
    updates.imageUrl = imageUrl
    updates.imageId = imageId
  }

  if (existingAnnouncement.imageId && imageId && existingAnnouncement.imageId !== imageId) {
    await deleteFromCloudinary(existingAnnouncement.imageId)
  }

  if (req.body.gallery !== undefined) {
    const effectiveCoverImage =
      (updates.coverImage as typeof existingAnnouncement.coverImage | undefined) ??
      existingAnnouncement.coverImage
    updates.gallery = normalizeGalleryExcludingCover(req.body.gallery, effectiveCoverImage)
  }

  if (req.body.sections !== undefined) {
    updates.sections = normalizeSections(req.body.sections)
  }

  if (req.body.officerItems !== undefined) {
    updates.officerItems = normalizeOfficerItems(req.body.officerItems)
  }

  if (req.body.outgoingOfficerItems !== undefined) {
    updates.outgoingOfficerItems = normalizeOfficerItems(req.body.outgoingOfficerItems)
  }

  if (req.body.awardItems !== undefined) {
    updates.awardItems = normalizeAwardItems(req.body.awardItems)
  }

  if (req.body.attachmentItems !== undefined) {
    updates.attachmentItems = normalizeAttachmentItems(req.body.attachmentItems)
  }

  ;(updates as Record<string, unknown>).ownerType = nextOwnership.ownerType
  ;(updates as Record<string, unknown>).organizationId = nextOwnership.organizationId

  if (shouldResetApprovalOnEdit(existingAnnouncement.status)) {
    ;(updates as Record<string, unknown>).status = NewsStatus.DRAFT
    ;(updates as Record<string, unknown>).approvalSummary = undefined
  }

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName email')

  if (!announcement) {
    throw new AppError('Announcement not found', 404)
  }

  logger.info(`Announcement updated: ${id} by user ${req.user?.userId}`)
  await invalidateAnnouncement(id)

  return announcement
}

export const deleteAnnouncement = async (id: string, req: AuthRequest): Promise<void> => {
  const existingAnnouncement = await Announcement.findById(id)
  if (!existingAnnouncement) {
    throw new AppError('Announcement not found', 404)
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.DELETE_ANNOUNCEMENT,
    existingAnnouncement.ownerType,
    existingAnnouncement.organizationId ?? null
  )

  const announcement = await Announcement.findByIdAndDelete(id)

  if (!announcement) {
    throw new AppError('Announcement not found', 404)
  }

  if (announcement.imageId) {
    await deleteFromCloudinary(announcement.imageId)
  }

  logger.info(`Announcement deleted: ${id} by user ${req.user?.userId}`)
  await invalidateAnnouncement(id)
}

// ——— Approval workflow ———

export const submitAnnouncementForApproval = async (id: string, req: AuthRequest): Promise<any> => {
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.submitForApproval(
    id, req.user, announcement, 'announcement', Permission.SUBMIT_CONTENT_FOR_APPROVAL,
    NewsStatus.DRAFT, NewsStatus.PENDING_APPROVAL,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  )
  await announcementDetailCache.invalidate(id)
  return updated
}

export const approveAnnouncement = async (id: string, req: AuthRequest): Promise<any> => {
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.approve(
    id, req.user, announcement, 'announcement',
    NewsStatus.PENDING_APPROVAL, NewsStatus.APPROVED,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  )
  await invalidateAnnouncement(id)
  return updated
}

export const rejectAnnouncement = async (id: string, req: AuthRequest): Promise<any> => {
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : ''
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.reject(
    id, req.user, announcement, 'announcement',
    NewsStatus.PENDING_APPROVAL, NewsStatus.REJECTED, reason,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  )
  await announcementDetailCache.invalidate(id)
  return updated
}

export const publishAnnouncement = async (id: string, req: AuthRequest): Promise<any> => {
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.publish(
    id, req.user, announcement, 'announcement', Permission.PUBLISH_ANNOUNCEMENT, NewsStatus.PUBLISHED,
    (item) => {
      (item as Record<string, unknown>).isActive = true
    }
  )

  logger.info(`Announcement published: ${id} by user ${req.user?.userId}`)

  const a = updated as Record<string, unknown>
  const frontendUrl = process.env.FRONTEND_URL ?? 'https://cict.edu.ph'
  const annUrl = `${frontendUrl}/announcements/${id}`
  const emailContent = buildContentPublishedEmail('announcement', String(a.title ?? ''), annUrl)
  await sendEmail({ to: process.env.NOTIFICATION_EMAIL ?? '', ...emailContent })
  pushNotificationService.sendToAll({
    title: `📢 ${a.title as string}`,
    body: typeof a.content === 'string'
      ? a.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
      : 'New announcement from CICT.',
    data: {
      type: 'announcement',
      id: String(a._id),
      priority: a.priority as string,
    },
  })

  await invalidateAnnouncement(id)
  return updated
}

export const archiveAnnouncement = async (id: string, req: AuthRequest): Promise<any> => {
  const announcement = await Announcement.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.archive(
    id, req.user, announcement, 'announcement', Permission.ARCHIVE_ANNOUNCEMENT,
    NewsStatus.PUBLISHED, NewsStatus.ARCHIVED,
    (item) => { (item as Record<string, unknown>).isActive = false }
  )

  logger.info(`Announcement archived: ${id} by user ${req.user?.userId}`)
  await invalidateAnnouncement(id)
  return updated
}
