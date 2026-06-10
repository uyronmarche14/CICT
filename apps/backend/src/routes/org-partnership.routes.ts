import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  listPartnerships, createPartnership, getPartnership,
  acceptPartnership, declinePartnership, terminatePartnership,
} from '../controllers/org-partnership.controller';
import { createPartnershipValidator, partnershipActionValidator } from '../validators/org-partnership.validator';

const router = express.Router();
router.use(protect, requireAdminAccess, authorize(Permission.MANAGE_ORG_PARTNERSHIPS));

router.get('/:orgId/partnerships', listPartnerships);
router.post('/:orgId/partnerships', validate(createPartnershipValidator), logActivity('create', 'org_partnership'), createPartnership);
router.get('/:orgId/partnerships/:id', getPartnership);
router.patch('/:orgId/partnerships/:id/accept', validate(partnershipActionValidator), logActivity('accept', 'org_partnership'), acceptPartnership);
router.patch('/:orgId/partnerships/:id/decline', validate(partnershipActionValidator), logActivity('decline', 'org_partnership'), declinePartnership);
router.patch('/:orgId/partnerships/:id/terminate', validate(partnershipActionValidator), logActivity('terminate', 'org_partnership'), terminatePartnership);

export default router;
