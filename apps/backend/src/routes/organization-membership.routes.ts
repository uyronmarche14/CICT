import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  authorizeAnyGlobalOrScoped,
  authorizeOrganizationScope,
  requireAdminAccess,
} from '../middleware/permissions';
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
  authorizeAnyGlobalOrScoped(Permission.MANAGE_MEMBER_ROLES, Permission.VIEW_MEMBER),
  getPendingMemberships
);
router.get(
  '/:orgId/memberships',
  authorizeOrganizationScope(Permission.VIEW_MEMBER),
  getOrganizationMemberships
);
router.post(
  '/:orgId/memberships',
  authorizeOrganizationScope(Permission.MANAGE_MEMBER_ROLES),
  validate(createMembershipValidator),
  createMembership
);
router.put(
  '/:orgId/memberships/:id',
  authorizeOrganizationScope(Permission.MANAGE_MEMBER_ROLES),
  validate(updateMembershipValidator),
  updateMembership
);
router.delete(
  '/:orgId/memberships/:id',
  authorizeOrganizationScope(Permission.MANAGE_MEMBER_ROLES),
  validate(membershipIdValidator),
  deleteMembership
);
router.post(
  '/:orgId/memberships/:id/approve',
  authorizeOrganizationScope(Permission.MANAGE_MEMBER_ROLES),
  validate(membershipIdValidator),
  approveMembership
);
router.post(
  '/:orgId/memberships/:id/reject',
  authorizeOrganizationScope(Permission.MANAGE_MEMBER_ROLES),
  validate(membershipIdValidator),
  rejectMembership
);

export default router;
