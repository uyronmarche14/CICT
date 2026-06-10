import Organization from '../models/Organization';
import CollaborationSpace from '../models/CollaborationSpace';
import CollaborationMessage from '../models/CollaborationMessage';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { ensureOrganizationsExist } from './lookup.service';
import { pickAllowedFields } from '../utils/allowedFields';

const COLLAB_ALLOWED = ['name', 'description', 'participantOrgIds', 'isActive'];

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('Not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_COLLABORATION)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name');
  if (!org) {throw new AppError('Organization not found', 404);}
  return org;
};

export const listSpaces = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return CollaborationSpace.find({ participantOrgIds: org.id }).sort({ updatedAt: -1 }).lean();
};

export const createSpace = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  const participantOrgIds = Array.isArray(req.body.participantOrgIds)
    ? await ensureOrganizationsExist(req.body.participantOrgIds)
    : [];
  return CollaborationSpace.create({ ...pickAllowedFields(req.body, COLLAB_ALLOWED), participantOrgIds: [...new Set([org.id, ...participantOrgIds])], createdBy: req.user!.userId });
};

export const getSpace = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  const space = await CollaborationSpace.findOne({ _id: id, participantOrgIds: orgId }).lean();
  if (!space) {throw new AppError('Space not found', 404);}
  return space;
};

export const updateSpace = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  if (Array.isArray(req.body.participantOrgIds)) {
    req.body.participantOrgIds = await ensureOrganizationsExist(req.body.participantOrgIds);
  }
  const space = await CollaborationSpace.findOneAndUpdate(
    { _id: id, participantOrgIds: orgId },
    { $set: pickAllowedFields(req.body, COLLAB_ALLOWED) },
    { new: true, runValidators: true }
  );
  if (!space) {throw new AppError('Space not found', 404);}
  return space;
};

export const deleteSpace = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  const space = await CollaborationSpace.findOneAndDelete({ _id: id, participantOrgIds: orgId });
  if (!space) {throw new AppError('Space not found', 404);}
};

export const listMessages = async (req: AuthRequest, orgId: string, id: string) => {
  await resolveOrg(req, orgId);
  const space = await CollaborationSpace.findOne({ _id: id, participantOrgIds: orgId });
  if (!space) {throw new AppError('Space not found', 404);}
  return CollaborationMessage.find({ spaceId: id }).sort({ createdAt: 1 }).lean();
};

export const sendMessage = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const space = await CollaborationSpace.findOne({ _id: id, participantOrgIds: org.id });
  if (!space) {throw new AppError('Space not found', 404);}
  return CollaborationMessage.create({
    spaceId: id,
    authorId: req.user!.userId,
    authorName: `${req.user!.firstName} ${req.user!.lastName}`,
    content: req.body.content,
  });
};

export const deleteMessage = async (req: AuthRequest, orgId: string, id: string, msgId: string) => {
  await resolveOrg(req, orgId);
  const msg = await CollaborationMessage.findOneAndDelete({ _id: msgId, spaceId: id });
  if (!msg) {throw new AppError('Message not found', 404);}
};
