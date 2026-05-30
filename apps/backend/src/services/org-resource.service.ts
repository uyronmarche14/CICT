import Organization from '../models/Organization';
import ResourceRequest from '../models/ResourceRequest';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('Not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_RESOURCE_POOLING)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name');
  if (!org) {throw new AppError('Organization not found', 404);}
  return org;
};

export const listOutgoing = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return ResourceRequest.find({ organizationId: org._id }).sort({ createdAt: -1 }).lean();
};

export const listIncoming = async (req: AuthRequest, orgId: string) => {
  await resolveOrg(req, orgId);
  return ResourceRequest.find({ providingOrgId: orgId }).sort({ createdAt: -1 }).lean();
};

export const createRequest = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return ResourceRequest.create({ ...req.body, organizationId: org._id, createdBy: req.user!.userId });
};

export const getRequest = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const request = await ResourceRequest.findOne({
    _id: id,
    $or: [{ organizationId: org._id }, { providingOrgId: org.id }],
  }).lean();
  if (!request) {throw new AppError('Request not found', 404);}
  return request;
};

export const approveRequest = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  const request = await ResourceRequest.findOneAndUpdate(
    { _id: id, providingOrgId: orgId, status: 'pending' },
    { $set: { status: 'approved', reviewedBy: req.user!.userId, reviewNotes: req.body.notes } },
    { new: true }
  );
  if (!request) {throw new AppError('Request not found or not pending', 404);}
  return request;
};

export const denyRequest = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  const request = await ResourceRequest.findOneAndUpdate(
    { _id: id, providingOrgId: orgId, status: 'pending' },
    { $set: { status: 'denied', reviewedBy: req.user!.userId, reviewNotes: req.body.notes } },
    { new: true }
  );
  if (!request) {throw new AppError('Request not found or not pending', 404);}
  return request;
};

export const cancelRequest = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const request = await ResourceRequest.findOneAndUpdate(
    { _id: id, organizationId: org._id, status: { $in: ['pending', 'approved'] } },
    { $set: { status: 'cancelled' } },
    { new: true }
  );
  if (!request) {throw new AppError('Request not found or cannot be cancelled', 404);}
  return request;
};
