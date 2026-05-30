import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { shareContent, listIncoming, listOutgoing, removeShare } from '../controllers/org-shared-content.controller';
import { shareContentValidator, shareIdValidator } from '../validators/org-shared-content.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

router.post('/:orgId/shared-content', authorize(Permission.SHARE_CONTENT_CROSS_ORG), validate(shareContentValidator), logActivity('share', 'cross_org_content'), shareContent);
router.get('/:orgId/shared-content/incoming', authorize(Permission.SHARE_CONTENT_CROSS_ORG), listIncoming);
router.get('/:orgId/shared-content/outgoing', authorize(Permission.SHARE_CONTENT_CROSS_ORG), listOutgoing);
router.delete('/:orgId/shared-content/:id', authorize(Permission.SHARE_CONTENT_CROSS_ORG), validate(shareIdValidator), logActivity('unshare', 'cross_org_content'), removeShare);

export default router;
