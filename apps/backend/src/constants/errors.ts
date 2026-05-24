export const ErrorCodes = {
  NOT_FOUND: { message: 'Resource not found', statusCode: 404 },
  UNAUTHORIZED: { message: 'Unauthorized', statusCode: 401 },
  FORBIDDEN: { message: 'Forbidden', statusCode: 403 },
  VALIDATION_ERROR: { message: 'Validation error', statusCode: 400 },
  CONFLICT: { message: 'Resource already exists', statusCode: 409 },
  INTERNAL_ERROR: { message: 'Internal server error', statusCode: 500 },
  RATE_LIMITED: { message: 'Too many requests', statusCode: 429 },
  NOT_AUTHENTICATED: { message: 'User not authenticated', statusCode: 401 },
  INVALID_INPUT: { message: 'Invalid input', statusCode: 400 },
} as const;

export const AuthMessages = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated',
  NOT_AUTHENTICATED: 'User not authenticated',
  PASSWORD_UPDATED: 'Password updated successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
} as const;
