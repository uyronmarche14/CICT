import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate, type AuthRequest } from './auth';

vi.mock('jsonwebtoken');
vi.mock('../models/User', () => ({
  default: {
    findById: vi.fn(),
  },
}));
vi.mock('../utils/rbac', () => ({
  buildAuthenticatedUser: vi.fn(),
}));
vi.mock('../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import User from '../models/User';
import { buildAuthenticatedUser } from '../utils/rbac';

const mockedJwt = vi.mocked(jwt);
const mockedUserFindById = vi.mocked(User.findById);
const mockedBuildAuthUser = vi.mocked(buildAuthenticatedUser);

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    headers: {},
    cookies: {},
    ...overrides,
  } as AuthRequest;
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

class MockTokenExpiredError extends Error {
  name = 'TokenExpiredError';
}

class MockJsonWebTokenError extends Error {
  name = 'JsonWebTokenError';
}

const mockUser = {
  _id: 'user123',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'semi_admin',
  isActive: true,
  customRole: undefined,
};

const mockAuthUser = {
  userId: 'user123',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'semi_admin',
  permissions: ['view_users'] as any[],
  canAccessAdmin: true,
  effectiveRoleLabel: 'Semi Admin',
  baseRoleLabel: 'Semi Admin',
  isActive: true,
};

describe('authenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns 401 when no token is provided', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided. Authorization denied.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid JWT', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer invalid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new MockJsonWebTokenError('invalid token');
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token',
    });
  });

  it('returns 401 for expired token', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer expired' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new MockTokenExpiredError('jwt expired');
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token has expired',
    });
  });

  it('returns 500 for unknown errors', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new Error('some other error');
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication failed',
    });
  });

  it('returns 401 when user not found', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'missing-user',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(null as any);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User no longer exists',
    });
  });

  it('returns 403 when user is deactivated', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue({
      ...mockUser,
      isActive: false,
    } as any);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Your account has been deactivated',
    });
  });

  it('returns 403 when buildAuthenticatedUser throws', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(mockUser as any);
    mockedBuildAuthUser.mockRejectedValue(new Error('role deleted'));

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Your assigned role is no longer valid',
    });
  });

  it('sets req.user and calls next on success via Bearer header', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(mockUser as any);
    mockedBuildAuthUser.mockResolvedValue(mockAuthUser as any);

    await authenticate(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual(mockAuthUser);
    expect(next).toHaveBeenCalled();
  });

  it('extracts token from cookie when no Bearer header', async () => {
    const req = mockReq({
      headers: {},
      cookies: { token: 'cookie-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(mockUser as any);
    mockedBuildAuthUser.mockResolvedValue(mockAuthUser as any);

    await authenticate(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalledWith('cookie-token', 'test-secret');
    expect(req.user).toEqual(mockAuthUser);
    expect(next).toHaveBeenCalled();
  });

  it('returns 500 when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    const req = mockReq({
      headers: { authorization: 'Bearer token' },
    });
    const res = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server configuration error',
    });
  });
});

describe('optionalAuthenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('calls next without user when no token', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next without user when token is invalid (silent)', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer invalid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new Error('bad token');
    });

    await optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next without user when token expired (silent)', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer expired' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new MockTokenExpiredError('jwt expired');
    });

    await optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next without user when user not found (silent)', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'missing',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(null as any);

    await optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next without user when user is deactivated (silent)', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue({
      ...mockUser,
      isActive: false,
    } as any);

    await optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with user when token is valid and user active', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(mockUser as any);
    mockedBuildAuthUser.mockResolvedValue(mockAuthUser as any);

    await optionalAuthenticate(req, res, next);

    expect(req.user).toEqual(mockAuthUser);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next without user when buildAuthenticatedUser throws (silent)', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      userId: 'user123',
      email: 'test@test.com',
      role: 'semi_admin',
    });
    mockedUserFindById.mockResolvedValue(mockUser as any);
    mockedBuildAuthUser.mockRejectedValue(new Error('role deleted'));

    await optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });
});
