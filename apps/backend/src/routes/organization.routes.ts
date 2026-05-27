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
} from '../controllers/organization.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
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

// Public routes
router.get('/admin', protect, requireAdminAccess, getAdminOrganizations);
router.get('/admin/:id/assignments', protect, requireAdminAccess, getAdminOrganizationAssignments);
router.get('/admin/:id', protect, requireAdminAccess, getAdminOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganization);

// Protected routes (Admin/Semi Admin)
router.use(protect);

// Upload generic image
router.post(
  '/upload',
  requireAdminAccess,
  upload.single('image'),
  handleImageUpload,
  uploadImage
);

// Organization Management
router.post(
  '/',
  authorize(Permission.CREATE_ORGANIZATION),
  validate(createOrganizationValidator),
  logActivity('create', 'organization'),
  createOrganization
);

router.put(
  '/:id',
  requireAdminAccess,
  authorize(Permission.EDIT_ORGANIZATION),
  validate(updateOrganizationValidator),
  logActivity('update', 'organization'),
  updateOrganization
);

router.delete(
  '/:id',
  requireAdminAccess,
  authorize(Permission.DELETE_ORGANIZATION),
  validate(organizationIdValidator),
  logActivity('delete', 'organization'),
  deleteOrganization
);

// Members Management
router.post(
  '/:id/members',
  requireAdminAccess,
  authorize(Permission.CREATE_MEMBER),
  validate(createMemberValidator),
  logActivity('create', 'organization_member'),
  addMember
);

router.put(
  '/:orgId/members/:memberId',
  requireAdminAccess,
  authorize(Permission.EDIT_MEMBER),
  validate(updateMemberValidator),
  logActivity('update', 'organization_member'),
  updateMember
);

router.delete(
  '/:orgId/members/:memberId',
  requireAdminAccess,
  authorize(Permission.DELETE_MEMBER),
  validate(memberIdValidator),
  logActivity('delete', 'organization_member'),
  deleteMember
);

export default router;
