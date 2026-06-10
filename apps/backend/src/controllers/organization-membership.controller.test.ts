import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const mockMembership = {
  _id: 'membership-1',
  studentId: 'student-1',
  organizationId: 'test-org',
  position: 'Member',
  memberType: 'general',
  status: 'applied',
  appliedAt: new Date(),
  history: [],
  save: vi.fn(),
  populate: vi.fn().mockReturnThis(),
};

vi.mock('../models/OrganizationMembership', () => ({
  default: {
    find: vi.fn().mockReturnThis(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../models/Organization', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn(),
  },
}));

vi.mock('../models/Student', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('../utils/organizationScope', () => ({
  canAccessOrganizationScope: vi.fn().mockReturnValue(true),
}));

import OrganizationMembership from '../models/OrganizationMembership';
import Organization from '../models/Organization';
import {
  approveMembership,
  rejectMembership,
  getOrganizationMemberships,
  getPendingMemberships,
} from './organization-membership.controller';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    params: { orgId: 'test-org', id: 'membership-1' },
    user: {
      userId: 'admin-1',
      canAccessAdmin: true,
      permissions: [],
      scopedAdminModulesByOrganization: {},
      organizationAssignments: [],
      visibleAdminModules: [],
    },
    ...overrides,
  } as unknown as AuthRequest;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('Organization Membership Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('approveMembership', () => {
    it('approves an applied membership', async () => {
      const req = mockReq();
      const res = mockRes();

      const savedMembership = {
        ...mockMembership,
        status: 'applied',
        save: vi.fn().mockResolvedValue(undefined),
      };
      const populated = { ...savedMembership };
      (OrganizationMembership.findOne as any).mockResolvedValue(savedMembership);
      (OrganizationMembership.findById as any).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(populated),
      });

      await approveMembership(req, res);

      expect(savedMembership.status).toBe('active');
      expect(savedMembership.approvedAt).toBeInstanceOf(Date);
      expect(savedMembership.history.length).toBe(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
      }));
    });

    it('rejects approval if status is not applied or invited', async () => {
      const req = mockReq();
      const res = mockRes();

      (OrganizationMembership.findOne as any).mockResolvedValue({
        ...mockMembership,
        status: 'active',
      });

      await expect(approveMembership(req, res)).rejects.toThrow(
        'Only applied or invited memberships can be approved'
      );
    });

    it('returns 404 if membership not found', async () => {
      const req = mockReq();
      const res = mockRes();

      (OrganizationMembership.findOne as any).mockResolvedValue(null);

      await expect(approveMembership(req, res)).rejects.toThrow(
        'Membership not found'
      );
    });
  });

  describe('rejectMembership', () => {
    it('rejects an applied membership', async () => {
      const req = mockReq();
      const res = mockRes();

      const membership = {
        ...mockMembership,
        status: 'applied',
        save: vi.fn().mockResolvedValue(undefined),
      };
      (OrganizationMembership.findOne as any).mockResolvedValue(membership);

      await rejectMembership(req, res);

      expect(membership.status).toBe('rejected');
      expect(membership.rejectedAt).toBeInstanceOf(Date);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
      }));
    });

    it('rejects rejection if status is not applied or invited', async () => {
      const req = mockReq();
      const res = mockRes();

      (OrganizationMembership.findOne as any).mockResolvedValue({
        ...mockMembership,
        status: 'active',
      });

      await expect(rejectMembership(req, res)).rejects.toThrow(
        'Only applied or invited memberships can be rejected'
      );
    });
  });

  describe('getOrganizationMemberships', () => {
    it('lists memberships for an organization', async () => {
      const req = mockReq({ query: { page: '1', limit: '20' } });
      const res = mockRes();

      (OrganizationMembership.find as any).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockMembership]),
      });
      (OrganizationMembership.countDocuments as any).mockResolvedValue(1);

      await getOrganizationMemberships(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          memberships: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            total: 1,
          }),
        }),
      }));
    });
  });

  describe('getPendingMemberships', () => {
    it('returns pending memberships for global admin', async () => {
      const req = mockReq();
      const res = mockRes();

      (OrganizationMembership.find as any).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockMembership]),
      });
      (Organization.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([{ id: 'test-org', name: 'Test Org' }]),
      });

      await getPendingMemberships(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          memberships: expect.any(Array),
        }),
      }));
    });

    it('filters by scoped orgs for scoped admin', async () => {
      const req = mockReq({
        user: {
          userId: 'scoped-admin-1',
          canAccessAdmin: false,
          permissions: [],
          scopedAdminModulesByOrganization: {
            'my-org': ['organizations'],
          },
          organizationAssignments: [],
          visibleAdminModules: [],
        },
      });
      const res = mockRes();

      (OrganizationMembership.find as any).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      });
      (Organization.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      });

      await getPendingMemberships(req, res);

      expect(OrganizationMembership.find).toHaveBeenCalledWith(expect.objectContaining({
        status: 'applied',
        organizationId: { $in: ['my-org'] },
      }));
    });
  });
});
