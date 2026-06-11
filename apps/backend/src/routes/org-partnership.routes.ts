import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  listPartnerships, createPartnership, getPartnership,
  acceptPartnership, declinePartnership, terminatePartnership,
} from '../controllers/org-partnership.controller';
import { createPartnershipValidator, partnershipActionValidator } from '../validators/org-partnership.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

const canManagePartnerships = authorizeOrganizationScope(Permission.MANAGE_ORG_PARTNERSHIPS);

router.get('/:orgId/partnerships', canManagePartnerships, listPartnerships);
router.post('/:orgId/partnerships', canManagePartnerships, validate(createPartnershipValidator), logActivity('create', 'org_partnership'), createPartnership);
router.get('/:orgId/partnerships/:id', canManagePartnerships, getPartnership);
router.patch('/:orgId/partnerships/:id/accept', canManagePartnerships, validate(partnershipActionValidator), logActivity('accept', 'org_partnership'), acceptPartnership);
router.patch('/:orgId/partnerships/:id/decline', canManagePartnerships, validate(partnershipActionValidator), logActivity('decline', 'org_partnership'), declinePartnership);
router.patch('/:orgId/partnerships/:id/terminate', canManagePartnerships, validate(partnershipActionValidator), logActivity('terminate', 'org_partnership'), terminatePartnership);

export default router;
