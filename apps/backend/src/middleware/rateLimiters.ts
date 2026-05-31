import type { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const createJsonRateLimitHandler =
  (message: string) =>
  (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message,
    });
  };

const isAuthRoute = (req: Request) => {
  const path = req.path.toLowerCase();
  return path === '/auth/login' || path === '/auth/logout' || path === '/auth/profile';
};

export const createGeneralApiRateLimiter = () =>
  rateLimit({
    windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    max: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    standardHeaders: true,
    legacyHeaders: false,
    skip: isAuthRoute,
    handler: createJsonRateLimitHandler(
      'Too many requests from this IP, please try again later.'
    ),
  });

export const createAuthLoginRateLimiter = () =>
  rateLimit({
    windowMs: parsePositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS, 900000),
    max: parsePositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT_MAX_REQUESTS, 10),
    standardHeaders: true,
    legacyHeaders: false,
    handler: createJsonRateLimitHandler(
      'Too many login attempts from this IP, please try again later.'
    ),
  });

export const createAuthSessionRateLimiter = () =>
  rateLimit({
    windowMs: parsePositiveInt(process.env.AUTH_SESSION_RATE_LIMIT_WINDOW_MS, 900000),
    max: parsePositiveInt(process.env.AUTH_SESSION_RATE_LIMIT_MAX_REQUESTS, 300),
    standardHeaders: true,
    legacyHeaders: false,
    handler: createJsonRateLimitHandler(
      'Too many authentication requests from this IP, please try again later.'
    ),
  });

/**
 * Rate limiter keyed by identifier (student number or email) to prevent
 * brute-force attacks across different accounts from a single IP.
 */
export const createStudentLoginRateLimiter = () =>
  rateLimit({
    windowMs: parsePositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS, 900000),
    max: parsePositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT_MAX_REQUESTS, 10),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const identifier = req.body?.identifier as string | undefined;
      return identifier ? `student_login:${identifier.trim().toLowerCase()}` : ipKeyGenerator(req.ip ?? '');
    },
    handler: createJsonRateLimitHandler(
      'Too many login attempts for this account, please try again later.'
    ),
  });
