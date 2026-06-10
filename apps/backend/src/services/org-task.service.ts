import Organization from '../models/Organization';
import OrgTask from '../models/OrgTask';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { ensureReferenceValuesAllowed, ensureUsersExist } from './lookup.service';
import { pickAllowedFields } from '../utils/allowedFields';

const TASK_ALLOWED = ['title', 'description', 'status', 'priority', 'dueDate', 'category', 'tags', 'assigneeIds', 'attachments', 'checklist', 'committee', 'fiscalYear', 'semester', 'meetingId', 'actionItemIndex'];

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_TASKS)) {
    throw new AppError('You do not have access to manage tasks for this organization', 403);
  }
  const organization = await Organization.findOne({ id: orgId }).select('_id');
  if (!organization) {throw new AppError('Organization not found', 404);}
  return organization._id;
};

export const listTasks = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const filter: Record<string, unknown> = { organizationId: oid };
  if (req.query.status) {filter.status = req.query.status;}
  if (req.query.priority) {filter.priority = req.query.priority;}
  if (req.query.assignee) {filter.assigneeIds = req.query.assignee;}
  if (req.query.fiscalYear) {filter.fiscalYear = req.query.fiscalYear;}
  if (req.query.semester) {filter.semester = req.query.semester;}
  return OrgTask.find(filter).sort({ createdAt: -1 }).lean();
};

export const createTask = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  await validateTaskReferenceData(req.body);
  if (Array.isArray(req.body.assigneeIds)) {
    req.body.assigneeIds = await ensureUsersExist(req.body.assigneeIds);
  }
  return OrgTask.create({ ...pickAllowedFields(req.body, TASK_ALLOWED), organizationId: String(oid), createdBy });
};

export const getTask = async (req: AuthRequest, orgId: string, taskId: string) => {
  const oid = await resolveOrg(req, orgId);
  const task = await OrgTask.findOne({ _id: taskId, organizationId: String(oid) }).lean();
  if (!task) {throw new AppError('Task not found', 404);}
  return task;
};

export const updateTask = async (req: AuthRequest, orgId: string, taskId: string) => {
  const oid = await resolveOrg(req, orgId);
  const task = await OrgTask.findOne({ _id: taskId, organizationId: String(oid) });
  if (!task) {throw new AppError('Task not found', 404);}
  if (req.body.status && task.status !== req.body.status) {
    task.statusHistory.push({
      status: req.body.status,
      changedBy: req.user!.userId,
      changedAt: new Date(),
      reason: req.body.reason,
    });
  }
  await validateTaskReferenceData(req.body);
  if (Array.isArray(req.body.assigneeIds)) {
    req.body.assigneeIds = await ensureUsersExist(req.body.assigneeIds);
  }
  Object.assign(task, req.body);
  await task.save();
  return task;
};

const validateTaskReferenceData = async (body: Record<string, unknown>) => {
  if (body.category) {
    await ensureReferenceValuesAllowed('taskCategories', [body.category], 'Invalid task category');
  }
  if (body.committee) {
    await ensureReferenceValuesAllowed('committees', [body.committee], 'Invalid committee');
  }
  if (body.officerPosition) {
    await ensureReferenceValuesAllowed('officerPositions', [body.officerPosition], 'Invalid officer position');
  }
};

export const deleteTask = async (req: AuthRequest, orgId: string, taskId: string) => {
  const oid = await resolveOrg(req, orgId);
  const task = await OrgTask.findOneAndDelete({ _id: taskId, organizationId: String(oid) });
  if (!task) {throw new AppError('Task not found', 404);}
};

export const updateTaskStatus = async (req: AuthRequest, orgId: string, taskId: string) => {
  const oid = await resolveOrg(req, orgId);
  const task = await OrgTask.findOne({ _id: taskId, organizationId: String(oid) });
  if (!task) {throw new AppError('Task not found', 404);}
  if (task.status !== req.body.status) {
    task.statusHistory.push({
      status: req.body.status,
      changedBy: req.user!.userId,
      changedAt: new Date(),
      reason: req.body.reason,
    });
  }
  task.status = req.body.status;
  await task.save();
  return task;
};

export const toggleChecklistItem = async (req: AuthRequest, orgId: string, taskId: string) => {
  const oid = await resolveOrg(req, orgId);
  const task = await OrgTask.findOne({ _id: taskId, organizationId: String(oid) });
  if (!task) {throw new AppError('Task not found', 404);}

  const { index, completed } = req.body;
  if (index < 0 || index >= task.checklist.length) {
    throw new AppError('Checklist item not found', 404);
  }

  task.checklist[index].completed = completed;
  await task.save();
  return task;
};
