import News from '../models/News'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import {
  ContentOwnerType,
  NewsStatus,
  Permission,
} from '../types'
import logger from '../utils/logger'
import { sanitizeSearchInput } from '../utils/escapeRegex'
import { deleteFromCloudinary } from '../middleware/upload'
import { pushNotificationService } from './push-notification.service'
import { sendEmail, buildContentPublishedEmail } from './email.service'
import {
  buildLegacyPlainText,
  normalizeGalleryExcludingCover,
  normalizeMediaAsset,
  normalizeSections,
  normalizeAttachmentItems,
  normalizeReferenceLinks,
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
import {
  shouldResetApprovalOnEdit,
} from '../utils/contentApproval'
import { buildOwnershipFilter, buildUpdatePayload, canViewUnpublishedContent } from './content.service'
import * as approvalService from './content-approval.service'
import { parsePagination } from '../utils/pagination'
import { TypedCache } from '../utils/cache'
import { buildListCacheKey, hashScope } from '../utils/cacheHelpers'
import { invalidateDashboardCache } from './dashboard.service'
import { ensureContentExists, ensureOrganizationsExist, ensureReferenceValuesAllowed } from './lookup.service'

const NEWS_EDITABLE_FIELDS = [
  'title',
  'bodyHtml',
  'excerpt',
  'tags',
  'coverImage',
  'gallery',
  'sections',
  'imageUrl',
  'imageId',
  'category',
  'featured',
  'pinned',
  'sourceUrl',
  'referenceLinks',
  'attachmentItems',
  'readingTime',
  'authorDisplayName',
  'authorRole',
  'associatedEventId',
  'associatedOrganizationId',
  'spotlightLabel',
  'seoDescription',
  'canonicalSlug',
  'relatedArticleIds',
] as const

const newsDetailCache = new TypedCache<unknown>({
  namespace: 'news:detail',
  ttlMs: 120_000,
})

const newsListCache = new TypedCache<any>({
  namespace: 'news:list',
  ttlMs: 30_000,
})

const invalidateNews = async (id: string, invalidateDashboard = true): Promise<void> => {
  await newsDetailCache.invalidate(id)
  await newsListCache.clear()
  if (invalidateDashboard) {
    await invalidateDashboardCache()
  }
}

// ——— Reads ———

export const getNewsById = async (id: string, req: AuthRequest): Promise<unknown> => {
  const news = await News.findById(id).populate('author', 'firstName lastName email')

  if (!news) {
    throw new AppError('News article not found', 404)
  }

  if (!canViewUnpublishedContent(req, Permission.VIEW_NEWS)) {
    if (news.status !== NewsStatus.PUBLISHED) {
      await ensureCanManageOwnedContent(
        req.user,
        Permission.VIEW_NEWS,
        news.ownerType,
        news.organizationId ?? null
      )
    }
  }

  const cached = await newsDetailCache.get(id)
  if (cached) {return cached}

  const serializedNews = await attachOrganizationName(news)
  await newsDetailCache.set(id, serializedNews)
  return serializedNews
}

export const getAllNews = async (req: AuthRequest): Promise<{
  news: unknown[]
  pagination: { page: number; limit: number; total: number; pages: number }
}> => {
  const { status, search, ownerType, organizationId, category, featured } = req.query

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
      status: NewsStatus.PUBLISHED,
      ...buildOwnershipFilter(requestedOwnerType, requestedOrganizationId),
    })
  } else if (hasGlobalPermission(req.user, Permission.VIEW_NEWS)) {
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
      Permission.VIEW_NEWS
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

  if (category && typeof category === 'string') {
    conditions.push({ category })
  }

  if (featured === 'true') {
    conditions.push({ featured: true })
  } else if (featured === 'false') {
    conditions.push({ featured: { $ne: true } })
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

  const scope = hashScope(req.user, Permission.VIEW_NEWS)
  const cacheKey = buildListCacheKey(query as Record<string, unknown>, pagination, scope)

  const cachedList = await newsListCache.get(cacheKey)
  if (cachedList) {return cachedList}

  const [news, total] = await Promise.all([
    News.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    News.countDocuments(query),
  ])
  const serializedNews = await attachOrganizationNames(news)

  const result = {
    news: serializedNews,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  }

  await newsListCache.set(cacheKey, result)
  return result
}

// ——— Writes ———

export const createNews = async (req: AuthRequest): Promise<any> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401)
  }

  const {
    title,
    bodyHtml: rawBodyHtml,
    content,
    excerpt,
    tags,
    imageUrl,
    imageId,
    coverImage,
    gallery,
    sections,
    category,
    featured,
    pinned,
    sourceUrl,
    referenceLinks,
    attachmentItems,
    readingTime,
    authorDisplayName,
    authorRole,
    associatedEventId,
    associatedOrganizationId,
    spotlightLabel,
    seoDescription,
    canonicalSlug,
    relatedArticleIds,
  } = req.body
  const ownership = resolveOwnershipInput(req.body)
  await validateOwnershipPair(ownership.ownerType, ownership.organizationId)
  await ensureCanManageOwnedContent(
    req.user,
    Permission.CREATE_NEWS,
    ownership.ownerType,
    ownership.organizationId
  )
  if (category) {
    await ensureReferenceValuesAllowed('contentCategories', [category], 'Invalid content category')
  }
  if (associatedEventId) {
    await ensureContentExists('events', associatedEventId)
  }
  if (associatedOrganizationId) {
    await ensureOrganizationsExist([associatedOrganizationId], 'Associated organization not found')
  }
  if (Array.isArray(relatedArticleIds) && relatedArticleIds.length > 0) {
    await Promise.all(relatedArticleIds.map((relatedId) => ensureContentExists('news', relatedId)))
  }

  const bodyHtml =
    typeof rawBodyHtml === 'string' && rawBodyHtml.trim().length > 0
      ? rawBodyHtml
      : typeof content === 'string'
        ? content
        : ''
  const resolvedCoverImage = normalizeMediaAsset(coverImage, { imageUrl, imageId })

  const news = await News.create({
    title,
    content: buildLegacyPlainText(bodyHtml),
    bodyHtml,
    excerpt,
    author: req.user.userId,
    ownerType: ownership.ownerType,
    organizationId: ownership.organizationId,
    tags: tags ?? [],
    sections: normalizeSections(sections),
    coverImage: resolvedCoverImage,
    gallery: normalizeGalleryExcludingCover(gallery, resolvedCoverImage),
    imageUrl,
    imageId,
    status: NewsStatus.DRAFT,
    category,
    featured: featured ?? false,
    pinned: pinned ?? false,
    sourceUrl,
    referenceLinks: normalizeReferenceLinks(referenceLinks),
    attachmentItems: normalizeAttachmentItems(attachmentItems),
    readingTime,
    authorDisplayName,
    authorRole,
    associatedEventId,
    associatedOrganizationId,
    spotlightLabel,
    seoDescription,
    canonicalSlug,
    relatedArticleIds: relatedArticleIds ?? [],
  })

  logger.info(`News created: ${news._id} by user ${req.user.userId}`)
  await invalidateNews(String(news._id))

  return news
}

