import { describe, it, expect, vi, afterAll } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { csrfProtection } from './csrf';

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/api/events',
    headers: {},
    cookies: {},
    ...overrides,
  } as Request;
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

describe('csrfProtection', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('skips CSRF for GET method', () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('skips CSRF for HEAD method', () => {
    const req = mockReq({ method: 'HEAD' });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('skips CSRF for OPTIONS method', () => {
    const req = mockReq({ method: 'OPTIONS' });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('skips CSRF in development mode', () => {
    process.env.NODE_ENV = 'development';
    const req = mockReq({ method: 'POST', path: '/api/users' });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();

    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for Bearer token requests', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/users',
      headers: { authorization: 'Bearer some-token' },
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();

    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt auth route: POST /api/auth/login', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/auth/login',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();

    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt auth route: POST /api/auth/forgot-password', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/auth/forgot-password',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt auth route: POST /api/auth/reset-password', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/auth/reset-password',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt student route: POST /api/student/auth/register', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/student/auth/register',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt student route: POST /api/student/auth/login', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/student/auth/login',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt student route: POST /api/student/auth/forgot-password', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/student/auth/forgot-password',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt student route: POST /api/student/auth/reset-password', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/student/auth/reset-password',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('skips CSRF for exempt student route: POST /api/student/auth/refresh', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/student/auth/refresh',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('rejects POST to non-exempt route with no csrf cookie', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/users',
      cookies: {},
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid CSRF token',
    });
    process.env.NODE_ENV = 'test';
  });

  it('rejects POST to non-exempt route with csrf mismatch', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/users',
      cookies: { csrf_token: 'cookie-token' },
      headers: { 'x-csrf-token': 'different-token' },
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid CSRF token',
    });
    process.env.NODE_ENV = 'test';
  });

  it('rejects POST to non-exempt route with missing header token', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/users',
      cookies: { csrf_token: 'some-token' },
      headers: {},
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    process.env.NODE_ENV = 'test';
  });

  it('allows POST to non-exempt route when csrf cookie and header match', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/api/users',
      cookies: { csrf_token: 'matching-token' },
      headers: { 'x-csrf-token': 'matching-token' },
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });

  it('case-insensitive path matching for exempt routes', () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq({
      method: 'POST',
      path: '/API/AUTH/LOGIN',
    });
    const res = mockRes();
    const next = mockNext();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    process.env.NODE_ENV = 'test';
  });
});
