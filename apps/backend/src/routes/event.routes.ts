import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireAnyAdminAction } from '../middleware/permissions';
import { Permission } from '../types';
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

/**
 * @openapi
 * /api/events:
 *   post:
 *     tags:
 *       - Events
 *     summary: Create a new event
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/',
  authenticate,
  requireAnyAdminAction(Permission.CREATE_EVENT),
  upload.single('image'),
  handleImageUpload,
  validate(createEventValidator),
  logActivity('create', 'event'),
  eventController.createEvent
);

/**
 * @openapi
 * /api/events:
 *   get:
 *     tags:
 *       - Events
 *     summary: Get all events
 *     responses:
 *       200:
 *         description: List of events
 */
router.get(
  '/',
  optionalAuthenticate,
  eventController.getAllEvents
);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     tags:
 *       - Events
 *     summary: Get event by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validate(eventIdValidator),
  eventController.getEventById
);

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     tags:
 *       - Events
 *     summary: Update an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.put(
  '/:id',
  authenticate,
  requireAnyAdminAction(Permission.EDIT_EVENT),
  upload.single('image'),
  handleImageUpload,
  validate(updateEventValidator),
  logActivity('update', 'event'),
  eventController.updateEvent
);

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     tags:
 *       - Events
 *     summary: Delete an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.delete(
  '/:id',
  authenticate,
  requireAnyAdminAction(Permission.DELETE_EVENT),
  validate(eventIdValidator),
  logActivity('delete', 'event'),
  eventController.deleteEvent
);

/**
 * @openapi
 * /api/events/{id}/submit:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Submit event for approval
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Submitted for approval
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/submit',
  authenticate,
  requireAnyAdminAction(Permission.SUBMIT_CONTENT_FOR_APPROVAL),
  validate([...eventIdValidator, ...contentApprovalCommentValidator]),
  logActivity('submit_for_approval', 'event'),
  eventController.submitEventForApproval
);

/**
 * @openapi
 * /api/events/{id}/approve:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Approve an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event approved
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/approve',
  authenticate,
  requireAnyAdminAction(Permission.APPROVE_CONTENT),
  validate([...eventIdValidator, ...contentApprovalCommentValidator]),
  logActivity('approve', 'event'),
  eventController.approveEvent
);

/**
 * @openapi
 * /api/events/{id}/reject:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Reject an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event rejected
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/reject',
  authenticate,
  requireAnyAdminAction(Permission.REJECT_CONTENT),
  validate([...eventIdValidator, ...contentRejectionValidator]),
  logActivity('reject', 'event'),
  eventController.rejectEvent
);

/**
 * @openapi
 * /api/events/{id}/publish:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Publish an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event published
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/publish',
  authenticate,
  requireAnyAdminAction(Permission.PUBLISH_EVENT),
  validate(eventIdValidator),
  logActivity('publish', 'event'),
  eventController.publishEvent
);

/**
 * @openapi
 * /api/events/{id}/cancel:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Cancel an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event cancelled
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/cancel',
  authenticate,
  requireAnyAdminAction(Permission.CANCEL_EVENT),
  validate(eventIdValidator),
  logActivity('cancel', 'event'),
  eventController.cancelEvent
);

/**
 * @openapi
 * /api/events/{id}/complete:
 *   patch:
 *     tags:
 *       - Events
 *     summary: Mark event as complete
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event completed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/complete',
  authenticate,
  requireAnyAdminAction(Permission.COMPLETE_EVENT),
  validate(eventIdValidator),
  logActivity('complete', 'event'),
  eventController.completeEvent
);

/**
 * @openapi
 * /api/events/{id}/join:
 *   post:
 *     tags:
 *       - Events
 *     summary: Join an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Joined event
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Event not found
 */
router.post(
    '/:id/join',
    authenticate,
    requireAnyAdminAction(Permission.JOIN_EVENT),
    validate(eventIdValidator),
    eventController.joinEvent
);

/**
 * @openapi
 * /api/events/{id}/leave:
 *   post:
 *     tags:
 *       - Events
 *     summary: Leave an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Left event
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Event not found
 */
router.post(
    '/:id/leave',
    authenticate,
    validate(eventIdValidator),
    eventController.leaveEvent
);

export default router;
