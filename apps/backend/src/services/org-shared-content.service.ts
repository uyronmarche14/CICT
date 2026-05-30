import Organization from '../models/Organization';
import CrossOrgContentShare from '../models/CrossOrgContentShare';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('Not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.SHARE_CONTENT_CROSS_ORG)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name');
  if (!org) {throw new AppError('Organization not found', 404);}
  return org;
};

export const shareContent = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  const { contentType, contentId, targetOrgIds } = req.body;
  const existing = await CrossOrgContentShare.findOne({ contentType, contentId, sourceOrgId: org.id });
  if (existing) {
    existing.targetOrgIds = [...new Set([...existing.targetOrgIds, ...targetOrgIds])];
    existing.isActive = true;
    await existing.save();
    return existing;
  }
  return CrossOrgContentShare.create({ contentType, contentId, sourceOrgId: org.id, targetOrgIds, sharedBy: req.user!.userId });
};

export const listIncoming = async (req: AuthRequest, orgId: string) => {
  await resolveOrg(req, orgId);
  return CrossOrgContentShare.find({ targetOrgIds: orgId, isActive: true }).sort({ createdAt: -1 }).lean();
};

export const listOutgoing = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return CrossOrgContentShare.find({ sourceOrgId: org.id }).sort({ createdAt: -1 }).lean();
};

export const removeShare = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  const share = await CrossOrgContentShare.findOneAndUpdate(
    { _id: id },
    { $set: { isActive: false } },
    { new: true }
  );
  if (!share) {throw new AppError('Share not found', 404);}
  return share;
};
