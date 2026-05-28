import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IJWTPayload } from '../types';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { buildAuthenticatedUser, serializeAuthUser } from '../utils/rbac';
import { getAuthCookieOptions } from '../utils/authCookies';
import { getPermissionMetadata as getPermissionMetadataCatalog } from '../utils/permissionMetadata';
import { setCsrfCookie } from '../middleware/csrf';
import { forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '../services/password-reset.service';

/**
 * Generate JWT token
 */
const generateToken = (payload: IJWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE ?? '7d';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  // Convert payload to plain object for jwt.sign
  const plainPayload = {
    userId: payload.userId.toString(),
    email: payload.email,
    role: payload.role,
    customRole: payload.customRole ? payload.customRole.toString() : undefined,
  };
  
  return jwt.sign(plainPayload, jwtSecret as jwt.Secret, { expiresIn: jwtExpire } as jwt.SignOptions);
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  
  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403);
  }
  
  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Generate token
  const tokenPayload: IJWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    customRole: user.customRole?.toString(),
  };
  
  const token = generateToken(tokenPayload);
  const authenticatedUser = await buildAuthenticatedUser(user, true);
  const serializedUser = await serializeAuthUser(authenticatedUser);

  res.cookie('token', token, getAuthCookieOptions());
  setCsrfCookie(res);

  logger.info(`User logged in: ${user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: serializedUser,
      permissions: authenticatedUser.permissions,
      canAccessAdmin: authenticatedUser.canAccessAdmin,
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
  res.clearCookie('token', {
    ...getAuthCookieOptions(),
    maxAge: undefined,
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
  
  const user = await User.findById(req.user.userId).select('+password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  logger.info(`Password updated for user: ${user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
};
