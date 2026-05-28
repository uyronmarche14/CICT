import ProcessTemplate from '../models/ProcessTemplate';
import ProcessInstance from '../models/ProcessInstance';
import { AppError } from '../middleware/errorHandler';
import { IProcessNode } from '../types';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['active'],
  active: ['completed', 'archived'],
  completed: ['archived'],
  archived: [],
};

export function canTransition(fromStatus: string, toStatus: string): boolean {
  const allowed = VALID_TRANSITIONS[fromStatus];
  if (!allowed) {return false;}
  return allowed.includes(toStatus);
}

export function findStartNodes(nodes: IProcessNode[]): string[] {
  return nodes
    .filter((n) => n.type === 'start')
    .map((n) => n.id);
}

export function findEndNodes(nodes: IProcessNode[]): string[] {
  return nodes
    .filter((n) => n.type === 'end')
    .map((n) => n.id);
}

export function getNextNodes(
  currentNodeIds: string[],
  edges: { source: string; target: string }[]
): string[] {
  const nextIds: string[] = [];
  for (const currentId of currentNodeIds) {
    const outgoing = edges
      .filter((e) => e.source === currentId)
      .map((e) => e.target);
    nextIds.push(...outgoing);
  }
  return [...new Set(nextIds)];
}

export async function createInstanceFromTemplate(
  templateId: string,
  overrides: {
    title?: string;
    description?: string;
    linkedContentType?: 'news' | 'announcement' | 'event';
    linkedContentId?: string;
    organizationId?: string | null;
    assignedTo?: string[];
    createdBy: string;
  }
) {
  const template = await ProcessTemplate.findById(templateId);
  if (!template) {
    throw new AppError('Process template not found', 404);
  }

  if (!template.isActive) {
    throw new AppError('Cannot create instance from an inactive template', 400);
  }

  const hasStartNode = template.nodes.some((n) => n.type === 'start');
  if (!hasStartNode) {
    throw new AppError('Template must have at least one start node', 400);
  }

  const nodesSnapshot: IProcessNode[] = template.nodes.map((n) => ({
    ...n,
    data: { ...n.data },
  }));

  const edgesSnapshot = template.edges.map((e) => ({
    ...e,
    data: e.data ? { ...e.data } : undefined,
  }));

  const startNodeIds = findStartNodes(nodesSnapshot);

  const nodeAssignments = template.nodeAssignments?.map((a) => ({
    nodeId: a.nodeId,
    assigneeType: a.assigneeType as 'user' | 'role' | 'organization',
    assigneeId: a.assigneeId,
  })) || [];

  const instance = await ProcessInstance.create({
    templateId: template._id,
    title: overrides.title || template.title,
    description: overrides.description !== undefined ? overrides.description : template.description,
    linkedContentType: overrides.linkedContentType,
    linkedContentId: overrides.linkedContentId,
    organizationId: overrides.organizationId || null,
    createdBy: overrides.createdBy as any,
    assignedTo: overrides.assignedTo || [],
    nodeAssignments,
    nodesSnapshot,
    edgesSnapshot,
    currentNodeIds: startNodeIds,
    status: 'draft',
    comments: [],
    requirements: [],
    approvalSteps: [],
  });

  return instance;
}

export async function transitionInstanceStatus(
  instanceId: string,
  toStatus: string,
  _userId: string
) {
  const instance = await ProcessInstance.findById(instanceId);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  if (!canTransition(instance.status, toStatus)) {
    throw new AppError(
      `Cannot transition from '${instance.status}' to '${toStatus}'`,
      400
    );
  }

  const updates: Record<string, unknown> = { status: toStatus };

  if (toStatus === 'active' && !instance.startedAt) {
    updates.startedAt = new Date();
  }

  if (toStatus === 'completed') {
    updates.completedAt = new Date();
  }

  const updated = await ProcessInstance.findByIdAndUpdate(
    instanceId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return updated;
}

export async function advanceInstance(
  instanceId: string,
  completedNodeIds: string[],
  existingInstance?: InstanceType<typeof ProcessInstance>
) {
  const instance = existingInstance || await ProcessInstance.findById(instanceId);
  if (!instance) {
    throw new AppError('Process instance not found', 404);
  }

  if (instance.status !== 'active') {
    throw new AppError('Instance must be active to advance', 400);
  }

  const remainingCurrentIds = instance.currentNodeIds.filter(
    (id) => !completedNodeIds.includes(id)
  );

  const newlyReachedIds = getNextNodes(
    completedNodeIds,
    instance.edgesSnapshot
  );

  const nextIds = [...new Set([...remainingCurrentIds, ...newlyReachedIds])];

  const endNodeIds = findEndNodes(instance.nodesSnapshot);
  const anyEndReached = endNodeIds.length > 0 && endNodeIds.some((id) => completedNodeIds.includes(id));
  const noMoreNodes = nextIds.length === 0;
  const isComplete = anyEndReached || noMoreNodes;

  const updates: Record<string, unknown> = {
    currentNodeIds: nextIds,
  };

  if (isComplete) {
    updates.status = 'completed';
    updates.completedAt = new Date();
  }

  const updated = await ProcessInstance.findByIdAndUpdate(
    instanceId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return updated;
}
