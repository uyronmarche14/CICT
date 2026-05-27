import { Router } from 'express';
import * as newsController from '../controllers/news.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { handleImageUpload, upload } from '../middleware/upload';
import {
  createNewsValidator,
  updateNewsValidator,
  newsIdValidator
} from '../validators/news.validator';
import {
  contentApprovalCommentValidator,
  contentRejectionValidator,
} from '../validators/approval.validator';

const router: Router = Router();

router.post(
  '/',
  authenticate,
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  validate(createNewsValidator),
  logActivity('create', 'news'),
  newsController.createNews
);

router.get(
  '/',
  optionalAuthenticate,
  newsController.getAllNews
);

router.get(
  '/:id',
  optionalAuthenticate,
  validate(newsIdValidator),
  newsController.getNewsById
);

router.put(
  '/:id',
  authenticate,
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  validate(updateNewsValidator),
  logActivity('update', 'news'),
  newsController.updateNews
);

router.delete(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(newsIdValidator),
  logActivity('delete', 'news'),
  newsController.deleteNews
);

router.patch(
  '/:id/submit',
  authenticate,
  requireAdminAccess,
  validate([...newsIdValidator, ...contentApprovalCommentValidator]),
  logActivity('submit_for_approval', 'news'),
  newsController.submitNewsForApproval
);

router.patch(
  '/:id/approve',
  authenticate,
  requireAdminAccess,
  validate([...newsIdValidator, ...contentApprovalCommentValidator]),
  logActivity('approve', 'news'),
  newsController.approveNews
);

router.patch(
  '/:id/reject',
  authenticate,
  requireAdminAccess,
  validate([...newsIdValidator, ...contentRejectionValidator]),
  logActivity('reject', 'news'),
  newsController.rejectNews
);

router.patch(
  '/:id/publish',
  authenticate,
  requireAdminAccess,
  validate(newsIdValidator),
  logActivity('publish', 'news'),
  newsController.publishNews
);

router.patch(
  '/:id/archive',
  authenticate,
  requireAdminAccess,
  validate(newsIdValidator),
  logActivity('archive', 'news'),
  newsController.archiveNews
);

export default router;
