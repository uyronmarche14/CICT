import { z } from 'zod';
import type { ProcessNode } from '../types/process';
import type { ProcessEdge } from '../types/process';
import type { NodeAssignment } from '../types/process';
import type { ProcessCommentItem } from '../types/process';
import type { ProcessRequirementItem } from '../types/process';
import type { ProcessApprovalStepItem } from '../types/process';
import type { ProcessTemplate } from '../types/process';
import type { ProcessInstance } from '../types/process';
import { processNodeTypeSchema } from './process-enums';
import { processInstanceStatusSchema } from './process-enums';

export const processNodeSchema: z.ZodType<ProcessNode> = z.object({
  id: z.string(),
  type: processNodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()),
});

export const processEdgeSchema: z.ZodType<ProcessEdge> = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export const processCommentItemSchema: z.ZodType<ProcessCommentItem> = z.object({
  authorId: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

export const processRequirementItemSchema: z.ZodType<ProcessRequirementItem> = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.boolean(),
  completedBy: z.string().optional(),
  completedAt: z.string().optional(),
});

export const processApprovalStepItemSchema: z.ZodType<ProcessApprovalStepItem> = z.object({
  nodeId: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  actorId: z.string().optional(),
  actedAt: z.string().optional(),
  reason: z.string().optional(),
});

export const nodeAssignmentSchema: z.ZodType<NodeAssignment> = z.object({
  nodeId: z.string(),
  assigneeType: z.enum(['user', 'role', 'organization']),
  assigneeId: z.string(),
});

export const processTemplateSchema: z.ZodType<ProcessTemplate> = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  processType: z.string(),
  organizationScope: z.string().nullable().optional(),
  createdBy: z.union([
    z.string(),
    z.object({ _id: z.string(), firstName: z.string(), lastName: z.string(), email: z.string() }),
  ]),
  nodes: z.array(processNodeSchema),
  edges: z.array(processEdgeSchema),
  nodeAssignments: z.array(nodeAssignmentSchema),
  version: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const processInstanceSchema: z.ZodType<ProcessInstance> = z.object({
  _id: z.string(),
  templateId: z.union([z.string(), processTemplateSchema]).optional(),
  title: z.string(),
  description: z.string().optional(),
  status: processInstanceStatusSchema,
  linkedContentType: z.enum(['news', 'announcement', 'event', 'task', 'meeting', 'budget']).optional(),
  linkedContentId: z.string().optional(),
  organizationId: z.string().nullable().optional(),
  createdBy: z.union([
    z.string(),
    z.object({ _id: z.string(), firstName: z.string(), lastName: z.string(), email: z.string() }),
  ]),
  assignedTo: z.array(z.string()),
  nodeAssignments: z.array(nodeAssignmentSchema),
  nodesSnapshot: z.array(processNodeSchema),
  edgesSnapshot: z.array(processEdgeSchema),
  currentNodeIds: z.array(z.string()),
  comments: z.array(processCommentItemSchema),
  requirements: z.array(processRequirementItemSchema),
  approvalSteps: z.array(processApprovalStepItemSchema),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
