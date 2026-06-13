import { Request, Response } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import OrganizationAssignment from '../models/OrganizationAssignment';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getResolvedOrganizationAssignmentsForUser } from '../utils/organizationScope';
import { invalidateUserCache } from '../utils/rbac';
import { validateOrganizationAssignments } from '../utils/organizationAssignment';
import logger from '../utils/logger';

const getActorAssignablePermissionsForOrganization = (req: AuthRequest, organizationId: string) => {
  const permissions = new Set((req.user?.permissions ?? []).map(String));
  const scopedAssignment = req.user?.organizationAssignments?.find(
    (assignment) => assignment.organizationId === organizationId
  );

  scopedAssignment?.permissions.forEach((permission) => permissions.add(String(permission)));

  return permissions;
};

type LeanOrgAssignment = {
  _id: unknown;
  user?: {
    _id?: unknown;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  role?: {
    _id?: unknown;
    name?: string;
    permissions?: string[];
  } | null;
};

export const getUserOrgAssignments = async (
  req: Request<Record<string, string>>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const user = await User.findById(id).select('_id');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const assignments = await getResolvedOrganizationAssignmentsForUser(id);

  res.status(200).json({
    success: true,
    data: { assignments },
  });
};

export const createUserOrgAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await User.findById(id).select('_id');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const [assignment] = await validateOrganizationAssignments([req.body], req);

  const existingAssignment = await OrganizationAssignment.findOne({
    user: id,
    organizationId: assignment.organizationId,
  });
  if (existingAssignment) {
    throw new AppError('This user already has an assignment for that organization', 409);
  }

  const createdAssignment = await OrganizationAssignment.create({
    user: id,
    organizationId: assignment.organizationId,
    role: assignment.roleId,
  });

  await invalidateUserCache(id);
  const assignments = await getResolvedOrganizationAssignmentsForUser(id);
  const created = assignments.find((item) => item.id === String(createdAssignment._id));

  logger.info(`Organization assignment created for user: ${id} by user ${req.user?.userId}`);

  res.status(201).json({
    success: true,
    message: 'Organization assignment created successfully',
    data: { assignment: created ?? null, assignments },
  });
};

export const updateUserOrgAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, assignmentId } = req.params;
  const assignment = await OrganizationAssignment.findOne({ _id: assignmentId, user: id });

  if (!assignment) {
    throw new AppError('Organization assignment not found', 404);
  }

  const [validatedAssignment] = await validateOrganizationAssignments([req.body], req);

  if (validatedAssignment.organizationId !== assignment.organizationId) {
    const existingAssignment = await OrganizationAssignment.findOne({
      user: id,
      organizationId: validatedAssignment.organizationId,
    });
    if (existingAssignment) {
      throw new AppError('This user already has an assignment for that organization', 409);
    }
  }

  assignment.organizationId = validatedAssignment.organizationId;
  assignment.role = validatedAssignment.roleId;
  await assignment.save();
  await invalidateUserCache(id);

  const assignments = await getResolvedOrganizationAssignmentsForUser(id);
  const updated = assignments.find((item) => item.id === assignmentId);

  logger.info(`Organization assignment updated for user: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Organization assignment updated successfully',
    data: { assignment: updated ?? null, assignments },
  });
};

export const deleteUserOrgAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, assignmentId } = req.params;
  const assignment = await OrganizationAssignment.findOneAndDelete({ _id: assignmentId, user: id });

  if (!assignment) {
    throw new AppError('Organization assignment not found', 404);
  }

  await invalidateUserCache(id);
  const assignments = await getResolvedOrganizationAssignmentsForUser(id);

  logger.info(`Organization assignment deleted for user: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Organization assignment deleted successfully',
    data: { assignments },
  });
};

export const getOrgAssignments = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  const assignments = await OrganizationAssignment.find({ organizationId: orgId })
    .populate('user', 'firstName lastName email')
    .populate('role', 'name permissions')
    .lean();

  const enriched = (assignments as LeanOrgAssignment[]).map((a) => ({
    id: a._id,
    userId: a.user?._id,
    userName: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Unknown',
    userEmail: a.user?.email,
    roleId: a.role?._id,
    roleName: a.role?.name ?? 'Unknown',
    permissions: a.role?.permissions ?? [],
  }));

  res.json({ success: true, data: { assignments: enriched } });
};

export const createOrgAssignment = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    throw new AppError('userId and roleId are required', 400);
  }

  const [user, role, existingAssignment] = await Promise.all([
    User.findById(userId).select('firstName lastName email'),
    Role.findById(roleId).select('name permissions isSystemRole'),
    OrganizationAssignment.findOne({ user: userId, organizationId: orgId }).select('_id'),
  ]);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!role) {
    throw new AppError('Organization assignment role not found', 404);
  }

  if (role.isSystemRole) {
    throw new AppError('Built-in system roles cannot be used for organization assignments', 400);
  }

  if (existingAssignment) {
    throw new AppError('This user already has an assignment for this organization', 409);
  }

  const actorAssignablePermissions = getActorAssignablePermissionsForOrganization(req, orgId);
  const unauthorizedPermissions = (role.permissions ?? []).filter(
    (permission) => !actorAssignablePermissions.has(String(permission))
  );

  if (unauthorizedPermissions.length > 0) {
    throw new AppError(
      `You cannot assign an organization-scoped role with permissions beyond your own scope: ${unauthorizedPermissions.join(', ')}`,
      403
    );
  }

  const assignment = await OrganizationAssignment.create({
    user: userId,
    organizationId: orgId,
    role: roleId,
  });

  await invalidateUserCache(userId);
  logger.info(`Org assignment created: user ${userId} -> org ${orgId} by ${req.user?.userId}`);

  res.status(201).json({
    success: true,
    data: {
      assignment: {
        id: String(assignment._id),
        userId: String(user._id),
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        roleId: String(role._id),
        roleName: role.name,
        permissions: role.permissions ?? [],
      },
    },
  });
};

export const deleteOrgAssignment = async (req: AuthRequest, res: Response) => {
  const { orgId, assignmentId } = req.params;

  const assignment = await OrganizationAssignment.findOneAndDelete({
    _id: assignmentId,
    organizationId: orgId,
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  await invalidateUserCache(String(assignment.user));
  res.json({ success: true, message: 'Admin removed' });
};
