import { describe, expect, it } from 'vitest';
import {
  shouldResetApprovalOnEdit,
  canPublishFromWorkflowStatus,
  buildSubmittedApprovalSummary,
  buildApprovedApprovalSummary,
  buildRejectedApprovalSummary,
} from './contentApproval';
import { NewsStatus, EventStatus } from '../types';

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

describe('buildRejectedApprovalSummary', () => {
  it('creates a rejection summary with reason', () => {
    const existing = { submittedAt: new Date('2024-01-01'), submittedBy: 'user-1' };
    const summary = buildRejectedApprovalSummary('admin-1', 'Not good enough', existing as any);
    expect(summary.rejectedBy).toBe('admin-1');
    expect(summary.rejectedAt).toBeInstanceOf(Date);
    expect(summary.rejectionReason).toBe('Not good enough');
    expect(summary.approvedAt).toBeUndefined();
  });
});
