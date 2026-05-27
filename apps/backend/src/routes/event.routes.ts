import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { handleImageUpload, upload } from '../middleware/upload';
import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator
} from '../validators/event.validator';
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
  validate(createEventValidator),
  logActivity('create', 'event'),
  eventController.createEvent
);

router.get(
  '/',
  optionalAuthenticate,
  eventController.getAllEvents
);

router.get(
  '/:id',
  optionalAuthenticate,
  validate(eventIdValidator),
  eventController.getEventById
);

router.put(
  '/:id',
  authenticate,
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  validate(updateEventValidator),
  logActivity('update', 'event'),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(eventIdValidator),
  logActivity('delete', 'event'),
  eventController.deleteEvent
);

router.patch(
  '/:id/submit',
  authenticate,
  requireAdminAccess,
  validate([...eventIdValidator, ...contentApprovalCommentValidator]),
  logActivity('submit_for_approval', 'event'),
  eventController.submitEventForApproval
);

router.patch(
  '/:id/approve',
  authenticate,
  requireAdminAccess,
  validate([...eventIdValidator, ...contentApprovalCommentValidator]),
  logActivity('approve', 'event'),
  eventController.approveEvent
);

router.patch(
  '/:id/reject',
  authenticate,
  requireAdminAccess,
  validate([...eventIdValidator, ...contentRejectionValidator]),
  logActivity('reject', 'event'),
  eventController.rejectEvent
);

router.patch(
  '/:id/publish',
  authenticate,
  requireAdminAccess,
  validate(eventIdValidator),
  logActivity('publish', 'event'),
  eventController.publishEvent
);

router.patch(
  '/:id/cancel',
  authenticate,
  requireAdminAccess,
  validate(eventIdValidator),
  logActivity('cancel', 'event'),
  eventController.cancelEvent
);

router.patch(
  '/:id/complete',
  authenticate,
  requireAdminAccess,
  validate(eventIdValidator),
  logActivity('complete', 'event'),
  eventController.completeEvent
);

router.post(
    '/:id/join',
    authenticate,
    validate(eventIdValidator),
    eventController.joinEvent
);

router.post(
    '/:id/leave',
    authenticate,
    validate(eventIdValidator),
    eventController.leaveEvent
);

export default router;
