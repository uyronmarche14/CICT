import Organization from '../models/Organization';
import Role from '../models/Role';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Permission } from '../types';
import { hasGlobalPermission } from './rbac';

export type OrganizationAssignmentInput = {
  organizationId: string;
  roleId: string;
};

export const ensurePermissionSetWithinActorScope = (
  actorPermissions: Permission[],
  requestedPermissions: Permission[],
  errorMessage: string
) => {
  const unauthorizedPermissions = requestedPermissions.filter(
    (permission) => !actorPermissions.includes(permission)
  );

  if (unauthorizedPermissions.length > 0) {
    throw new AppError(`${errorMessage}: ${unauthorizedPermissions.join(', ')}`, 403);
  }
};

export const validateOrganizationAssignments = async (
  assignments: OrganizationAssignmentInput[] | undefined,
  req: AuthRequest
) => {
  if (!assignments || assignments.length === 0) {
    return [];
  }

  if (!req.user || !hasGlobalPermission(req.user, Permission.ASSIGN_ROLE)) {
    throw new AppError('You do not have permission to assign organization-scoped roles', 403);
  }
  const actor = req.user;

  const seenOrganizations = new Set<string>();

  return Promise.all(
    assignments.map(async (assignment) => {
      const organizationId = assignment.organizationId?.trim().toLowerCase();
      if (!organizationId) {
        throw new AppError('organizationId is required for organization assignments', 400);
      }

      if (seenOrganizations.has(organizationId)) {
        throw new AppError('Each organization can only be assigned once per user', 400);
      }
      seenOrganizations.add(organizationId);

      const [organization, role] = await Promise.all([
        Organization.findOne({ id: organizationId }).select('id'),
        Role.findById(assignment.roleId),
      ]);

      if (!organization) {
        throw new AppError(`Organization not found: ${organizationId}`, 404);
      }

      if (!role) {
        throw new AppError('Organization assignment role not found', 404);
      }

      if (role.isSystemRole) {
        throw new AppError('Built-in system roles cannot be used for organization assignments', 400);
      }

      ensurePermissionSetWithinActorScope(
        actor.permissions,
        role.permissions ?? [],
        'You cannot assign an organization-scoped role with permissions beyond your own global scope'
      );

      return {
        organizationId,
        roleId: String(role._id),
      };
    })
  );
};
