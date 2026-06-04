import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { listOutgoing, listIncoming, createRequest, getRequest, approveRequest, denyRequest, cancelRequest } from '../controllers/org-resource.controller';
import { createResourceRequestValidator, resourceIdValidator, reviewResourceValidator } from '../validators/org-resource.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

router.get('/:orgId/resource-requests/outgoing', listOutgoing);
router.get('/:orgId/resource-requests/incoming', listIncoming);
router.post('/:orgId/resource-requests', validate(createResourceRequestValidator), logActivity('create', 'resource_request'), createRequest);
router.get('/:orgId/resource-requests/:id', getRequest);
router.patch('/:orgId/resource-requests/:id/approve', validate(reviewResourceValidator), logActivity('approve', 'resource_request'), approveRequest);
router.patch('/:orgId/resource-requests/:id/deny', validate(reviewResourceValidator), logActivity('deny', 'resource_request'), denyRequest);
router.patch('/:orgId/resource-requests/:id/cancel', validate(resourceIdValidator), logActivity('cancel', 'resource_request'), cancelRequest);

export default router;
