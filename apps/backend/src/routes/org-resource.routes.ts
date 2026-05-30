import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { listOutgoing, listIncoming, createRequest, getRequest, approveRequest, denyRequest, cancelRequest } from '../controllers/org-resource.controller';
import { createResourceRequestValidator, resourceIdValidator, reviewResourceValidator } from '../validators/org-resource.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

router.get('/:orgId/resource-requests/outgoing', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), listOutgoing);
router.get('/:orgId/resource-requests/incoming', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), listIncoming);
router.post('/:orgId/resource-requests', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), validate(createResourceRequestValidator), logActivity('create', 'resource_request'), createRequest);
router.get('/:orgId/resource-requests/:id', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), getRequest);
router.patch('/:orgId/resource-requests/:id/approve', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), validate(reviewResourceValidator), logActivity('approve', 'resource_request'), approveRequest);
router.patch('/:orgId/resource-requests/:id/deny', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), validate(reviewResourceValidator), logActivity('deny', 'resource_request'), denyRequest);
router.patch('/:orgId/resource-requests/:id/cancel', authorize(Permission.MANAGE_ORG_RESOURCE_POOLING), validate(resourceIdValidator), logActivity('cancel', 'resource_request'), cancelRequest);

export default router;
