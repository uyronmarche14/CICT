import { Response } from 'express';
import mongoose from 'mongoose';
import OrganizationMembership from '../models/OrganizationMembership';
import OrganizationMember from '../models/OrganizationMember';
import Organization from '../models/Organization';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/pagination';
import { IMembershipHistoryEntry, Permission } from '../types';
import { isFeatureEnabled } from '../utils/features';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { recordActivity } from '../services/activity.service';
import {
  hidePublicProfileForMembership,
  syncPublicProfileForMembership,
} from '../services/organization-member-profile.service';

const buildHistoryEntry = (
  field: string,
  oldValue?: string,
  newValue?: string,
  changedBy?: string
): IMembershipHistoryEntry => ({
  field,
  oldValue,
  newValue,
  changedBy,
  changedAt: new Date().toISOString(),
});

const checkMembershipPermission = (req: AuthRequest, orgId: string, permission: Permission): void => {
  if (!req.user || !canAccessOrganizationScope(req.user, orgId, permission)) {
    throw new AppError('You do not have permission to manage memberships for this organization', 403);
  }
};

const attachPublicProfilesToMemberships = async (memberships: any[]) => {
  if (memberships.length === 0) {
    return memberships;
  }

  const organizationIds = [...new Set(memberships.map((membership) => membership.organizationId))];
  const membershipIds = memberships
    .map((membership) => String(membership._id))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  const studentIds = memberships
    .map((membership) => String(membership.studentId?._id ?? membership.studentId))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  const profileClauses = [
    ...(membershipIds.length > 0 ? [{ membershipId: { $in: membershipIds } }] : []),
    ...(studentIds.length > 0 ? [{ studentId: { $in: studentIds } }] : []),
  ];
  const profiles = profileClauses.length > 0
    ? await OrganizationMember.find({
        organizationId: { $in: organizationIds },
        $or: profileClauses,
      }).lean()
    : [];

  const profileByMembershipId = new Map(
    profiles.filter((profile) => profile.membershipId).map((profile) => [String(profile.membershipId), profile])
  );
  const profileByStudentId = new Map(
    profiles.filter((profile) => profile.studentId).map((profile) => [String(profile.studentId), profile])
  );

  return memberships.map((membership) => ({
    ...membership,
    publicProfile:
      profileByMembershipId.get(String(membership._id)) ??
      profileByStudentId.get(String(membership.studentId?._id ?? membership.studentId)) ??
      null,
  }));
};

const getOrganizationMemberships = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  checkMembershipPermission(req, orgId, Permission.VIEW_MEMBER);
  const { page: p, limit: lim, skip } = parsePagination(req.query as Record<string, unknown>, 20, 100);
  const status = req.query.status as string | undefined;
  const memberType = req.query.memberType as string | undefined;

  const query: Record<string, unknown> = { organizationId: orgId };
  if (status) {
    const statuses = status.split(',').map((value) => value.trim()).filter(Boolean);
    query.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }
  if (memberType) {
    const memberTypes = memberType.split(',').map((value) => value.trim()).filter(Boolean);
    query.memberType = memberTypes.length > 1 ? { $in: memberTypes } : memberTypes[0];
  }

  const [memberships, total] = await Promise.all([
    OrganizationMembership.find(query)
      .populate('studentId', 'studentNumber firstName lastName profilePhoto programId yearLevelId sectionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    OrganizationMembership.countDocuments(query),
  ]);
  const membershipsWithProfiles = await attachPublicProfilesToMemberships(memberships);

  res.json({
    success: true,
    data: {
      memberships: membershipsWithProfiles,
      pagination: {
        page: p,
        limit: lim,
        total,
        pages: Math.ceil(total / lim),
      },
    },
  });
};

const createMembership = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  checkMembershipPermission(req, orgId, Permission.MANAGE_MEMBER_ROLES);
  const { studentId, position, memberType, startDate, endDate, academicYear, semester, notes } = req.body;

  const org = await Organization.findOne({ id: orgId });
  if (!org) {throw new AppError('Organization not found', 404);}

  const student = await Student.findById(studentId);
  if (!student) {throw new AppError('Student not found', 404);}

  const existing = await OrganizationMembership.findOne({ studentId, organizationId: orgId });
  if (existing) {throw new AppError('Student is already a member of this organization', 409);}

  const membership = await OrganizationMembership.create({
    studentId,
    organizationId: orgId,
    position: position || 'Member',
    memberType: memberType || 'general',
    status: 'active',
    approvedAt: new Date(),
    startDate: startDate || new Date(),
    endDate,
    academicYear,
    semester,
    notes,
    history: [
      buildHistoryEntry('status', undefined, 'active', req.user?.userId),
    ],
  });

  const populated = await OrganizationMembership.findById(membership._id)
    .populate('studentId', 'studentNumber firstName lastName profilePhoto')
    .lean();

  await syncPublicProfileForMembership(membership);

  res.status(201).json({ success: true, data: { membership: populated } });
};

