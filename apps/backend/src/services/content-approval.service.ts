import { AppError } from '../middleware/errorHandler';
import { type IAuthenticatedUser, type Permission, ContentOwnerType, type IApprovalSummary } from '../types';
import ProcessTemplate from '../models/ProcessTemplate';
import ProcessInstance from '../models/ProcessInstance';
import { createInstanceFromTemplate, advanceInstance } from './process-engine.service';
import {
  buildApprovedApprovalSummary,
  buildRejectedApprovalSummary,
  buildSubmittedApprovalSummary,
  canPublishFromWorkflowStatus,
  ensureCanApprove,
  ensureCanReject,
  type ApprovalContentType,
  recordContentApprovalAction,
  type WorkflowStatus,
} from '../utils/contentApproval';
import { ensureCanManageOwnedContent } from '../utils/organizationScope';
import logger from '../utils/logger';

async function maybeCreateLinkedProcessInstance(
  item: ContentDocument,
  contentType: string,
  userId: string
): Promise<string | null> {
  const orgId = item.organizationId;
  if (!orgId) {return null;}

  try {
    const template = await ProcessTemplate.findOne({
      organizationScope: orgId,
      isActive: true,
    });

    if (!template) {return null;}

    const contentId = item._id.toString();
    const instance = await createInstanceFromTemplate(template._id.toString(), {
      title: `${contentType} approval: ${contentId.slice(-8)}`,
      linkedContentType: contentType as any,
      linkedContentId: contentId,
      organizationId: orgId,
      createdBy: userId,
    });

    logger.info(`[ProcessIntegration] Created process instance ${instance._id} for ${contentType} ${contentId}`);
    return String(instance._id);
  } catch (error) {
    logger.error('[ProcessIntegration] Failed to create linked process instance:', error);
    return null;
  }
}

async function maybeAdvanceLinkedProcess(
  item: ContentDocument
): Promise<void> {
  try {
    const instance = await ProcessInstance.findOne({
      linkedContentId: item._id.toString(),
      status: 'active',
    });

    if (!instance) {return;}

    const nodeIds = instance.currentNodeIds;
    if (nodeIds.length === 0) {return;}

    await advanceInstance(instance._id.toString(), [nodeIds[0]]);
  } catch (error) {
    logger.error('[ProcessIntegration] Failed to advance linked process instance:', error);
  }
}

const buildPublishedApprovalSummary = (userId: string, existing?: IApprovalSummary): IApprovalSummary => ({
  ...(existing ? {
    submittedAt: existing.submittedAt,
    submittedBy: existing.submittedBy,
    approvedAt: existing.approvedAt,
    approvedBy: existing.approvedBy,
    rejectedAt: existing.rejectedAt,
    rejectedBy: existing.rejectedBy,
    rejectionReason: existing.rejectionReason,
  } : {}),
  publishedAt: new Date(),
  publishedBy: userId,
});

const buildArchivedApprovalSummary = (userId: string, existing?: IApprovalSummary): IApprovalSummary => ({
  ...(existing ? {
    submittedAt: existing.submittedAt,
    submittedBy: existing.submittedBy,
    approvedAt: existing.approvedAt,
    approvedBy: existing.approvedBy,
    rejectedAt: existing.rejectedAt,
    rejectedBy: existing.rejectedBy,
    rejectionReason: existing.rejectionReason,
    publishedAt: existing.publishedAt,
    publishedBy: existing.publishedBy,
  } : {}),
  archivedAt: new Date(),
  archivedBy: userId,
});

type ContentDocument = {
  _id: { toString(): string };
  status: string;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  approvalSummary?: IApprovalSummary;
  publishedAt?: Date;
  archivedAt?: Date | undefined;
  save(): Promise<unknown>;
};

export async function submitForApproval(
  id: string,
  user: IAuthenticatedUser | undefined,
  item: ContentDocument | null,
  contentType: ApprovalContentType,
  managePermission: Permission,
  draftStatus: string,
  pendingStatus: string,
  comment?: string
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  if (item.status !== draftStatus) {
    throw new AppError(`Only draft ${contentType} can be submitted for approval`, 400);
  }

  await ensureCanManageOwnedContent(
    user,
    managePermission,
    item.ownerType,
    item.organizationId ?? null
  );

  const fromStatus = item.status;
  item.status = pendingStatus;
  item.approvalSummary = buildSubmittedApprovalSummary(user!.userId, item.approvalSummary);
  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user!.userId,
    action: 'submitted',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
    comment,
  });

  await maybeCreateLinkedProcessInstance(item, contentType, user!.userId);

  return item;
}

