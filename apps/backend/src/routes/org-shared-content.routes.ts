import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { shareContent, listIncoming, listOutgoing, removeShare } from '../controllers/org-shared-content.controller';
import { shareContentValidator, shareIdValidator } from '../validators/org-shared-content.validator';

const router = express.Router();
router.use(protect, requireAdminAccess, authorize(Permission.SHARE_CONTENT_CROSS_ORG));

router.post('/:orgId/shared-content', validate(shareContentValidator), logActivity('share', 'cross_org_content'), shareContent);
router.get('/:orgId/shared-content/incoming', listIncoming);
router.get('/:orgId/shared-content/outgoing', listOutgoing);
router.delete('/:orgId/shared-content/:id', validate(shareIdValidator), logActivity('unshare', 'cross_org_content'), removeShare);

export default router;
