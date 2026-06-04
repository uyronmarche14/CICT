import { Response } from 'express';
import ProcessTemplate from '../models/ProcessTemplate';
import ProcessInstance from '../models/ProcessInstance';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sanitizeHtmlContent } from '../utils/sanitize';
import { parsePagination } from '../utils/pagination';
import { Permission, INodeAssignment } from '../types';
import OrgTask from '../models/OrgTask';
import OrgMeeting from '../models/OrgMeeting';
import OrgBudget from '../models/OrgBudget';
import {
  createInstanceFromTemplate,
  transitionInstanceStatus,
  advanceInstance,
} from '../services/process-engine.service';

function canActOnNode(userId: string, nodeId: string, assignments: INodeAssignment[], permissions: string[]): boolean {
  const hasGlobal = permissions.includes(Permission.VIEW_PROCESS) || permissions.includes(Permission.APPROVE_PROCESS_STEP);
  if (hasGlobal) {return true;}
  return assignments.some((a) => a.nodeId === nodeId && a.assigneeType === 'user' && a.assigneeId === userId);
}

export const createProcessTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { title, description, processType, organizationScope, nodes, edges, nodeAssignments } = req.body;

  const template = await ProcessTemplate.create({
    title,
    description,
    processType,
    organizationScope: organizationScope || null,
    createdBy: req.user.userId as any,
    nodes: nodes || [],
    edges: edges || [],
    nodeAssignments: nodeAssignments || [],
    version: 1,
    isActive: true,
  });

  logger.info(`Process template created: ${template._id} by user ${req.user.userId}`);

  res.status(201).json({
    success: true,
    message: 'Process template created successfully',
    data: { template },
  });
};

export const getAllProcessTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  const { processType, organizationScope, isActive, search } = req.query;

  const conditions: Record<string, unknown> = {};

  if (processType) {
    conditions.processType = processType;
  }

  if (organizationScope) {
    conditions.organizationScope = organizationScope;
  }

  if (isActive !== undefined) {
    conditions.isActive = isActive === 'true';
  }

  if (search) {
    conditions.title = { $regex: search, $options: 'i' };
  }

  const { page: p, limit: lim, skip } = parsePagination(req.query as Record<string, unknown>, 10, 100);

  const [templates, total] = await Promise.all([
    ProcessTemplate.find(conditions)
      .populate('createdBy', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(lim),
    ProcessTemplate.countDocuments(conditions),
  ]);

  res.status(200).json({
    success: true,
    data: {
      templates,
      pagination: {
        page: p,
        limit: lim,
        total,
        pages: Math.ceil(total / lim),
      },
    },
  });
};

export const getProcessTemplateById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const template = await ProcessTemplate.findById(id)
    .populate('createdBy', 'firstName lastName email');

  if (!template) {
    throw new AppError('Process template not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { template },
  });
};

export const updateProcessTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const template = await ProcessTemplate.findById(id);
  if (!template) {
    throw new AppError('Process template not found', 404);
  }

  const allowedFields = [
    'title', 'description', 'processType', 'organizationScope',
    'nodes', 'edges', 'nodeAssignments', 'isActive',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  updates.version = (template.version || 1) + 1;

  const updated = await ProcessTemplate.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('createdBy', 'firstName lastName email');

  if (!updated) {
    throw new AppError('Process template not found', 404);
  }

  logger.info(`Process template updated: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Process template updated successfully',
    data: { template: updated },
  });
};

export const deleteProcessTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const template = await ProcessTemplate.findById(id);
  if (!template) {
    throw new AppError('Process template not found', 404);
  }

  template.isActive = false;
  await template.save();

  logger.info(`Process template deactivated: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Process template deactivated successfully',
  });
};

export const createProcessInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { templateId, title, description, linkedContentType, linkedContentId, organizationId, assignedTo } = req.body;

  let instance;

  if (templateId) {
    instance = await createInstanceFromTemplate(templateId, {
      title,
      description,
      linkedContentType,
      linkedContentId,
      organizationId,
      assignedTo,
      createdBy: req.user.userId as any,
    });
  } else {
    instance = await ProcessInstance.create({
      title,
      description,
      linkedContentType,
      linkedContentId,
      organizationId: organizationId || null,
      createdBy: req.user.userId as any,
      assignedTo: assignedTo || [],
      nodesSnapshot: [],
      edgesSnapshot: [],
      currentNodeIds: [],
      status: 'draft',
      comments: [],
      requirements: [],
      approvalSteps: [],
    });
  }

  logger.info(`Process instance created: ${instance._id} by user ${req.user.userId}`);

  res.status(201).json({
    success: true,
    message: 'Process instance created successfully',
    data: { instance },
  });
};

