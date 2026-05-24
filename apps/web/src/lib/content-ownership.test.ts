import { describe, expect, it } from 'vitest';
import { getOwnershipLabel } from './content-ownership';

describe('getOwnershipLabel', () => {
  it('returns system label for system-owned items', () => {
    const result = getOwnershipLabel({ ownerType: 'system' });
    expect(result).toBe('System');
  });

  it('returns custom system label when provided', () => {
    const result = getOwnershipLabel({ ownerType: 'system' }, 'Admin');
    expect(result).toBe('Admin');
  });

  it('returns organization name for organization-owned items', () => {
    const result = getOwnershipLabel({ ownerType: 'organization', organizationName: 'ACM' });
    expect(result).toBe('ACM');
  });

  it('falls back to organizationId when name is not available', () => {
    const result = getOwnershipLabel({ ownerType: 'organization', organizationId: 'org-123' });
    expect(result).toBe('org-123');
  });

  it('falls back to generic label when no org info', () => {
    const result = getOwnershipLabel({ ownerType: 'organization' });
    expect(result).toBe('Organization');
  });

  it('handles string ownerType values', () => {
    const result = getOwnershipLabel({ ownerType: 'system' });
    expect(result).toBe('System');
  });
});
