import Event from '../models/Event'
import News from '../models/News'
import Announcement from '../models/Announcement'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import {
  ContentOwnerType,
  EventStatus,
  Permission,
} from '../types'
import logger from '../utils/logger'
import { deleteFromCloudinary } from '../middleware/upload'
import {
  buildLegacyPlainText,
  normalizeGalleryExcludingCover,
  normalizeMediaAsset,
  normalizeSchedule,
  normalizeSections,
  normalizeSpeakerItems,
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
import {
  shouldResetApprovalOnEdit,
} from '../utils/contentApproval'
import { buildOwnershipFilter, buildUpdatePayload, canViewUnpublishedContent } from './content.service'
import * as eventWorkflow from './event-workflow.service'
import { pushNotificationService } from './push-notification.service'
import { sendEmail, buildContentPublishedEmail } from './email.service'
import { parsePagination } from '../utils/pagination'
import { TypedCache } from '../utils/cache'
import { buildListCacheKey, hashScope } from '../utils/cacheHelpers'
import { invalidateDashboardCache } from './dashboard.service'

const EVENT_EDITABLE_FIELDS = [
  'title',
  'bodyHtml',
  'excerpt',
  'startDate',
  'endDate',
  'location',
  'maxAttendees',
  'tags',
  'coverImage',
  'gallery',
  'sections',
  'schedule',
  'imageUrl',
  'imageId',
  'isRegistrationOpen',
  'registrationUrl',
  'registrationDeadline',
  'contactName',
  'contactEmail',
  'contactPhone',
  'hostOrganizationIds',
  'coHostOrganizationIds',
  'speakerItems',
  'audience',
  'eligibility',
  'feeLabel',
  'certificateInfo',
  'venueDetails',
  'mapUrl',
  'meetingUrl',
  'requirements',
  'attachmentItems',
  'posterCaption',
] as const

const eventDetailCache = new TypedCache<unknown>({
  namespace: 'event:detail',
  ttlMs: 120_000,
})

const eventListCache = new TypedCache<any>({
  namespace: 'event:list',
  ttlMs: 30_000,
})

const invalidateEvent = async (id: string): Promise<void> => {
  await eventDetailCache.invalidate(id)
  await eventDetailCache.invalidate(`${id}:with-related`)
  await eventListCache.clear()
  await invalidateDashboardCache()
}

const parseEventDateInput = (value: unknown, fieldLabel: string): Date => {
  const parsedDate = new Date(String(value))
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(`${fieldLabel} must be a valid date`, 400)
  }
  return parsedDate
}

const ensureValidEventDateRange = (startDateValue: unknown, endDateValue: unknown): void => {
  const startDate = parseEventDateInput(startDateValue, 'Start date')
  const endDate = parseEventDateInput(endDateValue, 'End date')
  if (startDate.getTime() > endDate.getTime()) {
    throw new AppError('Start date cannot be after end date', 400)
  }
}

// ——— Reads ———

export const getEventById = async (id: string, req: AuthRequest): Promise<unknown> => {
  const cacheKey = `${id}:with-related`
  const event = await Event.findById(id)
    .populate('organizer', 'firstName lastName email')
    .populate('attendees', 'firstName lastName email')

  if (!event) {
    throw new AppError('Event not found', 404)
  }

  if (!canViewUnpublishedContent(req, Permission.VIEW_EVENT)) {
    if (event.status !== EventStatus.PUBLISHED) {
      await ensureCanManageOwnedContent(
        req.user,
        Permission.VIEW_EVENT,
        event.ownerType,
        event.organizationId ?? null
      )
    }
  }

  const cached = await eventDetailCache.get(cacheKey)
  if (cached) {return cached}

  const serializedEvent = await attachOrganizationName(event)

  const [relatedNews, relatedAnnouncements] = await Promise.all([
    News.find({ associatedEventId: id, status: 'published' })
      .select('title excerpt publishedAt coverImage slug')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(),
    Announcement.find({ relatedEventId: id, status: 'published', isActive: true })
      .select('title content publishedAt subtype')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(),
  ])

  const result = { event: serializedEvent, relatedNews, relatedAnnouncements }
  await eventDetailCache.set(cacheKey, result)
  return result
}

