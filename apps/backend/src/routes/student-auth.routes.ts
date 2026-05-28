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

router.post(
  '/register',
  createAuthLoginRateLimiter(),
  studentAuthController.registerStudent
);

router.post(
  '/login',
  createStudentLoginRateLimiter(),
  validate(studentLoginValidator),
  studentAuthController.loginStudent
);
router.post(
  '/refresh',
  createAuthSessionRateLimiter(),
  validate(studentRefreshValidator),
  studentAuthController.refreshStudentToken
);
router.post('/logout', createAuthSessionRateLimiter(), studentAuthController.logoutStudent);
router.get('/me', authenticateStudent, studentAuthController.getStudentProfile);

router.post(
  '/forgot-password',
  createAuthLoginRateLimiter(),
  studentAuthController.forgotStudentPassword
);

router.post(
  '/reset-password',
  createAuthLoginRateLimiter(),
  studentAuthController.resetStudentPasswordCtrl
);

export default router;
