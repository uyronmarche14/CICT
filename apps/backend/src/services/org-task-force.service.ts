import Organization from '../models/Organization';
import OrgTaskForce from '../models/OrgTaskForce';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('Not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_TASK_FORCES)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name');
  if (!org) {throw new AppError('Organization not found', 404);}
  return org;
};

export const listTaskForces = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return OrgTaskForce.find({ $or: [{ organizationId: org._id }, { participantOrgIds: org.id }] })
    .sort({ startDate: -1 }).lean();
};

export const createTaskForce = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return OrgTaskForce.create({ ...req.body, organizationId: org._id, createdBy: req.user!.userId });
};

export const getTaskForce = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const tf = await OrgTaskForce.findOne({ _id: id, $or: [{ organizationId: org._id }, { participantOrgIds: org.id }] }).lean();
  if (!tf) {throw new AppError('Task force not found', 404);}
  return tf;
};

export const updateTaskForce = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const tf = await OrgTaskForce.findOneAndUpdate(
    { _id: id, organizationId: org._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!tf) {throw new AppError('Task force not found', 404);}
  return tf;
};

export const deleteTaskForce = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const tf = await OrgTaskForce.findOneAndDelete({ _id: id, organizationId: org._id });
  if (!tf) {throw new AppError('Task force not found', 404);}
};