export async function approve(
  id: string,
  user: IAuthenticatedUser | undefined,
  item: ContentDocument | null,
  contentType: ApprovalContentType,
  pendingStatus: string,
  approvedStatus: string,
  comment?: string,
  ownerType?: ContentOwnerType,
  organizationId?: string | null
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  if (!user) {
    throw new AppError('User not authenticated', 401);
  }

  ensureCanApprove(user, ownerType ?? item.ownerType, organizationId ?? item.organizationId);

  if (item.status !== pendingStatus) {
    throw new AppError(`Only pending approval ${contentType} can be approved`, 400);
  }

  const fromStatus = item.status;
  item.status = approvedStatus;
  item.approvalSummary = buildApprovedApprovalSummary(user.userId, item.approvalSummary);
  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user.userId,
    action: 'approved',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
    comment,
  });

  await maybeAdvanceLinkedProcess(item);

  return item;
}

export async function reject(
  id: string,
  user: IAuthenticatedUser | undefined,
  item: ContentDocument | null,
  contentType: ApprovalContentType,
  pendingStatus: string,
  rejectedStatus: string,
  reason: string,
  comment?: string,
  ownerType?: ContentOwnerType,
  organizationId?: string | null
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  if (!user) {
    throw new AppError('User not authenticated', 401);
  }

  ensureCanReject(user, ownerType ?? item.ownerType, organizationId ?? item.organizationId);

  if (item.status !== pendingStatus) {
    throw new AppError(`Only pending approval ${contentType} can be rejected`, 400);
  }

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const fromStatus = item.status;
  item.status = rejectedStatus;
  item.approvalSummary = buildRejectedApprovalSummary(user.userId, reason, item.approvalSummary);
  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user.userId,
    action: 'rejected',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
    reason,
    comment,
  });

  await maybeAdvanceLinkedProcess(item);

  return item;
}

export async function publish(
  id: string,
  user: IAuthenticatedUser | undefined,
  item: ContentDocument | null,
  contentType: ApprovalContentType,
  managePermission: Permission,
  statusPublished: string,
  onBeforeSave?: (item: ContentDocument) => void | Promise<void>
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  await ensureCanManageOwnedContent(
    user,
    managePermission,
    item.ownerType,
    item.organizationId ?? null
  );

  if (!canPublishFromWorkflowStatus(item.status)) {
    throw new AppError(`Only draft or approved ${contentType} can be published`, 400);
  }

  const fromStatus = item.status;
  item.status = statusPublished;
  item.publishedAt = new Date();
  item.archivedAt = undefined;
  item.approvalSummary = buildPublishedApprovalSummary(user!.userId, item.approvalSummary);

  if (onBeforeSave) {
    await onBeforeSave(item);
  }

  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user!.userId,
    action: 'published',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
  });

  await maybeAdvanceLinkedProcess(item);

  return item;
}

export async function archive(
  id: string,
  user: IAuthenticatedUser | undefined,
  item: ContentDocument | null,
  contentType: ApprovalContentType,
  managePermission: Permission,
  publishedStatus: string,
  archivedStatus: string,
  onBeforeSave?: (item: ContentDocument) => void | Promise<void>
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  if (item.status !== publishedStatus) {
    throw new AppError(`Only published ${contentType} can be archived`, 400);
  }

  await ensureCanManageOwnedContent(
    user,
    managePermission,
    item.ownerType,
    item.organizationId ?? null
  );

  const fromStatus = item.status;
  item.status = archivedStatus;
  item.archivedAt = new Date();
  item.approvalSummary = buildArchivedApprovalSummary(user!.userId, item.approvalSummary);

  if (onBeforeSave) {
    await onBeforeSave(item);
  }

  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user!.userId,
    action: 'archived',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
  });

  return item;
}
