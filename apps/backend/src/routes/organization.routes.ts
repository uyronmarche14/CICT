import express from 'express';
import {
  getOrganizations,
  getOrganization,
  getAdminOrganizations,
  getAdminOrganization,
  getAdminOrganizationAssignments,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  addMember,
  updateMember,
  deleteMember,
  uploadImage,
  getOrgActivityFeed,
  getOrgFiles,
  getOrgStorageQuota,
  getOrgCalendar,
} from '../controllers/organization.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorize, authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { upload, handleImageUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createOrganizationValidator,
  organizationIdValidator,
  updateOrganizationValidator,
  createMemberValidator,
  updateMemberValidator,
  memberIdValidator,
} from '../validators/organization.validator';

const router = express.Router();

/**
 * @openapi
 * /api/organizations/admin:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all organizations (admin view)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all organizations
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admin', protect, requireAdminAccess, getAdminOrganizations);

/**
 * @openapi
 * /api/organizations/admin/{id}/assignments:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization assignments (admin view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization assignments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization not found
 */
router.get('/admin/:id/assignments', protect, requireAdminAccess, getAdminOrganizationAssignments);

/**
 * @openapi
 * /api/organizations/admin/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization by ID (admin view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization not found
 */
router.get('/admin/:id', protect, requireAdminAccess, getAdminOrganization);

/**
 * @openapi
 * /api/organizations:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all organizations (public)
 *     responses:
 *       200:
 *         description: List of organizations
 */
router.get('/', getOrganizations);

/**
 * @openapi
 * /api/organizations/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization by ID (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *       404:
 *         description: Organization not found
 */
router.get('/:id', getOrganization);

// Protected routes (Admin/Semi Admin)
router.use(protect);

/**
 * @openapi
 * /api/organizations/upload:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Upload organization image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/upload',
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  uploadImage
);

/**
 * @openapi
 * /api/organizations:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Create an organization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/',
  authorize(Permission.CREATE_ORGANIZATION),
  validate(createOrganizationValidator),
  logActivity('create', 'organization'),
  createOrganization
);

/**
 * @openapi
 * /api/organizations/{id}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Update an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization not found
 */
router.put(
  '/:id',
  requireAdminAccess,
  authorize(Permission.EDIT_ORGANIZATION),
  validate(updateOrganizationValidator),
  logActivity('update', 'organization'),
  updateOrganization
);

/**
 * @openapi
 * /api/organizations/{id}:
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Delete an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization not found
 */
router.delete(
  '/:id',
  requireAdminAccess,
  authorize(Permission.DELETE_ORGANIZATION),
  validate(organizationIdValidator),
  logActivity('delete', 'organization'),
  deleteOrganization
);

/**
 * @openapi
 * /api/organizations/{id}/members:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Add a member to an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member added
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization not found
 */
router.post(
  '/:id/members',
  requireAdminAccess,
  authorize(Permission.CREATE_MEMBER),
  validate(createMemberValidator),
  logActivity('create', 'organization_member'),
  addMember
);

/**
 * @openapi
 * /api/organizations/{orgId}/members/{memberId}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Update a member in an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization or member not found
 */
router.put(
  '/:orgId/members/:memberId',
  requireAdminAccess,
  authorize(Permission.EDIT_MEMBER),
  validate(updateMemberValidator),
  logActivity('update', 'organization_member'),
  updateMember
);

/**
 * @openapi
 * /api/organizations/{orgId}/members/{memberId}:
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Remove a member from an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member removed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization or member not found
 */
router.delete(
  '/:orgId/members/:memberId',
  requireAdminAccess,
  authorize(Permission.DELETE_MEMBER),
  validate(memberIdValidator),
  logActivity('delete', 'organization_member'),
  deleteMember
);

router.get(
  '/:orgId/activity',
  requireAdminAccess,
  authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS),
  getOrgActivityFeed
);

router.get(
  '/:orgId/files',
  requireAdminAccess,
  authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS),
  getOrgFiles
);

router.get(
  '/:orgId/files/quota',
  requireAdminAccess,
  authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS),
  getOrgStorageQuota
);

router.get(
  '/:orgId/calendar',
  requireAdminAccess,
  authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS),
  getOrgCalendar
);

export default router;
