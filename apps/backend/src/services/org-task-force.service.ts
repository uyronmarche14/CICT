import Organization from '../models/Organization';
import OrgTaskForce from '../models/OrgTaskForce';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { pickAllowedFields } from '../utils/allowedFields';

const TASK_FORCE_ALLOWED = ['name', 'description', 'participantOrgIds', 'status', 'startDate', 'endDate', 'objectives', 'outcome'];
import { ensureOrganizationsExist } from './lookup.service';

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
  return OrgTaskForce.find({ $or: [{ organizationId: String(org._id) }, { participantOrgIds: org.id }] })
    .sort({ startDate: -1 }).lean();
};

export const createTaskForce = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  if (Array.isArray(req.body.participantOrgIds)) {
    req.body.participantOrgIds = await ensureOrganizationsExist(req.body.participantOrgIds);
  }
  return OrgTaskForce.create({
    ...pickAllowedFields(req.body, TASK_FORCE_ALLOWED), organizationId: String(org._id), createdBy: req.user!.userId,
    statusHistory: [{ status: req.body.status || 'planning', changedBy: req.user!.userId, changedAt: new Date() }],
  });
};

export const getTaskForce = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const tf = await OrgTaskForce.findOne({ _id: id, $or: [{ organizationId: String(org._id) }, { participantOrgIds: org.id }] }).lean();
  if (!tf) {throw new AppError('Task force not found', 404);}
  return tf;
};

export const updateTaskForce = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  if (Array.isArray(req.body.participantOrgIds)) {
    req.body.participantOrgIds = await ensureOrganizationsExist(req.body.participantOrgIds);
  }
  const tf = await OrgTaskForce.findOne({ _id: id, organizationId: String(org._id) });
  if (!tf) {throw new AppError('Task force not found', 404);}
  if (req.body.status && tf.status !== req.body.status) {
    tf.statusHistory.push({ status: req.body.status, changedBy: req.user!.userId, changedAt: new Date(), reason: req.body.reason });
  }
  const allowed = pickAllowedFields(req.body, TASK_FORCE_ALLOWED);
  for (const [key, value] of Object.entries(allowed)) {
    (tf as any)[key] = value;
  }
  await tf.save();
  return tf;
};

export const deleteTaskForce = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const tf = await OrgTaskForce.findOneAndDelete({ _id: id, organizationId: String(org._id) });
  if (!tf) {throw new AppError('Task force not found', 404);}
};