export const getAllEvents = async (req: AuthRequest): Promise<any> => {
  const { status, search, upcoming, ownerType, organizationId } = req.query

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
      status: EventStatus.PUBLISHED,
      ...buildOwnershipFilter(requestedOwnerType, requestedOrganizationId),
    })
  } else if (hasGlobalPermission(req.user, Permission.VIEW_EVENT)) {
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
      Permission.VIEW_EVENT
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

  const safeSearch = sanitizeSearchInput(search)
  if (safeSearch) {
    conditions.push({
      $or: [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { bodyHtml: { $regex: safeSearch, $options: 'i' } },
        { location: { $regex: safeSearch, $options: 'i' } },
      ],
    })
  }

  if (upcoming === 'true') {
    conditions.push({ endDate: { $gte: new Date() } })
  }
  const query = conditions.length <= 1 ? conditions[0] ?? {} : { $and: conditions }

  const pagination = parsePagination(req.query as Record<string, unknown>, 10, 100)

  const scope = hashScope(req.user, Permission.VIEW_EVENT)
  const cacheKey = buildListCacheKey(query as Record<string, unknown>, pagination, scope)

  const cachedList = await eventListCache.get(cacheKey)
  if (cachedList) {return cachedList}

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ startDate: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Event.countDocuments(query),
  ])
  const serializedEvents = await attachOrganizationNames(events)

  const result = {
    events: serializedEvents,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  }

  await eventListCache.set(cacheKey, result)
  return result
}

// ——— Writes ———

export const createEvent = async (req: AuthRequest): Promise<any> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401)
  }

  const {
    title,
    description,
    bodyHtml: rawBodyHtml,
    excerpt,
    startDate,
    endDate,
    location,
    maxAttendees,
    tags,
    imageUrl,
    imageId,
    isRegistrationOpen,
    coverImage,
    gallery,
    sections,
    schedule,
    registrationUrl,
    registrationDeadline,
    contactName,
    contactEmail,
    contactPhone,
    hostOrganizationIds,
    coHostOrganizationIds,
    speakerItems,
    audience,
    eligibility,
    feeLabel,
    certificateInfo,
    venueDetails,
    mapUrl,
    meetingUrl,
    requirements,
    attachmentItems,
    posterCaption,
  } = req.body
  const ownership = resolveOwnershipInput(req.body)
  await validateOwnershipPair(ownership.ownerType, ownership.organizationId)
  await ensureCanManageOwnedContent(
    req.user,
    Permission.CREATE_EVENT,
    ownership.ownerType,
    ownership.organizationId
  )

  const bodyHtml =
    typeof rawBodyHtml === 'string' && rawBodyHtml.trim().length > 0
      ? rawBodyHtml
      : typeof description === 'string'
        ? description
        : ''
  const resolvedCoverImage = normalizeMediaAsset(coverImage, { imageUrl, imageId })

  ensureValidEventDateRange(startDate, endDate)

  const event = await Event.create({
    title,
    description: buildLegacyPlainText(bodyHtml),
    bodyHtml,
    excerpt,
    organizer: req.user.userId,
    ownerType: ownership.ownerType,
    organizationId: ownership.organizationId,
    startDate,
    endDate,
    location,
    maxAttendees,
    tags: tags ?? [],
    sections: normalizeSections(sections),
    schedule: normalizeSchedule(schedule),
    coverImage: resolvedCoverImage,
    gallery: normalizeGalleryExcludingCover(gallery, resolvedCoverImage),
    imageUrl,
    imageId,
    status: EventStatus.DRAFT,
    isRegistrationOpen: isRegistrationOpen ?? false,
    registrationUrl,
    registrationDeadline,
    contactName,
    contactEmail,
    contactPhone,
    hostOrganizationIds: hostOrganizationIds ?? [],
    coHostOrganizationIds: coHostOrganizationIds ?? [],
    speakerItems: normalizeSpeakerItems(speakerItems),
    audience,
    eligibility,
    feeLabel,
    certificateInfo,
    venueDetails,
    mapUrl,
    meetingUrl,
    requirements,
    attachmentItems: normalizeAttachmentItems(attachmentItems),
    posterCaption,
  })

  logger.info(`Event created: ${event._id} by user ${req.user.userId}`)
  await invalidateEvent(String(event._id))

  return event
}

