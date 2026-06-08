import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import { authorize, authorizeAny, isAdmin, requireAdminAccess } from './permissions';
import type { AuthRequest } from './auth';

vi.mock('../utils/rbac', () => ({
  hasGlobalPermission: vi.fn(),
  canAccessAdminPanel: vi.fn(),
}));
vi.mock('../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { hasGlobalPermission, canAccessAdminPanel } from '../utils/rbac';

const mockedHasGlobalPermission = vi.mocked(hasGlobalPermission);
const mockedCanAccessAdminPanel = vi.mocked(canAccessAdminPanel);

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return overrides as AuthRequest;
}

function mockRes(): Response {
  const res = {} as Response;
  (res as any).status = vi.fn().mockReturnValue(res);
  (res as any).json = vi.fn().mockReturnValue(res);
  return res;
}

function mockNext(): NextFunction {
  return vi.fn();
}

const mockUser = {
  userId: 'user123',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'semi_admin' as const,
  permissions: ['view_users', 'edit_user'] as any[],
  canAccessAdmin: false,
  effectiveRoleLabel: 'Semi Admin',
  baseRoleLabel: 'Semi Admin',
  isActive: true,
  organizationAssignments: [],
};

const VIEW_USERS = 'view_users';
const EDIT_USER = 'edit_user';
const DELETE_USER = 'delete_user';

describe('authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when req.user is missing', async () => {
    const middleware = authorize(VIEW_USERS as any);
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required',
    });
  });

  it('calls next when user has the required permission', async () => {
    mockedHasGlobalPermission.mockReturnValue(true);
    const middleware = authorize(VIEW_USERS as any);
    const req = mockReq({ user: mockUser as any });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockedHasGlobalPermission).toHaveBeenCalledWith(mockUser, VIEW_USERS);
  });

  it('returns 403 when user is missing the required permission', async () => {
    mockedHasGlobalPermission.mockReturnValue(false);
    const middleware = authorize(VIEW_USERS as any);
    const req = mockReq({ user: mockUser as any });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  });

  it('requires all specified permissions (checks every one)', async () => {
    const middleware = authorize(VIEW_USERS as any, EDIT_USER as any);
    const req = mockReq({ user: mockUser as any });
    const res = mockRes();
    const next = mockNext();

    mockedHasGlobalPermission.mockReturnValueOnce(true).mockReturnValueOnce(false);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 500 on unexpected error', async () => {
    mockedHasGlobalPermission.mockImplementation(() => {
      throw new Error('unexpected');
    });
    const middleware = authorize(VIEW_USERS as any);
    const req = mockReq({ user: mockUser as any });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authorization check failed',
    });
  });
});

describe('authorizeAny', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when req.user is missing', async () => {
    const middleware = authorizeAny(VIEW_USERS as any);
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next when user has at least one allowed permission', async () => {
    mockedHasGlobalPermission
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const middleware = authorizeAny(VIEW_USERS as any, EDIT_USER as any);
    const req = mockReq({ user: mockUser as any });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when user has none of the allowed permissions', async () => {
    mockedHasGlobalPermission.mockReturnValue(false);
    const middleware = authorizeAny(VIEW_USERS as any, DELETE_USER as any);
    const req = mockReq({ user: mockUser as any });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  });
});

describe('isAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when req.user is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required',
    });
  });

  it('calls next when user canAccessAdmin is true', async () => {
    const req = mockReq({ user: { ...mockUser, canAccessAdmin: true } as any });
    const res = mockRes();
    const next = mockNext();

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when user canAccessAdmin is false', async () => {
    const req = mockReq({ user: { ...mockUser, canAccessAdmin: false } as any });
    const res = mockRes();
    const next = mockNext();

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Admin access required',
    });
  });
});

describe('requireAdminAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when req.user is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await requireAdminAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next when user canAccessAdmin is true', async () => {
    const req = mockReq({ user: { ...mockUser, canAccessAdmin: true } as any });
    const res = mockRes();
    const next = mockNext();

    await requireAdminAccess(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('calls next when canAccessAdminPanel returns true', async () => {
    mockedCanAccessAdminPanel.mockReturnValue(true);
    const req = mockReq({
      user: {
        ...mockUser,
        canAccessAdmin: false,
        permissions: ['view_users'] as any[],
        organizationAssignments: [{ organizationId: 'org-1', permissions: ['view_users'] }] as any[],
      } as any,
    });
    const res = mockRes();
    const next = mockNext();

    await requireAdminAccess(req, res, next);

    expect(mockedCanAccessAdminPanel).toHaveBeenCalledWith(
      ['view_users'],
      [{ organizationId: 'org-1', permissions: ['view_users'] }]
    );
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when neither canAccessAdmin nor canAccessAdminPanel', async () => {
    mockedCanAccessAdminPanel.mockReturnValue(false);
    const req = mockReq({
      user: {
        ...mockUser,
        canAccessAdmin: false,
        permissions: [],
        organizationAssignments: [],
      } as any,
    });
    const res = mockRes();
    const next = mockNext();

    await requireAdminAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You do not have access to the admin panel',
    });
  });
});
