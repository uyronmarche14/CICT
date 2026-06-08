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

/**
 * @openapi
 * /api/announcements:
 *   post:
 *     tags:
 *       - Announcements
 *     summary: Create an announcement
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Announcement created
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
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  validate(createAnnouncementValidator),
  logActivity('create', 'announcement'),
  announcementController.createAnnouncement
);

/**
 * @openapi
 * /api/announcements:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get all announcements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of announcements
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/',
  authenticate,
  requireAdminAccess,
  announcementController.getAllAnnouncements
);

/**
 * @openapi
 * /api/announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get an announcement by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.get(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  announcementController.getAnnouncementById
);

/**
 * @openapi
 * /api/announcements/{id}:
 *   put:
 *     tags:
 *       - Announcements
 *     summary: Update an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Announcement updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
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

/**
 * @openapi
 * /api/announcements/{id}:
 *   delete:
 *     tags:
 *       - Announcements
 *     summary: Delete an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.delete(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  logActivity('delete', 'announcement'),
  announcementController.deleteAnnouncement
);

/**
 * @openapi
 * /api/announcements/{id}/submit:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Submit announcement for approval
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Submitted for approval
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id/submit',
  authenticate,
  requireAdminAccess,
  validate([...announcementIdValidator, ...contentApprovalCommentValidator]),
  logActivity('submit_for_approval', 'announcement'),
  announcementController.submitAnnouncementForApproval
);

/**
 * @openapi
 * /api/announcements/{id}/approve:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Approve an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement approved
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id/approve',
  authenticate,
  requireAdminAccess,
  validate([...announcementIdValidator, ...contentApprovalCommentValidator]),
  logActivity('approve', 'announcement'),
  announcementController.approveAnnouncement
);

/**
 * @openapi
 * /api/announcements/{id}/reject:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Reject an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
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
 *         description: Announcement rejected
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id/reject',
  authenticate,
  requireAdminAccess,
  validate([...announcementIdValidator, ...contentRejectionValidator]),
  logActivity('reject', 'announcement'),
  announcementController.rejectAnnouncement
);

/**
 * @openapi
 * /api/announcements/{id}/publish:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Publish an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement published
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id/publish',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  logActivity('publish', 'announcement'),
  announcementController.publishAnnouncement
);

/**
 * @openapi
 * /api/announcements/{id}/archive:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Archive an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement archived
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id/archive',
  authenticate,
  requireAdminAccess,
  validate(announcementIdValidator),
  logActivity('archive', 'announcement'),
  announcementController.archiveAnnouncement
);

export default router;
