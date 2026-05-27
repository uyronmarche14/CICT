import { Router } from 'express';
import * as announcementController from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { logActivity } from '../middleware/activityLogger';
import { handleImageUpload, upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import {
  announcementIdValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
} from '../validators/announcement.validator';
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
  validate(createAnnouncementValidator),
  logActivity('create', 'announcement'),
  announcementController.createAnnouncement
);

router.get(
  '/',
  authenticate,
  requireAdminAccess,
  announcementController.getAllAnnouncements
);

router.get(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  announcementController.getAnnouncementById
);

router.put(
  '/:id',
  authenticate,
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  validate(updateAnnouncementValidator),
  logActivity('update', 'announcement'),
  announcementController.updateAnnouncement
);

router.delete(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  logActivity('delete', 'announcement'),
  announcementController.deleteAnnouncement
);

router.patch(
  '/:id/submit',
  authenticate,
  requireAdminAccess,
  validate([...announcementIdValidator, ...contentApprovalCommentValidator]),
  logActivity('submit_for_approval', 'announcement'),
  announcementController.submitAnnouncementForApproval
);

router.patch(
  '/:id/approve',
  authenticate,
  requireAdminAccess,
  validate([...announcementIdValidator, ...contentApprovalCommentValidator]),
  logActivity('approve', 'announcement'),
  announcementController.approveAnnouncement
);

router.patch(
  '/:id/reject',
  authenticate,
  requireAdminAccess,
  validate([...announcementIdValidator, ...contentRejectionValidator]),
  logActivity('reject', 'announcement'),
  announcementController.rejectAnnouncement
);

router.patch(
  '/:id/publish',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  logActivity('publish', 'announcement'),
  announcementController.publishAnnouncement
);

router.patch(
  '/:id/archive',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  logActivity('archive', 'announcement'),
  announcementController.archiveAnnouncement
);

export default router;
