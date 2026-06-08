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

/**
 * @openapi
 * /api/news:
 *   post:
 *     tags:
 *       - News
 *     summary: Create a news article
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
 *               excerpt:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: News article created
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
  validate(createNewsValidator),
  logActivity('create', 'news'),
  newsController.createNews
);

/**
 * @openapi
 * /api/news:
 *   get:
 *     tags:
 *       - News
 *     summary: Get all news articles
 *     responses:
 *       200:
 *         description: List of news articles
 */
router.get(
  '/',
  optionalAuthenticate,
  newsController.getAllNews
);

/**
 * @openapi
 * /api/news/{id}:
 *   get:
 *     tags:
 *       - News
 *     summary: Get a news article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article details
 *       404:
 *         description: News article not found
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validate(newsIdValidator),
  newsController.getNewsById
);

/**
 * @openapi
 * /api/news/{id}:
 *   put:
 *     tags:
 *       - News
 *     summary: Update a news article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
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
 *               excerpt:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: News article updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
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

/**
 * @openapi
 * /api/news/{id}:
 *   delete:
 *     tags:
 *       - News
 *     summary: Delete a news article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
router.delete(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(newsIdValidator),
  logActivity('delete', 'news'),
  newsController.deleteNews
);

/**
 * @openapi
 * /api/news/{id}/submit:
 *   patch:
 *     tags:
 *       - News
 *     summary: Submit news article for approval
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: Submitted for approval
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
router.patch(
  '/:id/submit',
  authenticate,
  requireAdminAccess,
  validate([...newsIdValidator, ...contentApprovalCommentValidator]),
  logActivity('submit_for_approval', 'news'),
  newsController.submitNewsForApproval
);

/**
 * @openapi
 * /api/news/{id}/approve:
 *   patch:
 *     tags:
 *       - News
 *     summary: Approve a news article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article approved
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
router.patch(
  '/:id/approve',
  authenticate,
  requireAdminAccess,
  validate([...newsIdValidator, ...contentApprovalCommentValidator]),
  logActivity('approve', 'news'),
  newsController.approveNews
);

/**
 * @openapi
 * /api/news/{id}/reject:
 *   patch:
 *     tags:
 *       - News
 *     summary: Reject a news article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
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
 *         description: News article rejected
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
router.patch(
  '/:id/reject',
  authenticate,
  requireAdminAccess,
  validate([...newsIdValidator, ...contentRejectionValidator]),
  logActivity('reject', 'news'),
  newsController.rejectNews
);

/**
 * @openapi
 * /api/news/{id}/publish:
 *   patch:
 *     tags:
 *       - News
 *     summary: Publish a news article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article published
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
router.patch(
  '/:id/publish',
  authenticate,
  requireAdminAccess,
  validate(newsIdValidator),
  logActivity('publish', 'news'),
  newsController.publishNews
);

/**
 * @openapi
 * /api/news/{id}/archive:
 *   patch:
 *     tags:
 *       - News
 *     summary: Archive a news article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article archived
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: News article not found
 */
router.patch(
  '/:id/archive',
  authenticate,
  requireAdminAccess,
  validate(newsIdValidator),
  logActivity('archive', 'news'),
  newsController.archiveNews
);

export default router;
