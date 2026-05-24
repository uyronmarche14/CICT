import { AppError } from '../middleware/errorHandler';
import { type IAuthenticatedUser, type Permission, ContentOwnerType, type IApprovalSummary } from '../types';
import {
  buildApprovedApprovalSummary,
  buildRejectedApprovalSummary,
  buildSubmittedApprovalSummary,
  canPublishFromWorkflowStatus,
  ensureFullAdminApprover,
  type ApprovalContentType,
  recordContentApprovalAction,
  type WorkflowStatus,
} from '../utils/contentApproval';
import { ensureCanManageOwnedContent } from '../utils/organizationScope';

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

  return item;
}

export async function approve(
  id: string,
  user: IAuthenticatedUser | undefined,
  item: ContentDocument | null,
  contentType: ApprovalContentType,
  pendingStatus: string,
  approvedStatus: string,
  comment?: string
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  ensureFullAdminApprover(user);

  if (item.status !== pendingStatus) {
    throw new AppError(`Only pending approval ${contentType} can be approved`, 400);
  }

  const fromStatus = item.status;
  item.status = approvedStatus;
  item.approvalSummary = buildApprovedApprovalSummary(user!.userId, item.approvalSummary);
  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user!.userId,
    action: 'approved',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
    comment,
  });

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
  comment?: string
): Promise<ContentDocument> {
  if (!item) {
    throw new AppError(`${contentType} not found`, 404);
  }

  ensureFullAdminApprover(user);

  if (item.status !== pendingStatus) {
    throw new AppError(`Only pending approval ${contentType} can be rejected`, 400);
  }

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const fromStatus = item.status;
  item.status = rejectedStatus;
  item.approvalSummary = buildRejectedApprovalSummary(user!.userId, reason, item.approvalSummary);
  await item.save();

  await recordContentApprovalAction({
    contentType,
    contentId: id,
    actorUserId: user!.userId,
    action: 'rejected',
    fromStatus: fromStatus as WorkflowStatus,
    toStatus: item.status as WorkflowStatus,
    reason,
    comment,
  });

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
