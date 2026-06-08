import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import {
  createAuthLoginRateLimiter,
  createAuthSessionRateLimiter,
} from '../middleware/rateLimiters';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { 
  loginValidator, 
  refreshTokenValidator,
  updatePasswordValidator 
} from '../validators/auth.validator';

const router: Router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
router.post(
  '/login',
  createAuthLoginRateLimiter(),
  validate(loginValidator),
  authController.login
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Too many requests
 */
router.post('/logout', createAuthSessionRateLimiter(), authController.logout);

/**
 * @openapi
 * /api/auth/permission-metadata:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get permission metadata
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission metadata retrieved
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/permission-metadata',
  authenticate,
  requireAdminAccess,
  authController.getPermissionMetadata
);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Too many requests
 */
router.get(
  '/profile',
  createAuthSessionRateLimiter(),
  authenticate,
  authController.getProfile
);

/**
 * @openapi
 * /api/auth/password:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Update password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Too many requests
 */
router.put(
  '/password',
  createAuthSessionRateLimiter(),
  authenticate,
  validate(updatePasswordValidator),
  authController.updatePassword
);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent
 *       429:
 *         description: Too many requests
 */
router.post(
  '/forgot-password',
  createAuthLoginRateLimiter(),
  authController.forgotPassword
);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       429:
 *         description: Too many requests
 */
router.post(
  '/reset-password',
  createAuthLoginRateLimiter(),
  authController.resetPassword
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 *       429:
 *         description: Too many requests
 */
router.post(
  '/refresh',
  createAuthSessionRateLimiter(),
  validate(refreshTokenValidator),
  authController.refreshToken
);

export default router;
