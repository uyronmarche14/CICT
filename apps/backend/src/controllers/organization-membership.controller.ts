import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import OrganizationMembership from '../models/OrganizationMembership';
import Organization from '../models/Organization';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { AppError } from '../middleware/errorHandler';
import { IMembershipHistoryEntry, Permission } from '../types';
import { isFeatureEnabled } from '../utils/features';
import { canAccessOrganizationScope } from '../utils/organizationScope';

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

const getOrganizationMemberships = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;
    if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.VIEW_MEMBER)) {
      throw new AppError('You do not have permission to view memberships for this organization', 403);
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string | undefined;
    const memberType = req.query.memberType as string | undefined;

    const query: Record<string, unknown> = { organizationId: orgId };
    if (status) query.status = status;
    if (memberType) query.memberType = memberType;

    const [memberships, total] = await Promise.all([
      OrganizationMembership.find(query)
        .populate('studentId', 'studentNumber firstName lastName profilePhoto programId yearLevelId sectionId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrganizationMembership.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        memberships,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const createMembership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;
    if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_MEMBER_ROLES)) {
      throw new AppError('You do not have permission to manage memberships for this organization', 403);
    }
    const { studentId, position, memberType, startDate, endDate, academicYear, semester, notes } = req.body;

    const org = await Organization.findOne({ id: orgId });
    if (!org) return next(new AppError('Organization not found', 404));

    const student = await Student.findById(studentId);
    if (!student) return next(new AppError('Student not found', 404));

    const existing = await OrganizationMembership.findOne({ studentId, organizationId: orgId });
    if (existing) return next(new AppError('Student is already a member of this organization', 409));

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

    res.status(201).json({ success: true, data: { membership: populated } });
  } catch (err) {
    next(err);
  }
};

const updateMembership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId, id } = req.params;
    if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_MEMBER_ROLES)) {
      throw new AppError('You do not have permission to manage memberships for this organization', 403);
    }
    const { position, memberType, status, startDate, endDate, academicYear, semester, notes } = req.body;

    const membership = await OrganizationMembership.findOne({ _id: id, organizationId: orgId });
    if (!membership) return next(new AppError('Membership not found', 404));

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
      if (status === 'active') membership.approvedAt = now;
      if (status === 'rejected') membership.rejectedAt = now;
      if (status === 'resigned') membership.resignedAt = now;
      if (status === 'invited') membership.invitedAt = now;
    }
    if (startDate !== undefined) membership.startDate = startDate;
    if (endDate !== undefined) membership.endDate = endDate;
    if (academicYear !== undefined) membership.academicYear = academicYear;
    if (semester !== undefined) membership.semester = semester;
    if (notes !== undefined) membership.notes = notes;

    membership.history.push(...historyEntries);
    await membership.save();

    const populated = await OrganizationMembership.findById(membership._id)
      .populate('studentId', 'studentNumber firstName lastName profilePhoto')
      .lean();

    res.json({ success: true, data: { membership: populated } });
  } catch (err) {
    next(err);
  }
};

const deleteMembership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId, id } = req.params;
    if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_MEMBER_ROLES)) {
      throw new AppError('You do not have permission to manage memberships for this organization', 403);
    }

    const membership = await OrganizationMembership.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!membership) return next(new AppError('Membership not found', 404));

    res.json({ success: true, message: 'Membership removed' });
  } catch (err) {
    next(err);
  }
};

const approveMembership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId, id } = req.params;
    if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_MEMBER_ROLES)) {
      throw new AppError('You do not have permission to manage memberships for this organization', 403);
    }

    const membership = await OrganizationMembership.findOne({ _id: id, organizationId: orgId });
    if (!membership) return next(new AppError('Membership not found', 404));

    if (membership.status !== 'applied' && membership.status !== 'invited') {
      return next(new AppError('Only applied or invited memberships can be approved', 400));
    }

    membership.status = 'active';
    membership.approvedAt = new Date();
    membership.history.push(
      buildHistoryEntry('status', 'applied', 'active', req.user?.userId)
    );
    await membership.save();

    const populated = await OrganizationMembership.findById(membership._id)
      .populate('studentId', 'studentNumber firstName lastName profilePhoto')
      .lean();

    res.json({ success: true, data: { membership: populated } });
  } catch (err) {
    next(err);
  }
};

const rejectMembership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId, id } = req.params;
    if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_MEMBER_ROLES)) {
      throw new AppError('You do not have permission to manage memberships for this organization', 403);
    }

    const membership = await OrganizationMembership.findOne({ _id: id, organizationId: orgId });
    if (!membership) return next(new AppError('Membership not found', 404));

    if (membership.status !== 'applied' && membership.status !== 'invited') {
      return next(new AppError('Only applied or invited memberships can be rejected', 400));
    }

    const prevStatus = membership.status;
    membership.status = 'rejected';
    membership.rejectedAt = new Date();
    membership.history.push(
      buildHistoryEntry('status', prevStatus, 'rejected', req.user?.userId)
    );
    await membership.save();

    res.json({ success: true, data: { membership } });
  } catch (err) {
    next(err);
  }
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

const applyToOrganization = async (req: StudentAuthRequest, res: Response, next: NextFunction) => {
  try {
    const orgAppsEnabled = await isFeatureEnabled('orgApplications');
    if (!orgAppsEnabled) {
      return next(new AppError('Organization applications are currently disabled', 403));
    }

    const { orgId } = req.params;
    const { message } = req.body;
    const studentId = new mongoose.Types.ObjectId(req.student!.studentId);

    const org = await Organization.findOne({ id: orgId });
    if (!org) return next(new AppError('Organization not found', 404));

    const existing = await OrganizationMembership.findOne({ studentId, organizationId: orgId });
    if (existing) {
      if (existing.status === 'rejected' || existing.status === 'resigned') {
        await OrganizationMembership.findByIdAndDelete(existing._id);
      } else {
        return next(new AppError('You already have a membership with this organization', 409));
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
  } catch (err) {
    next(err);
  }
};

const resignMembership = async (req: StudentAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const studentId = new mongoose.Types.ObjectId(req.student!.studentId);

    const membership = await OrganizationMembership.findOne({ _id: id, studentId });
    if (!membership) return next(new AppError('Membership not found', 404));

    if (membership.status !== 'active') {
      return next(new AppError('Only active memberships can be resigned', 400));
    }

    membership.status = 'resigned';
    membership.resignedAt = new Date();
    membership.history.push(buildHistoryEntry('status', 'active', 'resigned'));
    await membership.save();

    res.json({ success: true, data: { membership } });
  } catch (err) {
    next(err);
  }
};

const getPendingMemberships = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const memberships = await OrganizationMembership.find({ status: 'applied' })
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
  } catch (err) {
    next(err);
  }
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
};
