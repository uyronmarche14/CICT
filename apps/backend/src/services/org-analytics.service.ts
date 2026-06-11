import Organization from '../models/Organization';
import OrgTask from '../models/OrgTask';
import OrgMeeting from '../models/OrgMeeting';
import OrgBudget from '../models/OrgBudget';
import OrgTransaction from '../models/OrgTransaction';
import OrgVote from '../models/OrgVote';
import OrganizationMembership from '../models/OrganizationMembership';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import EventAttendanceLog from '../models/EventAttendanceLog';
import OrgTaskForce from '../models/OrgTaskForce';
import ResourceRequest from '../models/ResourceRequest';
import OrgPartnership from '../models/OrgPartnership';
import CollaborationSpace from '../models/CollaborationSpace';
import CollaborationMessage from '../models/CollaborationMessage';
import OrgMentorship from '../models/OrgMentorship';
import CrossOrgContentShare from '../models/CrossOrgContentShare';
import OrganizationActivity from '../models/OrganizationActivity';
import OrganizationStorageQuota from '../models/OrganizationStorageQuota';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { TypedCache } from '../utils/cache';

const analyticsCache = new TypedCache<unknown>({ namespace: 'org:analytics', ttlMs: 60_000 });

type DashboardTransaction = {
  type?: string;
  amount?: number;
};

type DashboardActionDoc = {
  _id: unknown;
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
  dateNeeded?: Date;
  appliedAt?: Date;
  createdAt?: Date;
};

type DashboardCalendarDoc = {
  _id: unknown;
  title: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
};

