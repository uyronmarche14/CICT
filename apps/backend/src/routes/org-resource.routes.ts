import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { listOutgoing, listIncoming, createRequest, getRequest, approveRequest, denyRequest, cancelRequest } from '../controllers/org-resource.controller';
import { createResourceRequestValidator, resourceIdValidator, reviewResourceValidator } from '../validators/org-resource.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

const canManageResources = authorizeOrganizationScope(Permission.MANAGE_ORG_RESOURCE_POOLING);

router.get('/:orgId/resource-requests/outgoing', canManageResources, listOutgoing);
router.get('/:orgId/resource-requests/incoming', canManageResources, listIncoming);
router.post('/:orgId/resource-requests', canManageResources, validate(createResourceRequestValidator), logActivity('create', 'resource_request'), createRequest);
router.get('/:orgId/resource-requests/:id', canManageResources, getRequest);
router.patch('/:orgId/resource-requests/:id/approve', canManageResources, validate(reviewResourceValidator), logActivity('approve', 'resource_request'), approveRequest);
router.patch('/:orgId/resource-requests/:id/deny', canManageResources, validate(reviewResourceValidator), logActivity('deny', 'resource_request'), denyRequest);
router.patch('/:orgId/resource-requests/:id/cancel', canManageResources, validate(resourceIdValidator), logActivity('cancel', 'resource_request'), cancelRequest);

export default router;