export const getAllProcessInstances = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page: p, limit: lim, skip } = parsePagination(req.query as Record<string, unknown>, 10, 100);
  const {
    status, linkedContentType, linkedContentId,
    organizationId, assignedTo, search,
  } = req.query;

  const conditions: Record<string, unknown> = {};

  if (status) {
    conditions.status = status;
  }

  if (linkedContentType) {
    conditions.linkedContentType = linkedContentType;
  }

  if (linkedContentId) {
    conditions.linkedContentId = linkedContentId;
  }

  if (organizationId) {
    conditions.organizationId = organizationId;
  }

  if (assignedTo) {
    conditions.assignedTo = assignedTo;
  }

  if (search) {
    conditions.title = { $regex: search, $options: 'i' };
  }

  const [instances, total] = await Promise.all([
    ProcessInstance.find(conditions)
      .populate('createdBy', 'firstName lastName email')
      .populate('templateId', 'title')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(lim),
    ProcessInstance.countDocuments(conditions),
  ]);

  res.status(200).json({
    success: true,
    data: {
      instances,
      pagination: {
        page: p,
        limit: lim,
        total,
        pages: Math.ceil(total / lim),
      },
    },
  });
};

export const getProcessInstanceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const instance = await ProcessInstance.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('templateId', 'title description processType');

  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { instance },
  });
};

export const updateProcessInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const instance = await ProcessInstance.findById(id);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  const allowedFields = [
    'title', 'description', 'linkedContentType', 'linkedContentId',
    'organizationId', 'assignedTo',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updated = await ProcessInstance.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('createdBy', 'firstName lastName email');

  if (!updated) {
    throw new AppError('Process instance not found', 404);
  }

  logger.info(`Process instance updated: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Process instance updated successfully',
    data: { instance: updated },
  });
};

export const deleteProcessInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const instance = await ProcessInstance.findById(id);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  instance.status = 'archived';
  await instance.save();

  logger.info(`Process instance archived: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Process instance archived successfully',
  });
};

export const transitionProcessStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { status: toStatus } = req.body;

  const instance = await transitionInstanceStatus(id, toStatus, req.user.userId);

  logger.info(`Process instance status changed: ${id} -> ${toStatus} by user ${req.user.userId}`);

  res.status(200).json({
    success: true,
    message: `Process instance status changed to ${toStatus}`,
    data: { instance },
  });
};

export const addProcessComment = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { body: commentBody } = req.body;

  const sanitizedBody = sanitizeHtmlContent(commentBody);

  const instance = await ProcessInstance.findById(id);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  instance.comments.push({
    authorId: req.user.userId,
    body: sanitizedBody,
    createdAt: new Date(),
  });

  await instance.save();

  logger.info(`Comment added to process instance: ${id} by user ${req.user.userId}`);

  res.status(200).json({
    success: true,
    message: 'Comment added successfully',
    data: { instance },
  });
};

export const toggleProcessRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id, reqId } = req.params;
  const { completed } = req.body;

  const instance = await ProcessInstance.findById(id);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  const requirement = instance.requirements.find((r) => r.id === reqId);
  if (!requirement) {
    throw new AppError('Requirement not found', 404);
  }

  requirement.completed = completed;
  if (completed) {
    requirement.completedBy = req.user.userId;
    requirement.completedAt = new Date();
  } else {
    requirement.completedBy = undefined;
    requirement.completedAt = undefined;
  }

  await instance.save();

  res.status(200).json({
    success: true,
    message: completed ? 'Requirement completed' : 'Requirement reopened',
    data: { instance },
  });
};

export const approveProcessStep = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { nodeId, status: stepStatus, reason } = req.body;

  const instance = await ProcessInstance.findById(id);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  if (!canActOnNode(req.user.userId, nodeId, instance.nodeAssignments || [], req.user.permissions)) {
    throw new AppError('You are not assigned to this step', 403);
  }

  const existingStep = instance.approvalSteps.find((s) => s.nodeId === nodeId);

  if (existingStep) {
    existingStep.status = stepStatus;
    existingStep.actorId = req.user.userId;
    existingStep.actedAt = new Date();
    if (reason) {
      existingStep.reason = reason;
    }
  } else {
    instance.approvalSteps.push({
      nodeId,
      status: stepStatus,
      actorId: req.user.userId,
      actedAt: new Date(),
      reason: reason || undefined,
    });
  }

  await instance.save();

  if (stepStatus === 'approved') {
    await advanceInstance(id, [nodeId], instance);
  }

  logger.info(`Process step ${stepStatus}: ${nodeId} on instance ${id} by user ${req.user.userId}`);

  res.status(200).json({
    success: true,
    message: `Step ${stepStatus} successfully`,
    data: { instance },
  });
};

