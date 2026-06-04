import Organization from '../models/Organization';
import OrgMeeting from '../models/OrgMeeting';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { ensureUsersExist } from './lookup.service';

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_MEETINGS)) {
    throw new AppError('You do not have access to manage meetings for this organization', 403);
  }
  const organization = await Organization.findOne({ id: orgId }).select('_id');
  if (!organization) {throw new AppError('Organization not found', 404);}
  return organization._id;
};

const validateActionItemAssignees = async (body: Record<string, any>) => {
  if (!Array.isArray(body.actionItems)) {
    return;
  }

  const assigneeIds = body.actionItems
    .map((item) => item?.assigneeId)
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

  await ensureUsersExist(assigneeIds);
};

export const listMeetings = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const filter: Record<string, unknown> = { organizationId: oid };
  if (req.query.fiscalYear) {filter.fiscalYear = req.query.fiscalYear;}
  if (req.query.semester) {filter.semester = req.query.semester;}
  return OrgMeeting.find(filter).sort({ date: -1 }).lean();
};

export const createMeeting = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  await validateActionItemAssignees(req.body);
  return OrgMeeting.create({ ...req.body, organizationId: oid, createdBy });
};

export const getMeeting = async (req: AuthRequest, orgId: string, meetingId: string) => {
  const oid = await resolveOrg(req, orgId);
  const meeting = await OrgMeeting.findOne({ _id: meetingId, organizationId: oid }).lean();
  if (!meeting) {throw new AppError('Meeting not found', 404);}
  return meeting;
};

export const updateMeeting = async (req: AuthRequest, orgId: string, meetingId: string) => {
  const oid = await resolveOrg(req, orgId);
  await validateActionItemAssignees(req.body);
  const meeting = await OrgMeeting.findOneAndUpdate(
    { _id: meetingId, organizationId: oid },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!meeting) {throw new AppError('Meeting not found', 404);}
  return meeting;
};

export const deleteMeeting = async (req: AuthRequest, orgId: string, meetingId: string) => {
  const oid = await resolveOrg(req, orgId);
  const meeting = await OrgMeeting.findOneAndDelete({ _id: meetingId, organizationId: oid });
  if (!meeting) {throw new AppError('Meeting not found', 404);}
};

export const updateMinutes = async (req: AuthRequest, orgId: string, meetingId: string) => {
  const oid = await resolveOrg(req, orgId);
  const meeting = await OrgMeeting.findOneAndUpdate(
    { _id: meetingId, organizationId: oid },
    { $set: { minutes: req.body.minutes } },
    { new: true }
  );
  if (!meeting) {throw new AppError('Meeting not found', 404);}
  return meeting;
};

export const updateActionItems = async (req: AuthRequest, orgId: string, meetingId: string) => {
  const oid = await resolveOrg(req, orgId);
  await validateActionItemAssignees(req.body);
  const meeting = await OrgMeeting.findOneAndUpdate(
    { _id: meetingId, organizationId: oid },
    { $set: { actionItems: req.body.actionItems } },
    { new: true }
  );
  if (!meeting) {throw new AppError('Meeting not found', 404);}
  return meeting;
};
