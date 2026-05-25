import { describe, expect, it, vi } from 'vitest';
import {
  shouldResetApprovalOnEdit,
  canPublishFromWorkflowStatus,
  buildSubmittedApprovalSummary,
  buildApprovedApprovalSummary,
  ensureCanApprove,
  ensureCanReject,
} from './contentApproval';
import { ContentOwnerType, NewsStatus, EventStatus, Permission, UserRole } from '../types';
import * as orgScope from './organizationScope';

const makeGlobalApprover = (permission: Permission) => ({
  userId: 'admin-1',
  email: 'admin@test.com',
  role: UserRole.FULL_ADMIN,
  permissions: [permission],
  isActive: true,
});

const makeNoPermissionUser = () => ({
  userId: 'user-1',
  email: 'user@test.com',
  role: UserRole.SUPPORT,
  permissions: [],
  isActive: true,
});

const makeScopedOnlyUser = () => ({
  userId: 'scoped-1',
  email: 'scoped@test.com',
  role: UserRole.SUPPORT,
  permissions: [],
  isActive: true,
});

describe('shouldResetApprovalOnEdit', () => {
  it('returns true for pending approval status', () => {
    expect(shouldResetApprovalOnEdit(NewsStatus.PENDING_APPROVAL)).toBe(true);
    expect(shouldResetApprovalOnEdit(EventStatus.PENDING_APPROVAL)).toBe(true);
  });

  it('returns true for approved status', () => {
    expect(shouldResetApprovalOnEdit(NewsStatus.APPROVED)).toBe(true);
    expect(shouldResetApprovalOnEdit(EventStatus.APPROVED)).toBe(true);
  });

  it('returns true for rejected status', () => {
    expect(shouldResetApprovalOnEdit(NewsStatus.REJECTED)).toBe(true);
    expect(shouldResetApprovalOnEdit(EventStatus.REJECTED)).toBe(true);
  });

  it('returns false for draft and published status', () => {
    expect(shouldResetApprovalOnEdit(NewsStatus.DRAFT)).toBe(false);
    expect(shouldResetApprovalOnEdit(NewsStatus.PUBLISHED)).toBe(false);
    expect(shouldResetApprovalOnEdit(EventStatus.DRAFT)).toBe(false);
    expect(shouldResetApprovalOnEdit(EventStatus.PUBLISHED)).toBe(false);
  });

  it('returns false for unknown status', () => {
    expect(shouldResetApprovalOnEdit('UNKNOWN')).toBe(false);
  });
});

describe('canPublishFromWorkflowStatus', () => {
  it('returns true for draft', () => {
    expect(canPublishFromWorkflowStatus(NewsStatus.DRAFT)).toBe(true);
    expect(canPublishFromWorkflowStatus(EventStatus.DRAFT)).toBe(true);
  });

  it('returns true for approved', () => {
    expect(canPublishFromWorkflowStatus(NewsStatus.APPROVED)).toBe(true);
    expect(canPublishFromWorkflowStatus(EventStatus.APPROVED)).toBe(true);
  });

  it('returns false for pending', () => {
    expect(canPublishFromWorkflowStatus(NewsStatus.PENDING_APPROVAL)).toBe(false);
    expect(canPublishFromWorkflowStatus(EventStatus.PENDING_APPROVAL)).toBe(false);
  });

  it('returns false for rejected', () => {
    expect(canPublishFromWorkflowStatus(NewsStatus.REJECTED)).toBe(false);
    expect(canPublishFromWorkflowStatus(EventStatus.REJECTED)).toBe(false);
  });

  it('returns false for published', () => {
    expect(canPublishFromWorkflowStatus(NewsStatus.PUBLISHED)).toBe(false);
    expect(canPublishFromWorkflowStatus(EventStatus.PUBLISHED)).toBe(false);
  });

  it('returns false for archived', () => {
    expect(canPublishFromWorkflowStatus(NewsStatus.ARCHIVED)).toBe(false);
    expect(canPublishFromWorkflowStatus(EventStatus.CANCELLED)).toBe(false);
  });
});