export const updateChecklistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { nodeId, itemId, completed } = req.body;

  const instance = await ProcessInstance.findById(id);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  if (!canActOnNode(req.user.userId, nodeId, instance.nodeAssignments || [], req.user.permissions)) {
    throw new AppError('You are not assigned to this step', 403);
  }

  if (!instance.currentNodeIds.includes(nodeId)) {
    throw new AppError('Node is not currently active', 400);
  }

  const node = instance.nodesSnapshot.find((n) => n.id === nodeId);
  if (!node) {
    throw new AppError('Node not found', 404);
  }

  const checklist = (node.data?.checklist as Array<{ id: string; label: string; completed?: boolean; completedBy?: string; completedAt?: Date }>) || [];
  const item = checklist.find((ci) => ci.id === itemId);
  if (!item) {
    throw new AppError('Checklist item not found', 404);
  }

  item.completed = completed;
  if (completed) {
    item.completedBy = req.user.userId;
    item.completedAt = new Date();
  } else {
    item.completedBy = undefined;
    item.completedAt = undefined;
  }

  node.data = { ...node.data, checklist };
  instance.markModified('nodesSnapshot');
  await instance.save();

  logger.info(`Checklist item ${itemId} on node ${nodeId} ${completed ? 'completed' : 'uncompleted'} by user ${req.user.userId}`);

  res.status(200).json({
    success: true,
    message: completed ? 'Checklist item completed' : 'Checklist item reopened',
    data: { instance },
  });
};

export const advanceProcessInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { completedNodeIds } = req.body;

  const processInstance = await ProcessInstance.findById(id);
  if (!processInstance) {
    throw new AppError('Process instance not found', 404);
  }

  const anyAssigned = completedNodeIds.some((nid: string) =>
    canActOnNode(req.user!.userId, nid, processInstance.nodeAssignments || [], req.user!.permissions)
  );
  if (!anyAssigned) {
    throw new AppError('You are not assigned to any of these steps', 403);
  }

  const instance = await advanceInstance(id, completedNodeIds);

  logger.info(`Process instance advanced: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'Process instance advanced',
    data: { instance },
  });
};

export const getProcessInstanceActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const instance = await ProcessInstance.findById(id)
    .select('comments requirements approvalSteps status currentNodeIds startedAt completedAt createdAt updatedAt');

  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  const activity: Array<{
    type: string;
    timestamp: Date;
    detail: string;
    actor?: string;
  }> = [];

  activity.push({
    type: 'created',
    timestamp: instance.createdAt,
    detail: 'Process instance created',
  });

  if (instance.startedAt) {
    activity.push({
      type: 'started',
      timestamp: instance.startedAt,
      detail: 'Process instance started',
    });
  }

  if (instance.completedAt) {
    activity.push({
      type: 'completed',
      timestamp: instance.completedAt,
      detail: 'Process instance completed',
    });
  }

  for (const comment of instance.comments) {
    activity.push({
      type: 'comment',
      timestamp: comment.createdAt,
      detail: `Comment by ${comment.authorId}`,
      actor: comment.authorId,
    });
  }

  for (const reqItem of instance.requirements) {
    if (reqItem.completedAt) {
      activity.push({
        type: 'requirement',
        timestamp: reqItem.completedAt,
        detail: `Requirement "${reqItem.label}" ${reqItem.completed ? 'completed' : 'reopened'}`,
        actor: reqItem.completedBy,
      });
    }
  }

  for (const step of instance.approvalSteps) {
    if (step.actedAt) {
      activity.push({
        type: 'approval',
        timestamp: step.actedAt,
        detail: `Step ${step.nodeId} ${step.status}`,
        actor: step.actorId,
      });
    }
  }

  activity.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  res.status(200).json({
    success: true,
    data: { activity },
  });
};

export const linkContentToProcess = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { contentType, contentId, orgId } = req.body;

  const updateModel = async () => {
    const filter = { _id: contentId, organizationId: orgId };
    const update = { $set: { processInstanceId: id } as Record<string, unknown> };
    if (contentType === 'task') {
      return OrgTask.findOneAndUpdate(filter, update, { new: true });
    }
    if (contentType === 'meeting') {
      return OrgMeeting.findOneAndUpdate(filter, update, { new: true });
    }
    return OrgBudget.findOneAndUpdate(filter, update, { new: true });
  };
  const entity = await updateModel();
  if (!entity) { res.status(404).json({ success: false, message: `${contentType} not found` }); return; }

  await ProcessInstance.findByIdAndUpdate(id, { $set: { linkedContentType: contentType, linkedContentId: contentId } });

  res.status(200).json({ success: true, data: entity });
};
