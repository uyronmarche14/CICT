import { Request, Response } from 'express';
import User from '../models/User';
import OrganizationAssignment from '../models/OrganizationAssignment';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getResolvedOrganizationAssignmentsForUser } from '../utils/organizationScope';
import { invalidateUserCache } from '../utils/rbac';
import { validateOrganizationAssignments } from '../utils/organizationAssignment';
import logger from '../utils/logger';

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