export const updateNews = async (id: string, req: AuthRequest): Promise<any> => {
  const existingNews = await News.findById(id)
  if (!existingNews) {
    throw new AppError('News article not found', 404)
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.EDIT_NEWS,
    existingNews.ownerType,
    existingNews.organizationId ?? null
  )

  const currentOwnership = {
    ownerType: existingNews.ownerType,
    organizationId: existingNews.organizationId ?? null,
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
    Permission.EDIT_NEWS
  )

  if (!canMoveOwnership) {
    throw new AppError('You cannot reassign ownership for this news article', 403)
  }

  const updates = buildUpdatePayload(req.body, NEWS_EDITABLE_FIELDS)
  if (updates.category) {
    await ensureReferenceValuesAllowed('contentCategories', [updates.category], 'Invalid content category')
  }
  if (updates.associatedEventId) {
    await ensureContentExists('events', updates.associatedEventId as string)
  }
  if (updates.associatedOrganizationId) {
    await ensureOrganizationsExist([updates.associatedOrganizationId], 'Associated organization not found')
  }
  if (Array.isArray(updates.relatedArticleIds) && updates.relatedArticleIds.length > 0) {
    await Promise.all(updates.relatedArticleIds.map((relatedId) => ensureContentExists('news', relatedId)))
  }
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

  if (existingNews.imageId && imageId && existingNews.imageId !== imageId) {
    await deleteFromCloudinary(existingNews.imageId)
  }

  if (req.body.gallery !== undefined) {
    const effectiveCoverImage =
      (updates.coverImage as typeof existingNews.coverImage | undefined) ?? existingNews.coverImage
    updates.gallery = normalizeGalleryExcludingCover(req.body.gallery, effectiveCoverImage)
  }

  if (req.body.sections !== undefined) {
    updates.sections = normalizeSections(req.body.sections)
  }

  if (req.body.referenceLinks !== undefined) {
    updates.referenceLinks = normalizeReferenceLinks(req.body.referenceLinks)
  }

  if (req.body.attachmentItems !== undefined) {
    updates.attachmentItems = normalizeAttachmentItems(req.body.attachmentItems)
  }

  ;(updates as Record<string, unknown>).ownerType = nextOwnership.ownerType
  ;(updates as Record<string, unknown>).organizationId = nextOwnership.organizationId

  if (shouldResetApprovalOnEdit(existingNews.status)) {
    ;(updates as Record<string, unknown>).status = NewsStatus.DRAFT
    ;(updates as Record<string, unknown>).approvalSummary = undefined
  }

  const news = await News.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName email')

  if (!news) {
    throw new AppError('News article not found', 404)
  }

  logger.info(`News updated: ${id} by user ${req.user?.userId}`)
  await invalidateNews(id)

  return news
}

