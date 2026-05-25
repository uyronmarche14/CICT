import { describe, expect, it, vi } from 'vitest';
import { submitForApproval, approve, reject, publish, archive } from './content-approval.service';
import { AppError } from '../middleware/errorHandler';
import { Permission, UserRole, ContentOwnerType } from '../types';

const mockUser = {
  userId: 'user-1',
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.FULL_ADMIN,
  permissions: [
    Permission.APPROVE_CONTENT,
    Permission.REJECT_CONTENT,
    Permission.PUBLISH_NEWS,
    Permission.ARCHIVE_NEWS,
    Permission.SUBMIT_CONTENT_FOR_APPROVAL,
    Permission.PUBLISH_ANNOUNCEMENT,
    Permission.PUBLISH_EVENT,
    Permission.ARCHIVE_ANNOUNCEMENT,
    Permission.ARCHIVE_EVENT,
  ],
  isActive: true,
};

const makeMockItem = (overrides = {}) => {
  const item = {
    _id: 'item-1',
    status: 'DRAFT',
    ownerType: ContentOwnerType.SYSTEM,
    organizationId: null,
    approvalSummary: null,
    save: vi.fn().mockResolvedValue(undefined),
    publishedAt: undefined,
    archivedAt: undefined,
    ...overrides,
  };
  return item;
};



describe('submitForApproval', () => {
  it('throws 404 when item is null', async () => {
    await expect(submitForApproval('abc', mockUser, null, 'news', Permission.SUBMIT_CONTENT_FOR_APPROVAL, 'DRAFT', 'PENDING_APPROVAL')).rejects.toThrow(AppError);
    await expect(submitForApproval('abc', mockUser, null, 'news', Permission.SUBMIT_CONTENT_FOR_APPROVAL, 'DRAFT', 'PENDING_APPROVAL')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when item is not in draft status', async () => {
    const item = makeMockItem({ status: 'PUBLISHED' });
    await expect(submitForApproval('abc', mockUser, item, 'news', Permission.SUBMIT_CONTENT_FOR_APPROVAL, 'DRAFT', 'PENDING_APPROVAL')).rejects.toThrow('Only draft news can be submitted for approval');
  });
});

describe('approve', () => {
  it('throws 404 when item is null', async () => {
    await expect(approve('abc', mockUser, null, 'news', 'PENDING_APPROVAL', 'APPROVED')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when item is not in pending status', async () => {
    const item = makeMockItem({ status: 'DRAFT' });
    await expect(approve('abc', mockUser, item, 'news', 'PENDING_APPROVAL', 'APPROVED')).rejects.toThrow('Only pending approval news can be approved');
  });
});

describe('reject', () => {
  it('throws 404 when item is null', async () => {
    await expect(reject('abc', mockUser, null, 'news', 'PENDING_APPROVAL', 'REJECTED', 'bad content')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when no reason is provided', async () => {
    const item = makeMockItem({ status: 'PENDING_APPROVAL' });
    await expect(reject('abc', mockUser, item, 'news', 'PENDING_APPROVAL', 'REJECTED', '')).rejects.toThrow('Rejection reason is required');
  });

  it('throws 400 when item is not pending', async () => {
    const item = makeMockItem({ status: 'PUBLISHED' });
    await expect(reject('abc', mockUser, item, 'news', 'PENDING_APPROVAL', 'REJECTED', 'bad')).rejects.toThrow('Only pending approval news can be rejected');
  });
});

describe('publish', () => {
  it('throws 404 when item is null', async () => {
    await expect(publish('abc', mockUser, null, 'news', Permission.PUBLISH_NEWS, 'PUBLISHED')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when item status is not publishable', async () => {
    const item = makeMockItem({ status: 'PENDING_APPROVAL' });
    await expect(publish('abc', mockUser, item, 'news', Permission.PUBLISH_NEWS, 'PUBLISHED')).rejects.toThrow('Only draft or approved news can be published');
  });
});

describe('archive', () => {
  it('throws 404 when item is null', async () => {
    await expect(archive('abc', mockUser, null, 'news', Permission.ARCHIVE_NEWS, 'PUBLISHED', 'ARCHIVED')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when item is not published', async () => {
    const item = makeMockItem({ status: 'DRAFT' });
    await expect(archive('abc', mockUser, item, 'news', Permission.ARCHIVE_NEWS, 'PUBLISHED', 'ARCHIVED')).rejects.toThrow('Only published news can be archived');
  });
});
