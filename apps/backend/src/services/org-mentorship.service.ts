import Organization from '../models/Organization';
import OrgMentorship from '../models/OrgMentorship';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { ensureReferenceValuesAllowed } from './lookup.service';

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('Not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_MENTORSHIP)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name');
  if (!org) {throw new AppError('Organization not found', 404);}
  return org;
};

export const listMentorships = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  return OrgMentorship.find({ $or: [{ mentorOrgId: org.id }, { menteeOrgId: org.id }] })
    .sort({ startDate: -1 }).lean();
};

export const createMentorship = async (req: AuthRequest, orgId: string) => {
  const org = await resolveOrg(req, orgId);
  const { menteeOrgId, focusAreas, startDate, endDate } = req.body;
  await ensureReferenceValuesAllowed('mentorshipFocusAreas', focusAreas ?? [], 'Invalid mentorship focus area');

  const menteeOrg = await Organization.findOne({ id: menteeOrgId }).select('_id');
  if (!menteeOrg) {throw new AppError('Mentee organization not found', 404);}
  if (menteeOrgId === org.id) {throw new AppError('Cannot mentor yourself', 400);}

  const existing = await OrgMentorship.findOne({ mentorOrgId: org.id, menteeOrgId });
  if (existing) {throw new AppError('Mentorship already exists', 409);}

  return OrgMentorship.create({
    mentorOrgId: org.id, menteeOrgId, focusAreas, startDate, endDate, createdBy: req.user!.userId,
    statusHistory: [{ status: 'active', changedBy: req.user!.userId, changedAt: new Date() }],
  });
};

export const getMentorship = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const mentorship = await OrgMentorship.findOne({ _id: id, $or: [{ mentorOrgId: org.id }, { menteeOrgId: org.id }] }).lean();
  if (!mentorship) {throw new AppError('Mentorship not found', 404);}
  return mentorship;
};

export const updateMentorshipStatus = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const mentorship = await OrgMentorship.findOne({ _id: id, $or: [{ mentorOrgId: org.id }, { menteeOrgId: org.id }] });
  if (!mentorship) {throw new AppError('Mentorship not found', 404);}
  if (mentorship.status !== req.body.status) {
    mentorship.statusHistory.push({ status: req.body.status, changedBy: req.user!.userId, changedAt: new Date(), reason: req.body.reason });
  }
  mentorship.status = req.body.status;
  await mentorship.save();
  return mentorship;
};

export const deleteMentorship = async (req: AuthRequest, orgId: string, id: string) => {
  const org = await resolveOrg(req, orgId);
  const mentorship = await OrgMentorship.findOneAndDelete({ _id: id, $or: [{ mentorOrgId: org.id }, { menteeOrgId: org.id }] });
  if (!mentorship) {throw new AppError('Mentorship not found', 404);}
};
