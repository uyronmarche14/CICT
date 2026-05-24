import { Response } from 'express';
import News from '../models/News';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ContentOwnerType, NewsStatus, Permission } from '../types';
import logger from '../utils/logger';
import { deleteFromCloudinary } from '../middleware/upload';
import { pushNotificationService } from '../services/push-notification.service';
import {
  buildLegacyPlainText,
  normalizeGalleryExcludingCover,
  normalizeMediaAsset,
  normalizeSections,
} from '../utils/content';
import {
  canReassignOwnership,
  ensureCanManageOwnedContent,
  getAccessibleOrganizationIdsForAuthenticatedUser,
  resolveOwnershipInput,
  validateOwnershipPair,
} from '../utils/organizationScope';
import { attachOrganizationName, attachOrganizationNames } from '../utils/ownedContent';
import { hasGlobalPermission } from '../utils/rbac';
import {
  shouldResetApprovalOnEdit,
} from '../utils/contentApproval';
import { buildOwnershipFilter, buildUpdatePayload, canViewUnpublishedContent } from '../services/content.service';
import * as approvalService from '../services/content-approval.service';

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
] as const;

/**
 * Create new news article
 */
export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
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
  } = req.body;
  const ownership = resolveOwnershipInput(req.body);
  await validateOwnershipPair(ownership.ownerType, ownership.organizationId);
  await ensureCanManageOwnedContent(
    req.user,
    Permission.CREATE_NEWS,
    ownership.ownerType,
    ownership.organizationId
  );

  const bodyHtml =
    typeof rawBodyHtml === 'string' && rawBodyHtml.trim().length > 0
      ? rawBodyHtml
      : typeof content === 'string'
        ? content
        : '';
  const resolvedCoverImage = normalizeMediaAsset(coverImage, { imageUrl, imageId });

  const news = await News.create({
    title,
    content: buildLegacyPlainText(bodyHtml),
    bodyHtml,
    excerpt,
    author: req.user.userId,
    ownerType: ownership.ownerType,
    organizationId: ownership.organizationId,
    tags: tags || [],
    sections: normalizeSections(sections),
    coverImage: resolvedCoverImage,
    gallery: normalizeGalleryExcludingCover(gallery, resolvedCoverImage),
    imageUrl,
    imageId,
    status: NewsStatus.DRAFT,
  });

  logger.info(`News created: ${news._id} by user ${req.user.userId}`);

  res.status(201).json({
    success: true,
    message: 'News article created successfully',
    data: { news },
  });
};

/**
 * Get all news articles
 */
