import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { IJWTPayload } from '../types';
import {
  buildAuthenticatedUser,
  serializeAuthUser,
} from '../utils/rbac';
import logger from '../utils/logger';

const getJwtSecret = (name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string => {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`${name} is not defined`);
  }
  return secret;
};

const generateAccessToken = (payload: IJWTPayload): string => {
  const jwtExpire = process.env.JWT_EXPIRE ?? '7d';
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      customRole: payload.customRole,
    },
    getJwtSecret('JWT_SECRET'),
    { expiresIn: jwtExpire } as jwt.SignOptions
  );
};

const generateRefreshToken = (payload: IJWTPayload): string =>
  jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    getJwtSecret('JWT_REFRESH_SECRET'),
    { expiresIn: '30d' }
  );

export const authenticateAdminUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const tokenPayload: IJWTPayload = {
    userId: String(user._id),
    email: user.email,
    role: user.role,
    customRole: user.customRole ? String(user.customRole) : undefined,
  };

  const authenticatedUser = await buildAuthenticatedUser(user, true);
  const serializedUser = await serializeAuthUser(authenticatedUser);

  logger.info(`User logged in: ${user.email}`);

  return {
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
    authenticatedUser,
    serializedUser,
  };
};

export const refreshAdminSession = async (token: string) => {
  const decoded = jwt.verify(token, getJwtSecret('JWT_REFRESH_SECRET')) as IJWTPayload;
  const user = await User.findById(decoded.userId);

  if (!user?.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokenPayload: IJWTPayload = {
    userId: String(user._id),
    email: user.email,
    role: user.role,
    customRole: user.customRole ? String(user.customRole) : undefined,
  };
  const authenticatedUser = await buildAuthenticatedUser(user);

  return {
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
    serializedUser: await serializeAuthUser(authenticatedUser),
    authenticatedUser,
  };
};

export const changeAdminPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Password updated for user: ${user.email}`);
};
