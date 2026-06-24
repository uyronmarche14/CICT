import { describe, expect, it } from 'vitest';
import { ContentOwnerType, NewsStatus, Permission } from '@/types';
import {
  canActOnContent,
  getVisibleWorkflowActions,
  getWorkflowActionLabel,
} from './workflow';

const noScopedReader = {
  hasPermission: (permission: Permission) => permission === Permission.APPROVE_CONTENT,
  hasScopedPermission: () => false,
};

describe('admin content workflow helpers', () => {
  it('returns approval actions for globally permitted pending content', () => {
    const actions = getVisibleWorkflowActions(
      'news',
      { status: NewsStatus.PENDING_APPROVAL, ownerType: ContentOwnerType.SYSTEM },
      noScopedReader
    );

    expect(actions).toEqual(['approve']);
  });

  it('allows scoped organization permissions for organization-owned content', () => {
    expect(
      canActOnContent(
        {
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'org-1',
        },
        Permission.PUBLISH_NEWS,
        {
          hasPermission: () => false,
          hasScopedPermission: (organizationId, permission) =>
            organizationId === 'org-1' && permission === Permission.PUBLISH_NEWS,
        }
      )
    ).toBe(true);
  });

  it('labels submit action with user-facing approval copy', () => {
    expect(getWorkflowActionLabel('submit')).toBe('Submit for approval');
    expect(getWorkflowActionLabel('archive')).toBe('Archive');
  });
});