export const getAllNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = 1, limit = 10, search, ownerType, organizationId } = req.query;

  const conditions: Record<string, unknown>[] = [];
  const requestedOwnerType =
    ownerType === ContentOwnerType.ORGANIZATION
      ? ContentOwnerType.ORGANIZATION
      : ownerType === ContentOwnerType.SYSTEM
        ? ContentOwnerType.SYSTEM
        : undefined;
  const requestedOrganizationId =
    typeof organizationId === 'string' && organizationId.trim().length > 0
      ? organizationId.trim().toLowerCase()
      : null;

  if (!req.user) {
    conditions.push({
      status: NewsStatus.PUBLISHED,
      ...buildOwnershipFilter(requestedOwnerType, requestedOrganizationId),
    });
  } else if (hasGlobalPermission(req.user, Permission.VIEW_NEWS)) {
    const adminCondition: Record<string, unknown> = {
      ...buildOwnershipFilter(requestedOwnerType, requestedOrganizationId),
    };
    if (status) {
      adminCondition.status = status;
    }
    conditions.push(adminCondition);
  } else if (req.user) {
    const accessibleOrganizationIds = getAccessibleOrganizationIdsForAuthenticatedUser(
      req.user,
      Permission.VIEW_NEWS
    );

    if (accessibleOrganizationIds.length > 0 && requestedOwnerType !== ContentOwnerType.SYSTEM) {
      const allowedOrganizationIds = requestedOrganizationId
        ? accessibleOrganizationIds.filter((id) => id === requestedOrganizationId)
        : accessibleOrganizationIds;

      if (allowedOrganizationIds.length > 0) {
        const scopedCondition: Record<string, unknown> = {
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: { $in: allowedOrganizationIds },
        };

        if (status) {
          scopedCondition.status = status;
        }

        conditions.push(scopedCondition);
      } else {
        conditions.push({ _id: null });
      }
    } else {
      conditions.push({ _id: null });
    }
  }

  if (search) {
    conditions.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { bodyHtml: { $regex: search, $options: 'i' } },
      ],
    });
  }
  const query = conditions.length <= 1 ? conditions[0] ?? {} : { $and: conditions };

  const skip = (Number(page) - 1) * Number(limit);

  const [news, total] = await Promise.all([
    News.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    News.countDocuments(query),
  ]);
  const serializedNews = await attachOrganizationNames(news);

  res.status(200).json({
    success: true,
    data: {
      news: serializedNews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

/**
 * Get single news article by ID
 */
export const getNewsById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const news = await News.findById(id).populate('author', 'firstName lastName email');

  if (!news) {
    throw new AppError('News article not found', 404);
  }

    if (!canViewUnpublishedContent(req, Permission.VIEW_NEWS)) {
    if (news.status !== NewsStatus.PUBLISHED) {
      await ensureCanManageOwnedContent(
        req.user,
        Permission.VIEW_NEWS,
        news.ownerType,
        news.organizationId ?? null
      );
    }
  }

  const serializedNews = await attachOrganizationName(news);

  res.status(200).json({
    success: true,
    data: { news: serializedNews },
  });
};

/**
 * Update news article
 */
export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const existingNews = await News.findById(id);
  if (!existingNews) {
    throw new AppError('News article not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.EDIT_NEWS,
    existingNews.ownerType,
    existingNews.organizationId ?? null
  );

  const currentOwnership = {
    ownerType: existingNews.ownerType,
    organizationId: existingNews.organizationId ?? null,
  };
  const nextOwnership = resolveOwnershipInput({
    ownerType: req.body.ownerType ?? currentOwnership.ownerType,
    organizationId:
      req.body.organizationId !== undefined
        ? req.body.organizationId
        : currentOwnership.organizationId,
  });
  await validateOwnershipPair(nextOwnership.ownerType, nextOwnership.organizationId);

  const canMoveOwnership = await canReassignOwnership(
    req.user!,
    currentOwnership.ownerType,
    currentOwnership.organizationId,
    nextOwnership.ownerType,
    nextOwnership.organizationId,
    Permission.EDIT_NEWS
  );

  if (!canMoveOwnership) {
    throw new AppError('You cannot reassign ownership for this news article', 403);
  }

    const updates = buildUpdatePayload(req.body, NEWS_EDITABLE_FIELDS);
  const bodyHtml =
    typeof updates.bodyHtml === 'string'
      ? updates.bodyHtml
      : typeof req.body.content === 'string'
        ? req.body.content
        : undefined;
  const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl : undefined;
  const imageId = typeof req.body.imageId === 'string' ? req.body.imageId : undefined;

  if (bodyHtml !== undefined) {
    updates.bodyHtml = bodyHtml;
    (updates as Record<string, unknown>).content = buildLegacyPlainText(bodyHtml);
  }

  if (
    req.body.coverImage !== undefined ||
    req.body.imageUrl !== undefined ||
    req.body.imageId !== undefined
  ) {
    updates.coverImage = normalizeMediaAsset(req.body.coverImage, { imageUrl, imageId });
    updates.imageUrl = imageUrl;
    updates.imageId = imageId;
  }

  if (req.body.gallery !== undefined) {
    const effectiveCoverImage =
      (updates.coverImage as typeof existingNews.coverImage | undefined) ?? existingNews.coverImage;
    updates.gallery = normalizeGalleryExcludingCover(req.body.gallery, effectiveCoverImage);
  }

  if (req.body.sections !== undefined) {
    updates.sections = normalizeSections(req.body.sections);
  }

  (updates as Record<string, unknown>).ownerType = nextOwnership.ownerType;
  (updates as Record<string, unknown>).organizationId = nextOwnership.organizationId;

  if (shouldResetApprovalOnEdit(existingNews.status)) {
    (updates as Record<string, unknown>).status = NewsStatus.DRAFT;
    (updates as Record<string, unknown>).approvalSummary = undefined;
  }

  const news = await News.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName email');

  if (!news) {
    throw new AppError('News article not found', 404);
  }

  logger.info(`News updated: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'News article updated successfully',
    data: { news },
  });
};

export const submitNewsForApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const news = await News.findById(id).populate('author', 'firstName lastName email');
  const updated = await approvalService.submitForApproval(
    id, req.user, news, 'news', Permission.SUBMIT_CONTENT_FOR_APPROVAL,
    NewsStatus.DRAFT, NewsStatus.PENDING_APPROVAL,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  );

  res.status(200).json({
    success: true,
    message: 'News article submitted for approval',
    data: { news: updated },
  });
};

export const approveNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const news = await News.findById(id).populate('author', 'firstName lastName email');
  const updated = await approvalService.approve(
    id, req.user, news, 'news',
    NewsStatus.PENDING_APPROVAL, NewsStatus.APPROVED,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  );

  res.status(200).json({
    success: true,
    message: 'News article approved successfully',
    data: { news: updated },
  });
};

export const rejectNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  const news = await News.findById(id).populate('author', 'firstName lastName email');
  const updated = await approvalService.reject(
    id, req.user, news, 'news',
    NewsStatus.PENDING_APPROVAL, NewsStatus.REJECTED, reason,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  );

  res.status(200).json({
    success: true,
    message: 'News article rejected successfully',
    data: { news: updated },
  });
};

/**
 * Delete news article
 */
export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const existingNews = await News.findById(id);
  if (!existingNews) {
    throw new AppError('News article not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.DELETE_NEWS,
    existingNews.ownerType,
    existingNews.organizationId ?? null
  );

  const news = await News.findByIdAndDelete(id);

  if (!news) {
    throw new AppError('News article not found', 404);
  }

  if (news.imageId) {
    await deleteFromCloudinary(news.imageId);
  }

  logger.info(`News deleted: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'News article deleted successfully',
  });
};

/**
 * Publish news article
 */
export const publishNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const news = await News.findById(id).populate('author', 'firstName lastName email');
  const updated = await approvalService.publish(
    id, req.user, news, 'news', Permission.PUBLISH_NEWS, NewsStatus.PUBLISHED,
    (item) => {
      pushNotificationService.sendToAll({
        title: `📰 ${(item as Record<string, unknown>).title as string}`,
        body: (item as Record<string, unknown>).excerpt as string || 'New article published on CICT.',
        data: { type: 'news', id: String(item._id) },
      });
    }
  );

  logger.info(`News published: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'News article published successfully',
    data: { news: updated },
  });
};

/**
 * Archive news article
 */
export const archiveNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const news = await News.findById(id).populate('author', 'firstName lastName email');
  const updated = await approvalService.archive(
    id, req.user, news, 'news', Permission.ARCHIVE_NEWS,
    NewsStatus.PUBLISHED, NewsStatus.ARCHIVED
  );

  logger.info(`News archived: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'News article archived successfully',
    data: { news: updated },
  });
};
