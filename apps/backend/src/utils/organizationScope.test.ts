import { describe, expect, it } from 'vitest';
import { resolveOwnershipInput } from './organizationScope';
import { ContentOwnerType } from '../types';

describe('resolveOwnershipInput', () => {
  it('resolves ORGANIZATION ownerType', () => {
    const result = resolveOwnershipInput({ ownerType: ContentOwnerType.ORGANIZATION, organizationId: 'org-123' });
    expect(result.ownerType).toBe(ContentOwnerType.ORGANIZATION);
    expect(result.organizationId).toBe('org-123');
  });

  it('resolves SYSTEM ownerType for non-organization values', () => {
    const result = resolveOwnershipInput({ ownerType: 'unknown', organizationId: null });
    expect(result.ownerType).toBe(ContentOwnerType.SYSTEM);
  });

  it('defaults to SYSTEM when ownerType is undefined', () => {
    const result = resolveOwnershipInput({});
    expect(result.ownerType).toBe(ContentOwnerType.SYSTEM);
    expect(result.organizationId).toBeNull();
  });

  it('normalizes organizationId to null for non-string values', () => {
    const result = resolveOwnershipInput({ ownerType: ContentOwnerType.ORGANIZATION, organizationId: 123 as any });
    expect(result.organizationId).toBeNull();
  });

  it('trims and lowercases organizationId', () => {
    const result = resolveOwnershipInput({ ownerType: ContentOwnerType.ORGANIZATION, organizationId: '  ORG-123  ' });
    expect(result.organizationId).toBe('org-123');
  });
});
