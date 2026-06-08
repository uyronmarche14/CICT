import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const { mockedRateLimit, mockedIpKeyGenerator } = vi.hoisted(() => {
  const mockedRateLimit = vi.fn((opts: any) => opts);
  const mockedIpKeyGenerator = vi.fn((ip: string) => `ip:${ip}`);
  return { mockedRateLimit, mockedIpKeyGenerator };
});

vi.mock('express-rate-limit', () => ({
  default: mockedRateLimit,
  ipKeyGenerator: mockedIpKeyGenerator,
}));

import {
  createGeneralApiRateLimiter,
  createAuthLoginRateLimiter,
  createAuthSessionRateLimiter,
  createStudentLoginRateLimiter,
} from './rateLimiters';

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    path: '/api/events',
    body: {},
    ip: '1.2.3.4',
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  const res = {} as Response;
  (res as any).status = vi.fn().mockReturnValue(res);
  (res as any).json = vi.fn().mockReturnValue(res);
  return res;
}

describe('createGeneralApiRateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a rate limiter config with default values', () => {
    const config = createGeneralApiRateLimiter() as any;

    expect(config.windowMs).toBe(900000);
    expect(config.max).toBe(100);
    expect(config.standardHeaders).toBe(true);
    expect(config.legacyHeaders).toBe(false);
    expect(config.handler).toBeDefined();
    expect(config.skip).toBeDefined();
  });

  it('uses env var values when set', () => {
    vi.stubEnv('RATE_LIMIT_WINDOW_MS', '60000');
    vi.stubEnv('RATE_LIMIT_MAX_REQUESTS', '50');

    const config = createGeneralApiRateLimiter() as any;

    expect(config.windowMs).toBe(60000);
    expect(config.max).toBe(50);

    vi.unstubAllEnvs();
  });

  it('falls back to defaults for invalid env var values', () => {
    vi.stubEnv('RATE_LIMIT_WINDOW_MS', 'invalid');
    vi.stubEnv('RATE_LIMIT_MAX_REQUESTS', '-5');

    const config = createGeneralApiRateLimiter() as any;

    expect(config.windowMs).toBe(900000);
    expect(config.max).toBe(100);

    vi.unstubAllEnvs();
  });

  it('handler returns 429 with JSON message', () => {
    const config = createGeneralApiRateLimiter() as any;
    const res = mockRes();

    config.handler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  });
});

describe('createGeneralApiRateLimiter skip (isAuthRoute)', () => {
  let skip: (req: Request) => boolean;

  beforeEach(() => {
    const config = createGeneralApiRateLimiter() as any;
    skip = config.skip;
  });

  it('skips for /auth/login', () => {
    expect(skip(mockReq({ path: '/auth/login' }))).toBe(true);
  });

  it('skips for /auth/logout', () => {
    expect(skip(mockReq({ path: '/auth/logout' }))).toBe(true);
  });

  it('skips for /auth/profile', () => {
    expect(skip(mockReq({ path: '/auth/profile' }))).toBe(true);
  });

  it('does not skip for non-auth routes', () => {
    expect(skip(mockReq({ path: '/api/events' }))).toBe(false);
  });

  it('does not skip for /api/auth/login (full path)', () => {
    expect(skip(mockReq({ path: '/api/auth/login' }))).toBe(false);
  });
});

describe('createAuthLoginRateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a rate limiter with login-specific defaults', () => {
    const config = createAuthLoginRateLimiter() as any;

    expect(config.windowMs).toBe(900000);
    expect(config.max).toBe(10);
  });

  it('uses env var values when set', () => {
    vi.stubEnv('AUTH_LOGIN_RATE_LIMIT_WINDOW_MS', '300000');
    vi.stubEnv('AUTH_LOGIN_RATE_LIMIT_MAX_REQUESTS', '5');

    const config = createAuthLoginRateLimiter() as any;

    expect(config.windowMs).toBe(300000);
    expect(config.max).toBe(5);

    vi.unstubAllEnvs();
  });

  it('handler returns 429 with login-specific message', () => {
    const config = createAuthLoginRateLimiter() as any;
    const res = mockRes();

    config.handler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Too many login attempts from this IP, please try again later.',
    });
  });
});

describe('createAuthSessionRateLimiter', () => {
  it('has higher default max for session routes', () => {
    const config = createAuthSessionRateLimiter() as any;

    expect(config.max).toBe(300);
  });

  it('uses custom env var values', () => {
    vi.stubEnv('AUTH_SESSION_RATE_LIMIT_WINDOW_MS', '1800000');
    vi.stubEnv('AUTH_SESSION_RATE_LIMIT_MAX_REQUESTS', '500');

    const config = createAuthSessionRateLimiter() as any;

    expect(config.windowMs).toBe(1800000);
    expect(config.max).toBe(500);

    vi.unstubAllEnvs();
  });

  it('handler returns 429 with session-specific message', () => {
    const config = createAuthSessionRateLimiter() as any;
    const res = mockRes();

    config.handler(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Too many authentication requests from this IP, please try again later.',
    });
  });
});

describe('createStudentLoginRateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct default limits', () => {
    const config = createStudentLoginRateLimiter() as any;

    expect(config.windowMs).toBe(900000);
    expect(config.max).toBe(10);
  });

  it('keyGenerator uses identifier from body', () => {
    const config = createStudentLoginRateLimiter() as any;
    const keyGen = config.keyGenerator;

    const req = mockReq({ body: { identifier: ' TEST-123 ' }, ip: '10.0.0.1' });

    const key = keyGen(req);

    expect(key).toBe('student_login:test-123');
  });

  it('keyGenerator falls back to ipKeyGenerator when no identifier', () => {
    const config = createStudentLoginRateLimiter() as any;
    const keyGen = config.keyGenerator;

    const req = mockReq({ body: {}, ip: '10.0.0.1' });

    const key = keyGen(req);

    expect(key).toBe('ip:10.0.0.1');
    expect(mockedIpKeyGenerator).toHaveBeenCalledWith('10.0.0.1');
  });

  it('keyGenerator falls back to ipKeyGenerator with empty string when no ip', () => {
    const config = createStudentLoginRateLimiter() as any;
    const keyGen = config.keyGenerator;

    const req = mockReq({ body: {}, ip: undefined });

    keyGen(req);

    expect(mockedIpKeyGenerator).toHaveBeenCalledWith('');
  });

  it('handler returns 429 with student-specific message', () => {
    const config = createStudentLoginRateLimiter() as any;
    const res = mockRes();

    config.handler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Too many login attempts for this account, please try again later.',
    });
  });
});