export const updateEvent = async (id: string, req: AuthRequest): Promise<any> => {
  const existingEvent = await Event.findById(id)
  if (!existingEvent) {
    throw new AppError('Event not found', 404)
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.EDIT_EVENT,
    existingEvent.ownerType,
    existingEvent.organizationId ?? null
  )

  const currentOwnership = {
    ownerType: existingEvent.ownerType,
    organizationId: existingEvent.organizationId ?? null,
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
    Permission.EDIT_EVENT
  )

  if (!canMoveOwnership) {
    throw new AppError('You cannot reassign ownership for this event', 403)
  }

  const updates = buildUpdatePayload(req.body, EVENT_EDITABLE_FIELDS)
  const bodyHtml =
    typeof updates.bodyHtml === 'string'
      ? updates.bodyHtml
      : typeof req.body.description === 'string'
        ? req.body.description
        : undefined
  const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl : undefined
  const imageId = typeof req.body.imageId === 'string' ? req.body.imageId : undefined

  if (updates.startDate && updates.endDate) {
    ensureValidEventDateRange(updates.startDate, updates.endDate)
  } else if (updates.startDate || updates.endDate) {
    ensureValidEventDateRange(
      updates.startDate ?? existingEvent.startDate,
      updates.endDate ?? existingEvent.endDate
    )
  }

  if (bodyHtml !== undefined) {
    updates.bodyHtml = bodyHtml
    ;(updates as Record<string, unknown>).description = buildLegacyPlainText(bodyHtml)
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

  if (existingEvent.imageId && imageId && existingEvent.imageId !== imageId) {
    await deleteFromCloudinary(existingEvent.imageId)
  }

  if (req.body.gallery !== undefined) {
    const effectiveCoverImage =
      (updates.coverImage as typeof existingEvent.coverImage | undefined) ?? existingEvent.coverImage
    updates.gallery = normalizeGalleryExcludingCover(req.body.gallery, effectiveCoverImage)
  }

  if (req.body.sections !== undefined) {
    updates.sections = normalizeSections(req.body.sections)
  }

  if (req.body.schedule !== undefined) {
    updates.schedule = normalizeSchedule(req.body.schedule)
  }

  if (req.body.speakerItems !== undefined) {
    updates.speakerItems = normalizeSpeakerItems(req.body.speakerItems)
  }

  if (req.body.attachmentItems !== undefined) {
    updates.attachmentItems = normalizeAttachmentItems(req.body.attachmentItems)
  }

  ;(updates as Record<string, unknown>).ownerType = nextOwnership.ownerType
  ;(updates as Record<string, unknown>).organizationId = nextOwnership.organizationId

  if (shouldResetApprovalOnEdit(existingEvent.status)) {
    ;(updates as Record<string, unknown>).status = EventStatus.DRAFT
    ;(updates as Record<string, unknown>).approvalSummary = undefined
  }

  const event = await Event.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('organizer', 'firstName lastName email')

  if (!event) {
    throw new AppError('Event not found', 404)
  }

  logger.info(`Event updated: ${id} by user ${req.user?.userId}`)
  await invalidateEvent(id)

  return event
}

export const deleteEvent = async (id: string, req: AuthRequest): Promise<void> => {
  const existingEvent = await Event.findById(id)
  if (!existingEvent) {
    throw new AppError('Event not found', 404)
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.DELETE_EVENT,
    existingEvent.ownerType,
    existingEvent.organizationId ?? null
  )

  const event = await Event.findByIdAndDelete(id)

  if (!event) {
    throw new AppError('Event not found', 404)
  }

  if (event.imageId) {
    await deleteFromCloudinary(event.imageId)
  }

  logger.info(`Event deleted: ${id} by user ${req.user?.userId}`)
  await invalidateEvent(id)
}

// ——— Workflow (delegated to event-workflow.service) ———

export const submitEventForApproval = async (id: string, req: AuthRequest): Promise<any> => {
  const updated = await eventWorkflow.submitForApproval(id, req)
  await eventDetailCache.invalidate(`${id}:with-related`)
  return updated
}

export const approveEvent = async (id: string, req: AuthRequest): Promise<any> => {
  const updated = await eventWorkflow.approve(id, req)
  await invalidateEvent(id)
  return updated
}

export const rejectEvent = async (id: string, req: AuthRequest): Promise<any> => {
  const updated = await eventWorkflow.reject(id, req)
  await eventDetailCache.invalidate(`${id}:with-related`)
  return updated
}

export const publishEvent = async (id: string, req: AuthRequest): Promise<any> => {
  const updated = await eventWorkflow.publish(id, req)

  const e = updated as Record<string, unknown>
  pushNotificationService.sendToAll({
    title: `📅 ${e.title as string}`,
    body: typeof e.excerpt === 'string'
      ? e.excerpt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
      : 'New event on CICT.',
    data: { type: 'event', id: String(e._id) },
  })

  const frontendUrl = process.env.FRONTEND_URL ?? 'https://cict.edu.ph'
  const eventUrl = `${frontendUrl}/events/${id}`
  const emailContent = buildContentPublishedEmail('event', String(e.title ?? ''), eventUrl)
  await sendEmail({ to: process.env.NOTIFICATION_EMAIL ?? '', ...emailContent })

  await invalidateEvent(id)
  return updated
}

export const cancelEvent = async (id: string, req: AuthRequest): Promise<any> => {
  const event = await eventWorkflow.cancel(id, req)
  await invalidateEvent(id)
  return event
}

export const completeEvent = async (id: string, req: AuthRequest): Promise<any> => {
  const event = await eventWorkflow.complete(id, req)
  await invalidateEvent(id)
  return event
}
