import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generates a CSRF token and sets it as a non-httponly cookie.
 * Call this on login to establish a CSRF token for the session.
 */
export const setCsrfCookie = (res: Response): string => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return token;
};

/**
 * Middleware that validates CSRF token on mutating requests using
 * the double-submit cookie pattern:
 *   - Reads token from cookie (non-httponly)
 *   - Reads token from X-CSRF-Token header
 *   - Compares them
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for safe methods
  if (SAFE_METHODS.includes(req.method)) {
    next();
    return;
  }

  // Skip CSRF for auth routes (they have their own rate limiting and auth)
  const path = req.path.toLowerCase()
  if (path.startsWith('/api/auth/') || path.startsWith('/api/student/auth/')) {
    next()
    return
  }

  // Skip CSRF for API requests using Bearer tokens (not vulnerable to CSRF)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    });
    return;
  }

  next();
};
