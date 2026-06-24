import { describe, it, expect, vi, beforeEach } from 'vitest';
import Organization from '../models/Organization';
import OrgPartnership from '../models/OrgPartnership';
import { Permission } from '../types';

vi.mock('../models/Organization');
vi.mock('../models/OrgPartnership');

const mockUser = {
  userId: 'user1',
  permissions: [Permission.MANAGE_ORG_PARTNERSHIPS],
  organizationAssignments: [],
} as any;
const mockReq = (orgId: string) => ({ user: mockUser, params: { orgId }, body: {} } as any);
const mockSelectableOrg = (org: unknown) => ({
  select: vi.fn().mockResolvedValue(org),
});

describe('OrgPartnership Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('terminatePartnership', () => {
    it('should remove only the matching partner item from both orgs', async () => {
      const mockOrgA = { _id: 'orgA_id', id: 'org-a', name: 'Org A' };
      const mockOrgB = { _id: 'orgB_id', id: 'org-b', name: 'Org B' };
      const mockPartnership = {
        _id: 'partnership1',
        orgIdA: 'org-a',
        orgIdB: 'org-b',
        status: 'active',
        statusHistory: [],
        save: vi.fn(),
      };

      (Organization.findOne as any).mockImplementation(({ id }: { id: string }) => {
        if (id === 'org-a') {return mockSelectableOrg(mockOrgA);}
        if (id === 'org-b') {return mockSelectableOrg(mockOrgB);}
        return mockSelectableOrg(null);
      });

      (OrgPartnership.findOne as any).mockResolvedValue(mockPartnership);

      const { terminatePartnership } = await import('./org-partnership.service');
      await terminatePartnership(mockReq('org-a'), 'org-a', 'partnership1');

      expect(Organization.updateOne).toHaveBeenCalledTimes(2);
      expect(Organization.updateOne).toHaveBeenCalledWith(
        { id: 'org-a' },
        { $pull: { partnerItems: { name: 'Org B' } } }
      );
      expect(Organization.updateOne).toHaveBeenCalledWith(
        { id: 'org-b' },
        { $pull: { partnerItems: { name: 'Org A' } } }
      );
      expect(mockPartnership.status).toBe('terminated');
      expect(mockPartnership.save).toHaveBeenCalled();
    });

    it('should not remove other partner items on termination', async () => {
      const mockOrgA = { _id: 'orgA_id', id: 'org-a', name: 'Org A' };
      const mockOrgB = { _id: 'orgB_id', id: 'org-b', name: 'Org B' };
      const mockPartnership = {
        _id: 'partnership1',
        orgIdA: 'org-a',
        orgIdB: 'org-b',
        status: 'active',
        statusHistory: [],
        save: vi.fn(),
      };

      (Organization.findOne as any).mockImplementation(({ id }: { id: string }) => {
        if (id === 'org-a') {return mockSelectableOrg(mockOrgA);}
        if (id === 'org-b') {return mockSelectableOrg(mockOrgB);}
        return mockSelectableOrg(null);
      });

      (OrgPartnership.findOne as any).mockResolvedValue(mockPartnership);

      const { terminatePartnership } = await import('./org-partnership.service');
      await terminatePartnership(mockReq('org-a'), 'org-a', 'partnership1');

      expect(Organization.updateOne).toHaveBeenCalledWith(
        { id: 'org-a' },
        { $pull: { partnerItems: { name: 'Org B' } } }
      );
      const $pull = (Organization.updateOne as any).mock.calls[0][1].$pull;
      expect($pull).not.toEqual({ name: { $exists: true } });
    });
  });
});
