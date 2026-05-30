import Organization from '../models/Organization';
import OrgTask from '../models/OrgTask';
import OrgMeeting from '../models/OrgMeeting';
import OrgBudget from '../models/OrgBudget';
import OrgTransaction from '../models/OrgTransaction';
import OrganizationMembership from '../models/OrganizationMembership';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import EventAttendanceLog from '../models/EventAttendanceLog';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { TypedCache } from '../utils/cache';

const analyticsCache = new TypedCache<unknown>({ namespace: 'org:analytics', ttlMs: 60_000 });

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

export const getOverview = async (req: AuthRequest, orgId: string) => {
  const oid = await checkAccess(req, orgId);
  const cacheKey = `overview:${orgId}`;
  const cached = await analyticsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [totalTasks, completedTasks, meetings, activeMemberships] = await Promise.all([
    OrgTask.countDocuments({ organizationId: oid }),
    OrgTask.countDocuments({ organizationId: oid, status: 'done' }),
    OrgMeeting.find({ organizationId: oid }).lean(),
    OrganizationMembership.countDocuments({ organizationId: orgId, status: 'active' }),
  ]);

  const tasksCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const meetingsHeld = meetings.length;
  const avgMeetingAttendance = meetings.length > 0
    ? meetings.reduce((sum, m) => sum + (m.attendees?.filter((a) => a.rsvp === 'accepted').length ?? 0), 0) / meetings.length
    : 0;

  // Budget utilization
  const budget = await OrgBudget.findOne({ organizationId: oid }).lean();
  const transactions = await OrgTransaction.find({ organizationId: oid }).lean();
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

  const tasks = await OrgTask.find({ organizationId: oid }).lean();
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
    OrgBudget.findOne({ organizationId: oid }).lean(),
    OrgTransaction.find({ organizationId: oid }).lean(),
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

export const exportReport = async (req: AuthRequest, orgId: string) => {
  const [overview, tasks, events, financial, engagement] = await Promise.all([
    getOverview(req, orgId),
    getTaskAnalytics(req, orgId),
    getEventAnalytics(req, orgId),
    getFinancialAnalytics(req, orgId),
    getEngagement(req, orgId),
  ]);

  return { overview, tasks, events, financial, engagement };
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