describe('buildSubmittedApprovalSummary', () => {
  it('creates a submission summary with submitted timestamp', () => {
    const summary = buildSubmittedApprovalSummary('user-1');
    expect(summary.submittedBy).toBe('user-1');
    expect(summary.submittedAt).toBeInstanceOf(Date);
    expect(summary.approvedAt).toBeUndefined();
    expect(summary.rejectedAt).toBeUndefined();
  });

  it('updates submittedBy to new user but preserves existing submittedAt reference', () => {
    const existing = {
      submittedAt: new Date('2024-01-01'),
      submittedBy: 'user-1',
    };
    const summary = buildSubmittedApprovalSummary('user-2', existing as any);
    expect(summary.submittedAt).toBeInstanceOf(Date);
    expect(summary.submittedBy).toBe('user-2');
    expect(existing.submittedBy).toBe('user-1');
  });
});

describe('buildApprovedApprovalSummary', () => {
  it('creates an approval summary with approval timestamp', () => {
    const existing = { submittedAt: new Date('2024-01-01'), submittedBy: 'user-1' };
    const summary = buildApprovedApprovalSummary('admin-1', existing as any);
    expect(summary.approvedBy).toBe('admin-1');
    expect(summary.approvedAt).toBeInstanceOf(Date);
    expect(summary.submittedBy).toBe('user-1');
    expect(summary.rejectionReason).toBeUndefined();
  });
});

describe('ensureCanApprove', () => {
  it('allows global APPROVE_CONTENT permission', () => {
    const user = makeGlobalApprover(Permission.APPROVE_CONTENT);
    expect(() => ensureCanApprove(user, ContentOwnerType.SYSTEM, null)).not.toThrow();
  });

  it('allows global APPROVE_CONTENT for org-owned content', () => {
    const user = makeGlobalApprover(Permission.APPROVE_CONTENT);
    expect(() => ensureCanApprove(user, ContentOwnerType.ORGANIZATION, 'org-1')).not.toThrow();
  });

  it('allows scoped APPROVE_CONTENT for matching org', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(true);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanApprove(user, ContentOwnerType.ORGANIZATION, 'org-1')).not.toThrow();
    vi.restoreAllMocks();
  });

  it('denies scoped APPROVE_CONTENT for non-matching org', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(false);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanApprove(user, ContentOwnerType.ORGANIZATION, 'org-2')).toThrow('You do not have permission to approve this content');
    vi.restoreAllMocks();
  });

  it('denies user without any APPROVE_CONTENT permission', () => {
    const user = makeNoPermissionUser();
    expect(() => ensureCanApprove(user, ContentOwnerType.SYSTEM, null)).toThrow('You do not have permission to approve this content');
  });

  it('denies scoped user for system-owned content (no org scope)', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(false);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanApprove(user, ContentOwnerType.SYSTEM, null)).toThrow();
    vi.restoreAllMocks();
  });

  it('denies scoped user when organizationId is null for org content', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(false);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanApprove(user, ContentOwnerType.ORGANIZATION, null)).toThrow();
    vi.restoreAllMocks();
  });
});

describe('ensureCanReject', () => {
  it('allows global REJECT_CONTENT permission', () => {
    const user = makeGlobalApprover(Permission.REJECT_CONTENT);
    expect(() => ensureCanReject(user, ContentOwnerType.SYSTEM, null)).not.toThrow();
  });

  it('allows global REJECT_CONTENT for org-owned content', () => {
    const user = makeGlobalApprover(Permission.REJECT_CONTENT);
    expect(() => ensureCanReject(user, ContentOwnerType.ORGANIZATION, 'org-1')).not.toThrow();
  });

  it('allows scoped REJECT_CONTENT for matching org', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(true);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanReject(user, ContentOwnerType.ORGANIZATION, 'org-1')).not.toThrow();
    vi.restoreAllMocks();
  });

  it('denies scoped REJECT_CONTENT for non-matching org', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(false);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanReject(user, ContentOwnerType.ORGANIZATION, 'org-2')).toThrow('You do not have permission to reject this content');
    vi.restoreAllMocks();
  });

  it('denies user without any REJECT_CONTENT permission', () => {
    const user = makeNoPermissionUser();
    expect(() => ensureCanReject(user, ContentOwnerType.SYSTEM, null)).toThrow('You do not have permission to reject this content');
  });

  it('denies scoped user for system-owned content', () => {
    vi.spyOn(orgScope, 'hasScopedOrganizationPermissionForUser').mockReturnValue(false);
    const user = makeScopedOnlyUser();
    expect(() => ensureCanReject(user, ContentOwnerType.SYSTEM, null)).toThrow();
    vi.restoreAllMocks();
  });
});
