import { describe, expect, it } from 'vitest';
import { buildOwnershipFilter, buildUpdatePayload, canViewUnpublishedContent } from './content.service';
import { ContentOwnerType, Permission } from '../types';

describe('buildOwnershipFilter', () => {
  it('returns empty filter when no parameters given', () => {
    expect(buildOwnershipFilter()).toEqual({});
  });

  it('includes ownerType when provided', () => {
    const result = buildOwnershipFilter(ContentOwnerType.ORGANIZATION);
    expect(result).toEqual({ ownerType: ContentOwnerType.ORGANIZATION });
  });

  it('includes organizationId when provided', () => {
    const result = buildOwnershipFilter(undefined, 'org-123');
    expect(result).toEqual({ organizationId: 'org-123' });
  });

  it('includes both ownerType and organizationId', () => {
    const result = buildOwnershipFilter(ContentOwnerType.ORGANIZATION, 'org-123');
    expect(result).toEqual({ ownerType: ContentOwnerType.ORGANIZATION, organizationId: 'org-123' });
  });

  it('omits organizationId when null', () => {
    const result = buildOwnershipFilter(ContentOwnerType.SYSTEM, null);
    expect(result).toEqual({ ownerType: ContentOwnerType.SYSTEM });
  });
});

describe('buildUpdatePayload', () => {
  const EDITABLE_FIELDS = ['title', 'bodyHtml', 'priority'] as const;

  it('extracts only editable fields from body', () => {
    const result = buildUpdatePayload(
      { title: 'Test', bodyHtml: '<p>Hi</p>', priority: 'high', secretField: 'should-not-appear' },
      EDITABLE_FIELDS
    );
    expect(result).toEqual({ title: 'Test', bodyHtml: '<p>Hi</p>', priority: 'high' });
  });

  it('skips undefined values', () => {
    const result = buildUpdatePayload({ title: 'Test', bodyHtml: undefined }, EDITABLE_FIELDS);
    expect(result).toEqual({ title: 'Test' });
  });

  it('returns empty object when no editable fields in body', () => {
    const result = buildUpdatePayload({ secretField: 'x' }, EDITABLE_FIELDS);
    expect(result).toEqual({});
  });

  it('preserves falsy but non-undefined values like empty string', () => {
    const result = buildUpdatePayload({ title: '', bodyHtml: '<p></p>' }, EDITABLE_FIELDS);
    expect(result).toEqual({ title: '', bodyHtml: '<p></p>' });
  });
});

describe('canViewUnpublishedContent', () => {
  it('returns false when user is not authenticated', () => {
    const req = { user: undefined } as any;
    expect(canViewUnpublishedContent(req, Permission.VIEW_NEWS)).toBe(false);
  });

  it('returns true when user has the global permission', () => {
    const req = {
      user: { permissions: [Permission.VIEW_NEWS, Permission.VIEW_ANNOUNCEMENT] },
    } as any;
    expect(canViewUnpublishedContent(req, Permission.VIEW_NEWS)).toBe(true);
  });

  it('returns false when user lacks the global permission', () => {
    const req = {
      user: { permissions: [Permission.VIEW_EVENT] },
    } as any;
    expect(canViewUnpublishedContent(req, Permission.VIEW_NEWS)).toBe(false);
  });
});
