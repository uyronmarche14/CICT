import ContentApprovalAction from '../models/ContentApprovalAction';
import { AppError } from '../middleware/errorHandler';
import {
  ContentOwnerType,
  EventStatus,
  IApprovalSummary,
  IAuthenticatedUser,
  NewsStatus,
  Permission,
} from '../types';
import { hasGlobalPermission } from './rbac';
import { hasScopedOrganizationPermissionForUser } from './organizationScope';

export type ApprovalContentType = 'news' | 'announcement' | 'event';
export type WorkflowStatus = NewsStatus | EventStatus;

const RESETTABLE_APPROVAL_STATUSES = new Set<string>([
  NewsStatus.PENDING_APPROVAL,
  NewsStatus.APPROVED,
  NewsStatus.REJECTED,
  EventStatus.PENDING_APPROVAL,
  EventStatus.APPROVED,
  EventStatus.REJECTED,
]);

export const shouldResetApprovalOnEdit = (status: string): boolean =>
  RESETTABLE_APPROVAL_STATUSES.has(status);

const PUBLISHABLE_WORKFLOW_STATUSES = new Set<string>([
  NewsStatus.DRAFT,
  NewsStatus.APPROVED,
  EventStatus.DRAFT,
  EventStatus.APPROVED,
]);

export const canPublishFromWorkflowStatus = (status: string): boolean =>
  PUBLISHABLE_WORKFLOW_STATUSES.has(status);

export const ensureCanApprove = (
  user: IAuthenticatedUser,
  ownerType: ContentOwnerType,
  organizationId?: string | null
): void => {
  if (hasGlobalPermission(user, Permission.APPROVE_CONTENT)) {
    return;
  }

  if (
    ownerType === ContentOwnerType.ORGANIZATION &&
    organizationId &&
    hasScopedOrganizationPermissionForUser(user, organizationId, Permission.APPROVE_CONTENT)
  ) {
    return;
  }

  throw new AppError('You do not have permission to approve this content', 403);
};

export const ensureCanReject = (
  user: IAuthenticatedUser,
  ownerType: ContentOwnerType,
  organizationId?: string | null
): void => {
  if (hasGlobalPermission(user, Permission.REJECT_CONTENT)) {
    return;
  }

  if (
    ownerType === ContentOwnerType.ORGANIZATION &&
    organizationId &&
    hasScopedOrganizationPermissionForUser(user, organizationId, Permission.REJECT_CONTENT)
  ) {
    return;
  }

  throw new AppError('You do not have permission to reject this content', 403);
};

export const buildSubmittedApprovalSummary = (
  submittedBy: string,
  existing?: IApprovalSummary
): IApprovalSummary => ({
  submittedAt: new Date(),
  submittedBy,
  approvedAt: undefined,
  approvedBy: undefined,
  rejectedAt: undefined,
  rejectedBy: undefined,
  rejectionReason: undefined,
  ...(existing?.submittedAt ? { submittedAt: new Date() } : {}),
});

export const buildApprovedApprovalSummary = (
  approvedBy: string,
  existing?: IApprovalSummary
): IApprovalSummary => ({
  submittedAt: existing?.submittedAt,
  submittedBy: existing?.submittedBy,
  approvedAt: new Date(),
  approvedBy,
  rejectedAt: undefined,
  rejectedBy: undefined,
  rejectionReason: undefined,
});

export const buildRejectedApprovalSummary = (
  rejectedBy: string,
  reason: string,
  existing?: IApprovalSummary
): IApprovalSummary => ({
  submittedAt: existing?.submittedAt,
  submittedBy: existing?.submittedBy,
  approvedAt: undefined,
  approvedBy: undefined,
  rejectedAt: new Date(),
  rejectedBy,
  rejectionReason: reason,
});

export const recordContentApprovalAction = async (input: {
  contentType: ApprovalContentType;
  contentId: string;
  actorUserId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'published' | 'archived' | 'cancelled' | 'completed' | 'returned_to_draft';
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  reason?: string;
  comment?: string;
}) => {
  await ContentApprovalAction.create({
    contentType: input.contentType,
    contentId: input.contentId,
    actorUserId: input.actorUserId,
    action: input.action,
    reason: input.reason,
    comment: input.comment,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
  });
};
