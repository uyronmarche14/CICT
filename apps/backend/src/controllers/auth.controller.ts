import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { serializeAuthUser } from '../utils/rbac';
import { getAuthCookieOptions } from '../utils/authCookies';
import { getPermissionMetadata as getPermissionMetadataCatalog } from '../utils/permissionMetadata';
import { setCsrfCookie } from '../middleware/csrf';
import { forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '../services/password-reset.service';
import {
  authenticateAdminUser,
  changeAdminPassword,
  refreshAdminSession,
} from '../services/auth.service';

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, authenticatedUser, serializedUser } =
    await authenticateAdminUser(email, password);

  const cookieOptions = getAuthCookieOptions();
  res.cookie('token', accessToken, cookieOptions);
  res.cookie('refresh_token', refreshToken, { ...cookieOptions, path: '/api/auth/refresh' });
  setCsrfCookie(res);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken,
      user: serializedUser,
      permissions: authenticatedUser.permissions,
      canAccessAdmin: authenticatedUser.canAccessAdmin,
      adminAccessPolicy: authenticatedUser.adminAccessPolicy,
      adminScopes: authenticatedUser.adminScopes,
      visibleAdminModules: authenticatedUser.visibleAdminModules,
      scopedAdminModulesByOrganization:
        authenticatedUser.scopedAdminModulesByOrganization,
    },
  });
};

/**
 * Logout user
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie('token', {
    ...cookieOptions,
    maxAge: undefined,
  });
  res.clearCookie('refresh_token', {
    ...cookieOptions,
    maxAge: undefined,
    path: '/api/auth/refresh',
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }
  const serializedUser = await serializeAuthUser(req.user);
  
  res.status(200).json({
    success: true,
    data: {
      user: serializedUser,
      permissions: req.user.permissions,
      canAccessAdmin: req.user.canAccessAdmin,
      adminAccessPolicy: req.user.adminAccessPolicy,
      adminScopes: req.user.adminScopes,
      visibleAdminModules: req.user.visibleAdminModules,
      scopedAdminModulesByOrganization: req.user.scopedAdminModulesByOrganization,
    },
  });
};

/**
 * Forgot password - generates reset token
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  await forgotPasswordService(email);

  res.status(200).json({
    success: true,
    message: 'If the email exists, a password reset link has been sent.',
  });
};

/**
 * Reset password using token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    throw new AppError('Token and password are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  await resetPasswordService(token, password);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: bodyToken } = req.body;
  const token = bodyToken ?? req.cookies?.refresh_token;
  if (!token) {throw new AppError('Refresh token is required', 400);}

  const { accessToken, refreshToken: newRefreshToken, authenticatedUser, serializedUser } =
    await refreshAdminSession(token);
  const cookieOptions = getAuthCookieOptions();
  res.cookie('token', accessToken, cookieOptions);
  res.cookie('refresh_token', newRefreshToken, {
    ...cookieOptions,
    path: '/api/auth/refresh',
  });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      user: serializedUser,
      permissions: authenticatedUser.permissions,
      canAccessAdmin: authenticatedUser.canAccessAdmin,
      adminAccessPolicy: authenticatedUser.adminAccessPolicy,
      adminScopes: authenticatedUser.adminScopes,
      visibleAdminModules: authenticatedUser.visibleAdminModules,
      scopedAdminModulesByOrganization:
        authenticatedUser.scopedAdminModulesByOrganization,
    },
  });
};

export const getPermissionMetadata = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      permissions: getPermissionMetadataCatalog(),
    },
  });
};

/**
 * Update password
 */
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }
  
  const { currentPassword, newPassword } = req.body;
  await changeAdminPassword(req.user.userId, currentPassword, newPassword);
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
};
