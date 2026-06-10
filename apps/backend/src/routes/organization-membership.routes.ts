import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess, authorize, authorizeAny } from '../middleware/permissions';
import { Permission } from '../types';
import {
  getOrganizationMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  approveMembership,
  rejectMembership,
  getPendingMemberships,
} from '../controllers/organization-membership.controller';
import {
  createMembershipValidator,
  updateMembershipValidator,
  membershipIdValidator,
} from '../validators/organization-membership.validator';
import { validate } from '../middleware/validate';

const router = express.Router();

router.use(authenticate);

router.get(
  '/memberships/pending',
  requireAdminAccess,
  authorizeAny(Permission.MANAGE_MEMBER_ROLES, Permission.VIEW_MEMBER),
  getPendingMemberships
);
router.get(
  '/:orgId/memberships',
  authorizeAny(Permission.VIEW_MEMBER, Permission.MANAGE_MEMBER_ROLES),
  getOrganizationMemberships
);
router.post(
  '/:orgId/memberships',
  authorize(Permission.MANAGE_MEMBER_ROLES),
  validate(createMembershipValidator),
  createMembership
);
router.put(
  '/:orgId/memberships/:id',
  authorize(Permission.MANAGE_MEMBER_ROLES),
  validate(updateMembershipValidator),
  updateMembership
);
router.delete(
  '/:orgId/memberships/:id',
  authorize(Permission.MANAGE_MEMBER_ROLES),
  validate(membershipIdValidator),
  deleteMembership
);
router.post(
  '/:orgId/memberships/:id/approve',
  authorize(Permission.MANAGE_MEMBER_ROLES),
  validate(membershipIdValidator),
  approveMembership
);
router.post(
  '/:orgId/memberships/:id/reject',
  authorize(Permission.MANAGE_MEMBER_ROLES),
  validate(membershipIdValidator),
  rejectMembership
);

export default router;