const updateMembership = async (req: AuthRequest, res: Response) => {
  const { orgId, id } = req.params;
  checkMembershipPermission(req, orgId, Permission.MANAGE_MEMBER_ROLES);
  const { position, memberType, status, startDate, endDate, academicYear, semester, notes } = req.body;

  const membership = await OrganizationMembership.findOne({ _id: id, organizationId: orgId });
  if (!membership) {throw new AppError('Membership not found', 404);}

  const historyEntries: IMembershipHistoryEntry[] = [];

  if (position !== undefined && position !== membership.position) {
    historyEntries.push(buildHistoryEntry('position', membership.position, position, req.user?.userId));
    membership.position = position;
  }
  if (memberType !== undefined && memberType !== membership.memberType) {
    historyEntries.push(buildHistoryEntry('memberType', membership.memberType, memberType, req.user?.userId));
    membership.memberType = memberType;
  }
  if (status !== undefined && status !== membership.status) {
    historyEntries.push(buildHistoryEntry('status', membership.status, status, req.user?.userId));
    membership.status = status;

    const now = new Date();
    if (status === 'active') {membership.approvedAt = now;}
    if (status === 'rejected') {membership.rejectedAt = now;}
    if (status === 'resigned') {membership.resignedAt = now;}
    if (status === 'invited') {membership.invitedAt = now;}
  }
  if (startDate !== undefined) {membership.startDate = startDate;}
  if (endDate !== undefined) {membership.endDate = endDate;}
  if (academicYear !== undefined) {membership.academicYear = academicYear;}
  if (semester !== undefined) {membership.semester = semester;}
  if (notes !== undefined) {membership.notes = notes;}

  membership.history.push(...historyEntries);
  await membership.save();
  await syncPublicProfileForMembership(membership);

  const populated = await OrganizationMembership.findById(membership._id)
    .populate('studentId', 'studentNumber firstName lastName profilePhoto')
    .lean();

  res.json({ success: true, data: { membership: populated } });
};

const deleteMembership = async (req: AuthRequest, res: Response) => {
  const { orgId, id } = req.params;
  checkMembershipPermission(req, orgId, Permission.MANAGE_MEMBER_ROLES);

  const membership = await OrganizationMembership.findOneAndDelete({ _id: id, organizationId: orgId });
  if (!membership) {throw new AppError('Membership not found', 404);}

  await hidePublicProfileForMembership(membership._id);

  res.json({ success: true, message: 'Membership removed' });
};

const approveMembership = async (req: AuthRequest, res: Response) => {
  const { orgId, id } = req.params;
  checkMembershipPermission(req, orgId, Permission.MANAGE_MEMBER_ROLES);

  const membership = await OrganizationMembership.findOne({ _id: id, organizationId: orgId });
  if (!membership) {throw new AppError('Membership not found', 404);}

  if (membership.status !== 'applied' && membership.status !== 'invited') {
    throw new AppError('Only applied or invited memberships can be approved', 400);
  }

  membership.status = 'active';
  membership.approvedAt = new Date();
  membership.history.push(
    buildHistoryEntry('status', 'applied', 'active', req.user?.userId)
  );
  await membership.save();
  await syncPublicProfileForMembership(membership);

  await recordActivity({
    organizationId: orgId,
    actorType: 'admin',
    actorId: req.user?.userId,
    action: 'approved',
    entityType: 'membership',
    entityId: id,
    metadata: { fromStatus: 'applied', toStatus: 'active' },
  });

  const populated = await OrganizationMembership.findById(membership._id)
    .populate('studentId', 'studentNumber firstName lastName profilePhoto')
    .lean();

  res.json({ success: true, data: { membership: populated } });
};

const rejectMembership = async (req: AuthRequest, res: Response) => {
  const { orgId, id } = req.params;
  checkMembershipPermission(req, orgId, Permission.MANAGE_MEMBER_ROLES);

  const membership = await OrganizationMembership.findOne({ _id: id, organizationId: orgId });
  if (!membership) {throw new AppError('Membership not found', 404);}

  if (membership.status !== 'applied' && membership.status !== 'invited') {
    throw new AppError('Only applied or invited memberships can be rejected', 400);
  }

  const prevStatus = membership.status;
  membership.status = 'rejected';
  membership.rejectedAt = new Date();
  membership.history.push(
    buildHistoryEntry('status', prevStatus, 'rejected', req.user?.userId)
  );
  await membership.save();
  await syncPublicProfileForMembership(membership);

  await recordActivity({
    organizationId: orgId,
    actorType: 'admin',
    actorId: req.user?.userId,
    action: 'rejected',
    entityType: 'membership',
    entityId: id,
    metadata: { fromStatus: prevStatus, toStatus: 'rejected' },
  });

  res.json({ success: true, data: { membership } });
};

