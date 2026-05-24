import { describe, expect, it, beforeEach } from 'vitest';
import { getAuthCookieOptions } from './authCookies';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('getAuthCookieOptions', () => {
  it('returns httpOnly cookies with default settings in development', () => {
    process.env.NODE_ENV = 'development';
    const options = getAuthCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.secure).toBe(false);
    expect(options.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    expect(options.path).toBe('/');
  });

  it('returns secure cookies with sameSite none in production', () => {
    process.env.NODE_ENV = 'production';
    const options = getAuthCookieOptions();
    expect(options.sameSite).toBe('none');
    expect(options.secure).toBe(true);
  });

  it('uses the COOKIE_SAME_SITE override when provided', () => {
    process.env.COOKIE_SAME_SITE = 'strict';
    const options = getAuthCookieOptions();
    expect(options.sameSite).toBe('strict');
  });

  it('uses COOKIE_SECURE override when explicitly set', () => {
    process.env.COOKIE_SECURE = 'true';
    const options = getAuthCookieOptions();
    expect(options.secure).toBe(true);
  });

  it('includes domain when COOKIE_DOMAIN is set', () => {
    process.env.COOKIE_DOMAIN = '.example.com';
    const options = getAuthCookieOptions();
    expect(options).toHaveProperty('domain');
    expect(options.domain).toBe('.example.com');
  });

  it('falls back to default sameSite for invalid values', () => {
    process.env.NODE_ENV = 'development';
    process.env.COOKIE_SAME_SITE = 'invalid';
    const options = getAuthCookieOptions();
    expect(options.sameSite).toBe('lax');
  });
});