export const deleteNews = async (id: string, req: AuthRequest): Promise<void> => {
  const existingNews = await News.findById(id)
  if (!existingNews) {
    throw new AppError('News article not found', 404)
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.DELETE_NEWS,
    existingNews.ownerType,
    existingNews.organizationId ?? null
  )

  const news = await News.findByIdAndDelete(id)

  if (!news) {
    throw new AppError('News article not found', 404)
  }

  if (news.imageId) {
    await deleteFromCloudinary(news.imageId)
  }

  logger.info(`News deleted: ${id} by user ${req.user?.userId}`)
  await invalidateNews(id)
}

// ——— Approval workflow ———

export const submitNewsForApproval = async (id: string, req: AuthRequest): Promise<any> => {
  const news = await News.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.submitForApproval(
    id, req.user, news, 'news', Permission.SUBMIT_CONTENT_FOR_APPROVAL,
    NewsStatus.DRAFT, NewsStatus.PENDING_APPROVAL,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  )
  await newsDetailCache.invalidate(id)
  return updated
}

export const approveNews = async (id: string, req: AuthRequest): Promise<any> => {
  const news = await News.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.approve(
    id, req.user, news, 'news',
    NewsStatus.PENDING_APPROVAL, NewsStatus.APPROVED,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  )
  await invalidateNews(id)
  return updated
}

export const rejectNews = async (id: string, req: AuthRequest): Promise<any> => {
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : ''
  const news = await News.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.reject(
    id, req.user, news, 'news',
    NewsStatus.PENDING_APPROVAL, NewsStatus.REJECTED, reason,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  )
  await newsDetailCache.invalidate(id)
  return updated
}

export const publishNews = async (id: string, req: AuthRequest): Promise<any> => {
  const news = await News.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.publish(
    id, req.user, news, 'news', Permission.PUBLISH_NEWS, NewsStatus.PUBLISHED,
    (item) => {
      pushNotificationService.sendToAll({
        title: `📰 ${(item as Record<string, unknown>).title as string}`,
        body: (item as Record<string, unknown>).excerpt as string ?? 'New article published on CICT.',
        data: { type: 'news', id: String(item._id) },
      })
    }
  )

  const newsData = updated as Record<string, unknown>
  const frontendUrl = process.env.FRONTEND_URL ?? 'https://cict.edu.ph'
  const newsUrl = `${frontendUrl}/news/${id}`
  const emailContent = buildContentPublishedEmail('news', String(newsData.title ?? ''), newsUrl)
  await sendEmail({ to: process.env.NOTIFICATION_EMAIL ?? '', ...emailContent })

  logger.info(`News published: ${id} by user ${req.user?.userId}`)
  await invalidateNews(id)
  return updated
}

export const archiveNews = async (id: string, req: AuthRequest): Promise<any> => {
  const news = await News.findById(id).populate('author', 'firstName lastName email')
  const updated = await approvalService.archive(
    id, req.user, news, 'news', Permission.ARCHIVE_NEWS,
    NewsStatus.PUBLISHED, NewsStatus.ARCHIVED
  )

  logger.info(`News archived: ${id} by user ${req.user?.userId}`)
  await invalidateNews(id)
  return updated
}