const getMyMemberships = async (req: StudentAuthRequest, res: Response) => {
  const memberships = await OrganizationMembership.find({
    studentId: new mongoose.Types.ObjectId(req.student!.studentId),
  })
    .populate('studentId', 'studentNumber firstName lastName profilePhoto')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: { memberships } });
};

const applyToOrganization = async (req: StudentAuthRequest, res: Response) => {
  const orgAppsEnabled = await isFeatureEnabled('orgApplications');
  if (!orgAppsEnabled) {
    throw new AppError('Organization applications are currently disabled', 403);
  }

  const { orgId } = req.params;
  const { message } = req.body;
  const studentId = new mongoose.Types.ObjectId(req.student!.studentId);

  const org = await Organization.findOne({ id: orgId });
  if (!org) {throw new AppError('Organization not found', 404);}

  const existing = await OrganizationMembership.findOne({ studentId, organizationId: orgId });
  if (existing) {
    if (existing.status === 'rejected' || existing.status === 'resigned') {
      await OrganizationMembership.findByIdAndDelete(existing._id);
    } else {
      throw new AppError('You already have a membership with this organization', 409);
    }
  }

  const membership = await OrganizationMembership.create({
    studentId,
    organizationId: orgId,
    position: 'Applicant',
    memberType: 'general',
    status: 'applied',
    appliedAt: new Date(),
    notes: message || undefined,
    history: [buildHistoryEntry('status', undefined, 'applied')],
  });

  res.status(201).json({ success: true, data: { membership } });

  await recordActivity({
    organizationId: orgId,
    actorType: 'student',
    actorId: req.student?.studentId,
    action: 'joined',
    entityType: 'membership',
    entityId: String(membership._id),
  });
};

const resignMembership = async (req: StudentAuthRequest, res: Response) => {
  const { id } = req.params;
  const studentId = new mongoose.Types.ObjectId(req.student!.studentId);

  const membership = await OrganizationMembership.findOne({ _id: id, studentId });
  if (!membership) {throw new AppError('Membership not found', 404);}

  if (membership.status !== 'active') {
    throw new AppError('Only active memberships can be resigned', 400);
  }

  membership.status = 'resigned';
  membership.resignedAt = new Date();
  membership.history.push(buildHistoryEntry('status', 'active', 'resigned'));
  await membership.save();
  await syncPublicProfileForMembership(membership);

  await recordActivity({
    organizationId: membership.organizationId,
    actorType: 'student',
    actorId: req.student?.studentId,
    action: 'resigned',
    entityType: 'membership',
    entityId: id,
    metadata: { fromStatus: 'active', toStatus: 'resigned' },
  });

  res.json({ success: true, data: { membership } });
};

const getPendingMemberships = async (req: AuthRequest, res: Response) => {
  const query: Record<string, unknown> = { status: 'applied' };

  if (req.user && !req.user.canAccessAdmin) {
    const scopedOrgIds = Object.entries(req.user.scopedAdminModulesByOrganization ?? {})
      .filter(([, modules]) => modules.includes('organizations'))
      .map(([orgId]) => orgId);
    if (scopedOrgIds.length > 0) {
      query.organizationId = { $in: scopedOrgIds };
    }
  }

  const memberships = await OrganizationMembership.find(query)
    .populate('studentId', 'studentNumber firstName lastName profilePhoto programId yearLevelId')
    .sort({ appliedAt: -1 })
    .limit(50)
    .lean();

  const orgIds = [...new Set(memberships.map(m => m.organizationId))];
  const orgs = await Organization.find({ id: { $in: orgIds } })
    .select('id name fullName logo')
    .lean();
  const orgMap = new Map(orgs.map(o => [o.id, o]));

  const enriched = memberships.map(m => ({
    ...m,
    organization: orgMap.get(m.organizationId) || null,
  }));

  res.json({ success: true, data: { memberships: enriched } });
};

const getMyMembershipStatus = async (req: StudentAuthRequest, res: Response) => {
  const { orgId } = req.params;
  const studentId = new mongoose.Types.ObjectId(req.student!.studentId);

  const membership = await OrganizationMembership.findOne({
    studentId,
    organizationId: orgId,
  }).select('status').lean();

  res.json({
    success: true,
    data: { status: (membership?.status as string) ?? 'none' },
  });
};

export {
  getOrganizationMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  approveMembership,
  rejectMembership,
  getMyMemberships,
  applyToOrganization,
  resignMembership,
  getPendingMemberships,
  getMyMembershipStatus,
};
