import { Router } from 'express';
import * as studentAuthController from '../controllers/studentAuth.controller';
import { authenticateStudent } from '../middleware/studentAuth';
import {
  createAuthLoginRateLimiter,
  createAuthSessionRateLimiter,
  createStudentLoginRateLimiter,
} from '../middleware/rateLimiters';
import { validate } from '../middleware/validate';
import { studentLoginValidator, studentRefreshValidator } from '../validators/student-auth.validator';

const router = Router();

/**
 * @openapi
 * /api/student/auth/register:
 *   post:
 *     tags:
 *       - Student Auth
 *     summary: Register a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentNumber
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               studentNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student registered
 *       400:
 *         description: Validation error
 *       409:
 *         description: Student already exists
 *       429:
 *         description: Too many requests
 */
router.post(
  '/register',
  createAuthLoginRateLimiter(),
  studentAuthController.registerStudent
);

/**
 * @openapi
 * /api/student/auth/login:
 *   post:
 *     tags:
 *       - Student Auth
 *     summary: Login student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentNumber
 *               - password
 *             properties:
 *               studentNumber:
 *                 type: string
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
  createStudentLoginRateLimiter(),
  validate(studentLoginValidator),
  studentAuthController.loginStudent
);

/**
 * @openapi
 * /api/student/auth/refresh:
 *   post:
 *     tags:
 *       - Student Auth
 *     summary: Refresh student access token
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
  validate(studentRefreshValidator),
  studentAuthController.refreshStudentToken
);

/**
 * @openapi
 * /api/student/auth/logout:
 *   post:
 *     tags:
 *       - Student Auth
 *     summary: Logout student
 *     responses:
 *       200:
 *         description: Logout successful
 *       429:
 *         description: Too many requests
 */
router.post('/logout', createAuthSessionRateLimiter(), studentAuthController.logoutStudent);

/**
 * @openapi
 * /api/student/auth/me:
 *   get:
 *     tags:
 *       - Student Auth
 *     summary: Get current student profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticateStudent, studentAuthController.getStudentProfile);

/**
 * @openapi
 * /api/student/auth/forgot-password:
 *   post:
 *     tags:
 *       - Student Auth
 *     summary: Request student password reset email
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
  studentAuthController.forgotStudentPassword
);

/**
 * @openapi
 * /api/student/auth/reset-password:
 *   post:
 *     tags:
 *       - Student Auth
 *     summary: Reset student password using token
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
  studentAuthController.resetStudentPasswordCtrl
);

export default router;
