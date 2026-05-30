import Organization from '../models/Organization';
import OrgPartnership from '../models/OrgPartnership';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('Not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_PARTNERSHIPS)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name');
  if (!org) {throw new AppError('Organization not found', 404);}
  return org;
};

export const listPartnerships = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return OrgPartnership.find({ $or: [{ orgIdA: org.id }, { orgIdB: org.id }] })
    .sort({ createdAt: -1 }).lean();
};

export const createPartnership = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  const { orgIdB, partnershipType, terms } = req.body;

  const targetOrg = await Organization.findOne({ id: orgIdB }).select('_id');
  if (!targetOrg) {throw new AppError('Target organization not found', 404);}
  if (orgIdB === org.id) {throw new AppError('Cannot partner with yourself', 400);}

  const existing = await OrgPartnership.findOne({ orgIdA: org.id, orgIdB });
  if (existing) {throw new AppError('Partnership already exists', 409);}

  return OrgPartnership.create({ orgIdA: org.id, orgIdB, partnershipType, terms, initiatedBy: req.user!.userId });
};

export const getPartnership = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const partnership = await OrgPartnership.findOne({ _id: id, $or: [{ orgIdA: org.id }, { orgIdB: org.id }] }).lean();
  if (!partnership) {throw new AppError('Partnership not found', 404);}
  return partnership;
};

export const acceptPartnership = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const partnership = await OrgPartnership.findOne({ _id: id, orgIdB: org.id, status: 'pending' });
  if (!partnership) {throw new AppError('Partnership not found or not pending', 404);}

  partnership.status = 'active';
  partnership.signedAtB = new Date();
  await partnership.save();

  // Update partnerItems on both orgs
  const [orgA, orgB] = await Promise.all([
    Organization.findOne({ id: partnership.orgIdA }),
    Organization.findOne({ id: partnership.orgIdB }),
  ]);
  if (orgA && orgB) {
    const type = partnership.partnershipType || 'partner';
    const updateA = { $push: { partnerItems: { name: orgB.name, partnershipType: type } } };
    const updateB = { $push: { partnerItems: { name: orgA.name, partnershipType: type } } };
    await Promise.all([
      Organization.updateOne({ id: partnership.orgIdA }, updateA),
      Organization.updateOne({ id: partnership.orgIdB }, updateB),
    ]);
  }

  return partnership;
};

export const declinePartnership = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const partnership = await OrgPartnership.findOneAndUpdate(
    { _id: id, orgIdB: org.id, status: 'pending' },
    { $set: { status: 'declined' } },
    { new: true }
  );
  if (!partnership) {throw new AppError('Partnership not found or not pending', 404);}
  return partnership;
};

export const terminatePartnership = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const partnership = await OrgPartnership.findOne({ _id: id, $or: [{ orgIdA: org.id }, { orgIdB: org.id }], status: 'active' });
  if (!partnership) {throw new AppError('Active partnership not found', 404);}

  partnership.status = 'terminated';
  partnership.terminatedAt = new Date();
  await partnership.save();

  // Remove from partnerItems on both orgs
  await Promise.all([
    Organization.updateOne({ id: partnership.orgIdA }, { $pull: { partnerItems: { name: { $exists: true } } } }),
    Organization.updateOne({ id: partnership.orgIdB }, { $pull: { partnerItems: { name: { $exists: true } } } }),
  ]);

  return partnership;
};
