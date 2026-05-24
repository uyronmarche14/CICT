import { describe, expect, it } from 'vitest';
import { ErrorCodes, AuthMessages } from './errors';

describe('ErrorCodes', () => {
  it('has NOT_FOUND with 404 status', () => {
    expect(ErrorCodes.NOT_FOUND).toEqual({ message: 'Resource not found', statusCode: 404 });
  });

  it('has UNAUTHORIZED with 401 status', () => {
    expect(ErrorCodes.UNAUTHORIZED.statusCode).toBe(401);
  });

  it('has FORBIDDEN with 403 status', () => {
    expect(ErrorCodes.FORBIDDEN.statusCode).toBe(403);
  });

  it('has VALIDATION_ERROR with 400 status', () => {
    expect(ErrorCodes.VALIDATION_ERROR.statusCode).toBe(400);
  });

  it('has INTERNAL_ERROR with 500 status', () => {
    expect(ErrorCodes.INTERNAL_ERROR.statusCode).toBe(500);
  });

  it('has all error codes with message and statusCode', () => {
    for (const value of Object.values(ErrorCodes)) {
      expect(value).toHaveProperty('message');
      expect(value).toHaveProperty('statusCode');
      expect(typeof value.message).toBe('string');
      expect(typeof value.statusCode).toBe('number');
    }
  });
});

describe('AuthMessages', () => {
  it('contains expected auth messages', () => {
    expect(AuthMessages.INVALID_CREDENTIALS).toBe('Invalid email or password');
    expect(AuthMessages.LOGIN_SUCCESS).toBe('Login successful');
    expect(AuthMessages.LOGOUT_SUCCESS).toBe('Logout successful');
  });
});