const checkAccess = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }
  if (!canAccessOrganizationScope(req.user, orgId, Permission.VIEW_ORG_ANALYTICS)) {
    throw new AppError('Access denied', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id');
  if (!org) {
    throw new AppError('Organization not found', 404);
  }
  return org._id;
};

export const getDashboard = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const organizationObjectId = String(oid);
  const cacheKey = `dashboard:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const now = new Date();

  const [
    activeMembers,
    pendingApplications,
    tasksOpen,
    tasksOverdue,
    upcomingMeetings,
    upcomingEvents,
    activeVotes,
    pendingResourceRequests,
    recentActivity,
    quota,
    budget,
    transactions,
    pendingMemberships,
    overdueTasks,
    upcomingMeetingDocs,
    upcomingEventDocs,
    activeVoteDocs,
    pendingResourceDocs,
  ] = await Promise.all([
    OrganizationMembership.countDocuments({ organizationId: orgId, status: 'active' }),
    OrganizationMembership.countDocuments({ organizationId: orgId, status: 'applied' }),
    OrgTask.countDocuments({ organizationId: organizationObjectId, status: { $ne: 'done' } }),
    OrgTask.countDocuments({
      organizationId: organizationObjectId,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    }),
    OrgMeeting.countDocuments({ organizationId: organizationObjectId, date: { $gte: now } }),
    Event.countDocuments({ organizationId: orgId, status: 'published', startDate: { $gte: now } }),
    OrgVote.countDocuments({
      organizationId: organizationObjectId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),
    ResourceRequest.countDocuments({ organizationId: organizationObjectId, status: 'pending' }),
    OrganizationActivity.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    OrganizationStorageQuota.findOne({ organizationId: orgId }).lean(),
    OrgBudget.findOne({ organizationId: organizationObjectId }).sort({ fiscalYear: -1 }).lean(),
    OrgTransaction.find({ organizationId: organizationObjectId }).lean(),
    OrganizationMembership.find({ organizationId: orgId, status: 'applied' })
      .sort({ appliedAt: -1, createdAt: -1 })
      .limit(3)
      .populate('studentId', 'firstName lastName studentNumber')
      .lean(),
    OrgTask.find({
      organizationId: organizationObjectId,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    })
      .sort({ dueDate: 1 })
      .limit(3)
      .select('title dueDate priority status')
      .lean(),
    OrgMeeting.find({ organizationId: organizationObjectId, date: { $gte: now } })
      .sort({ date: 1 })
      .limit(3)
      .select('title date')
      .lean(),
    Event.find({ organizationId: orgId, status: 'published', startDate: { $gte: now } })
      .sort({ startDate: 1 })
      .limit(3)
      .select('title startDate')
      .lean(),
    OrgVote.find({
      organizationId: organizationObjectId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ endDate: 1 })
      .limit(3)
      .select('title endDate')
      .lean(),
    ResourceRequest.find({ organizationId: organizationObjectId, status: 'pending' })
      .sort({ dateNeeded: 1, createdAt: -1 })
      .limit(3)
      .select('description dateNeeded resourceType status')
      .lean(),
  ]);

  const totalExpenses = (transactions as DashboardTransaction[])
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);
  const budgetUtilization =
    budget && budget.totalBudget > 0 ? totalExpenses / budget.totalBudget : 0;
  const storageUtilization =
    quota && quota.storageLimitMb > 0
      ? quota.usedStorageBytes / (quota.storageLimitMb * 1024 * 1024)
      : 0;

  const result = {
    summary: {
      activeMembers,
      pendingApplications,
      tasksOpen,
      tasksOverdue,
      upcomingMeetings,
      upcomingEvents,
      activeVotes,
      pendingResourceRequests,
      budgetUtilization,
      storageUtilization,
    },
    pendingActions: [
      ...(pendingMemberships as DashboardActionDoc[]).map((membership) => ({
        type: 'membership',
        id: String(membership._id),
        label: 'Review membership application',
        priority: 'normal',
        dueAt: membership.appliedAt ?? membership.createdAt,
      })),
      ...(overdueTasks as DashboardActionDoc[]).map((task) => ({
        type: 'task',
        id: String(task._id),
        label: task.title,
        priority: task.priority === 'urgent' ? 'high' : task.priority,
        dueAt: task.dueDate,
      })),
      ...(pendingResourceDocs as DashboardActionDoc[]).map((request) => ({
        type: 'resource_request',
        id: String(request._id),
        label: request.description,
        priority: 'normal',
        dueAt: request.dateNeeded,
      })),
    ].slice(0, 8),
    calendar: [
      ...(upcomingMeetingDocs as DashboardCalendarDoc[]).map((meeting) => ({
        type: 'meeting',
        id: String(meeting._id),
        title: meeting.title,
        date: meeting.date,
      })),
      ...(upcomingEventDocs as DashboardCalendarDoc[]).map((event) => ({
        type: 'event',
        id: String(event._id),
        title: event.title,
        date: event.startDate,
      })),
      ...(activeVoteDocs as DashboardCalendarDoc[]).map((vote) => ({
        type: 'vote',
        id: String(vote._id),
        title: vote.title,
        date: vote.endDate,
      })),
    ]
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .slice(0, 8),
    recentActivity,
    alerts: [
      ...(tasksOverdue > 0
        ? [{ type: 'tasks', label: `${tasksOverdue} overdue task${tasksOverdue === 1 ? '' : 's'}`, severity: 'warning' }]
        : []),
      ...(budgetUtilization >= 0.9
        ? [{ type: 'budget', label: 'Budget is nearly exhausted', severity: 'critical' }]
        : budgetUtilization >= 0.75
          ? [{ type: 'budget', label: 'Budget usage is high', severity: 'warning' }]
          : []),
      ...(storageUtilization >= 0.9
        ? [{ type: 'storage', label: 'Storage quota is nearly full', severity: 'critical' }]
        : storageUtilization >= 0.75
          ? [{ type: 'storage', label: 'Storage usage is high', severity: 'warning' }]
          : []),
    ],
  };

  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getOverview = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `overview:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [totalTasks, completedTasks, meetings, activeMemberships] = await Promise.all([
    OrgTask.countDocuments({ organizationId: String(oid) }),
    OrgTask.countDocuments({ organizationId: String(oid), status: 'done' }),
    OrgMeeting.find({ organizationId: String(oid) }).lean(),
    OrganizationMembership.countDocuments({ organizationId: orgId, status: 'active' }),
  ]);

  const tasksCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const meetingsHeld = meetings.length;
  const avgMeetingAttendance = meetings.length > 0
    ? meetings.reduce((sum, m) => sum + (m.attendees?.filter((a) => a.rsvp === 'accepted').length ?? 0), 0) / meetings.length
    : 0;

  // Budget utilization
  const budget = await OrgBudget.findOne({ organizationId: String(oid) }).lean();
  const transactions = await OrgTransaction.find({ organizationId: String(oid) }).lean();
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const budgetUtilization = budget && budget.totalBudget > 0 ? totalExpenses / budget.totalBudget : 0;

  // Basic engagement score (weighted composite)
  const engagementScore = computeEngagementScore(completedTasks, meetingsHeld, avgMeetingAttendance, activeMemberships, totalExpenses, budget?.totalBudget ?? 0);

  const result = {
    members: activeMemberships,
    tasksCompleted: completedTasks,
    tasksCompletionRate,
    meetingsHeld,
    meetingAttendanceRate: meetings.length > 0 ? avgMeetingAttendance / Math.max(...meetings.map((m) => m.attendees?.length ?? 0), 1) : 0,
    budgetUtilization,
    engagementScore,
  };

  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getTaskAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `tasks:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const tasks = await OrgTask.find({ organizationId: String(oid) }).lean();
  const now = new Date();

  const byStatus = ['todo', 'in_progress', 'done'].map((s) => ({
    name: s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Done',
    value: tasks.filter((t) => t.status === s).length,
  }));

  const byPriority = ['low', 'medium', 'high', 'urgent'].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: tasks.filter((t) => t.priority === p).length,
  }));

  const completionRate = tasks.length > 0 ? tasks.filter((t) => t.status === 'done').length / tasks.length : 0;
  const overdueCount = tasks.filter((t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now).length;

  const result = { byStatus, byPriority, completionRate, overdueCount };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getEventAnalytics = async (req: AuthRequest, orgId: string) => {
  await checkAccess(req, orgId);
  const cacheKey = `events:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const events = await Event.find({ organizationId: orgId }).lean();
  const eventIds = events.map((e) => e._id);
  const registrations = eventIds.length > 0 ? await EventRegistration.find({ eventId: { $in: eventIds } }).lean() : [];
  const attendanceLogs = eventIds.length > 0 ? await EventAttendanceLog.find({ eventId: { $in: eventIds } }).lean() : [];

  const totalRegistrations = registrations.length;
  const totalAttendance = attendanceLogs.filter((l) => l.result === 'success').length;
  const attendanceRate = totalRegistrations > 0 ? totalAttendance / totalRegistrations : 0;

  // Monthly breakdown
  const byMonthMap: Record<string, { month: string; registrations: number; attendance: number }> = {};
  for (const reg of registrations) {
    const key = reg.createdAt ? new Date(reg.createdAt).toISOString().slice(0, 7) : 'unknown';
    if (!byMonthMap[key]) {
      byMonthMap[key] = { month: key, registrations: 0, attendance: 0 };
    }
    byMonthMap[key].registrations++;
  }
  for (const log of attendanceLogs) {
    const key = log.scannedAt ? new Date(log.scannedAt).toISOString().slice(0, 7) : 'unknown';
    if (!byMonthMap[key]) {
      byMonthMap[key] = { month: key, registrations: 0, attendance: 0 };
    }
    byMonthMap[key].attendance++;
  }

  const result = {
    totalEvents: events.length,
    totalRegistrations,
    totalAttendance,
    attendanceRate,
    byMonth: Object.values(byMonthMap).sort((a, b) => a.month.localeCompare(b.month)),
  };

  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getFinancialAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `financial:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [budget, transactions] = await Promise.all([
    OrgBudget.findOne({ organizationId: String(oid) }).lean(),
    OrgTransaction.find({ organizationId: String(oid) }).lean(),
  ]);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const budgetAmount = budget?.totalBudget ?? 0;
  const budgetUsed = totalExpenses;
  const budgetUtilization = budgetAmount > 0 ? budgetUsed / budgetAmount : 0;

  const byCategoryMap: Record<string, { category: string; income: number; expense: number }> = {};
  for (const tx of transactions) {
    if (!byCategoryMap[tx.category]) {
      byCategoryMap[tx.category] = { category: tx.category, income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      byCategoryMap[tx.category].income += tx.amount;
    } else {
      byCategoryMap[tx.category].expense += tx.amount;
    }
  }

  const result = {
    totalIncome, totalExpenses, balance,
    budgetAmount, budgetUsed, budgetUtilization,
    byCategory: Object.values(byCategoryMap),
  };

  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getEngagement = async (req: AuthRequest, orgId: string) => {
  await checkAccess(req, orgId);
  const cacheKey = `engagement:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const memberships = await OrganizationMembership.find({ organizationId: orgId, status: 'active' }).lean();
  const activeMembers = memberships.length;
  let totalHours = 0;
  let totalContributions = 0;

  for (const m of memberships) {
    if (m.contributions) {
      totalHours += m.contributions.reduce((s, c) => s + (c.hours ?? 0), 0);
      totalContributions += m.contributions.length;
    }
  }

  // Engagement score based on contribution activity
  const avgHours = activeMembers > 0 ? totalHours / activeMembers : 0;
  const score = Math.min(100, Math.round(
    (activeMembers > 0 ? 30 : 0) +
    (avgHours > 0 ? Math.min(40, avgHours * 5) : 0) +
    (totalContributions > 0 ? Math.min(30, totalContributions * 2) : 0)
  ));

  const result = { score, activeMembers, totalContributions, totalHours };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getTaskForceAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `taskforces:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {return cached;}

  const total = await OrgTaskForce.countDocuments({ organizationId: String(oid) });
  const byStatus = await OrgTaskForce.aggregate([
    { $match: { organizationId: oid } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const objectivesStats = await OrgTaskForce.aggregate([
    { $match: { organizationId: oid } },
    { $unwind: '$objectives' },
    { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: ['$objectives.completed', 1, 0] } } } },
  ]);
  const result = {
    total,
    byStatus: byStatus.map((s: { _id: string; count: number }) => ({ status: s._id, count: s.count })),
    objectivesTotal: objectivesStats[0]?.total ?? 0,
    objectivesCompleted: objectivesStats[0]?.completed ?? 0,
  };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getResourceAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `resources:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {return cached;}

  const total = await ResourceRequest.countDocuments({ organizationId: String(oid) });
  const byStatus = await ResourceRequest.aggregate([
    { $match: { organizationId: oid } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const byType = await ResourceRequest.aggregate([
    { $match: { organizationId: oid } },
    { $group: { _id: '$resourceType', count: { $sum: 1 } } },
  ]);
  const result = {
    total,
    byStatus: byStatus.map((s: { _id: string; count: number }) => ({ status: s._id, count: s.count })),
    byType: byType.map((t: { _id: string; count: number }) => ({ resourceType: t._id, count: t.count })),
  };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getPartnershipAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `partnerships:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {return cached;}

  const org = await Organization.findById(oid).select('id');
  if (!org) {throw new AppError('Organization not found', 404);}
  const orgSlug = org.id;
  const partnerships = await OrgPartnership.find({
    $or: [{ orgIdA: orgSlug }, { orgIdB: orgSlug }],
  }).lean();
  const byStatus: Record<string, number> = {};
  for (const p of partnerships) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  }
  const result = { total: partnerships.length, byStatus };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getCollaborationAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `collaborations:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {return cached;}

  const org = await Organization.findById(oid).select('id');
  if (!org) {throw new AppError('Organization not found', 404);}
  const orgSlug = org.id;
  const spaces = await CollaborationSpace.find({ participantOrgIds: orgSlug }).lean();
  const spaceIds = spaces.map((s) => s._id);
  const messageCount = spaceIds.length > 0
    ? await CollaborationMessage.countDocuments({ spaceId: { $in: spaceIds } })
    : 0;
  const result = {
    totalSpaces: spaces.length,
    activeSpaces: spaces.filter((s) => s.isActive).length,
    totalMessages: messageCount,
  };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getMentorshipAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `mentorships:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {return cached;}

  const org = await Organization.findById(oid).select('id');
  if (!org) {throw new AppError('Organization not found', 404);}
  const orgSlug = org.id;
  const mentorships = await OrgMentorship.find({
    $or: [{ mentorOrgId: orgSlug }, { menteeOrgId: orgSlug }],
  }).lean();
  const byStatus: Record<string, number> = {};
  let totalSessions = 0;
  for (const m of mentorships) {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    totalSessions += m.meetings?.length ?? 0;
  }
  const result = {
    total: mentorships.length,
    byStatus,
    totalSessions,
    avgSessionsPerMentorship: mentorships.length > 0 ? Math.round(totalSessions / mentorships.length) : 0,
  };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const getSharedContentAnalytics = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `shared-content:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {return cached;}

  const org = await Organization.findById(oid).select('id');
  if (!org) {throw new AppError('Organization not found', 404);}
  const orgSlug = org.id;
  const outgoing = await CrossOrgContentShare.countDocuments({ sourceOrgId: orgSlug });
  const incoming = await CrossOrgContentShare.countDocuments({ targetOrgIds: orgSlug });
  const byType = await CrossOrgContentShare.aggregate([
    { $match: { $or: [{ sourceOrgId: orgSlug }, { targetOrgIds: orgSlug }] } },
    { $group: { _id: '$contentType', count: { $sum: 1 } } },
  ]);
  const result = {
    outgoing,
    incoming,
    total: outgoing + incoming,
    byType: byType.map((t: { _id: string; count: number }) => ({ contentType: t._id, count: t.count })),
  };
  await analyticsCache.set(cacheKey, result);
  return result;
};

export const exportReport = async (req: AuthRequest, orgId: string) => {
  const [overview, tasks, events, financial, engagement, taskForces, resources, partnerships, collaborations, mentorships, sharedContent] = await Promise.all([
    getOverview(req, orgId),
    getTaskAnalytics(req, orgId),
    getEventAnalytics(req, orgId),
    getFinancialAnalytics(req, orgId),
    getEngagement(req, orgId),
    getTaskForceAnalytics(req, orgId),
    getResourceAnalytics(req, orgId),
    getPartnershipAnalytics(req, orgId),
    getCollaborationAnalytics(req, orgId),
    getMentorshipAnalytics(req, orgId),
    getSharedContentAnalytics(req, orgId),
  ]);

  return { overview, tasks, events, financial, engagement, taskForces, resources, partnerships, collaborations, mentorships, sharedContent };
};

// Private helpers

function computeEngagementScore(
  completedTasks: number,
  meetingsHeld: number,
  avgAttendance: number,
  activeMembers: number,
  totalExpenses: number,
  budgetAmount: number
): number {
  let score = 0;
  if (completedTasks > 0) {
    score += Math.min(30, completedTasks * 2);
  }
  if (meetingsHeld > 0) {
    score += Math.min(20, meetingsHeld * 3);
  }
  if (avgAttendance > 1) {
    score += Math.min(15, avgAttendance * 2);
  }
  if (activeMembers > 5) {
    score += Math.min(20, activeMembers);
  }
  if (budgetAmount > 0 && totalExpenses > 0) {
    score += Math.min(15, (totalExpenses / budgetAmount) * 10);
  }
  return Math.min(100, Math.round(score));
}
