import type { ProcessNodeType } from '../enums/process';
import type { ProcessInstanceStatus } from '../enums/process';

export type ProcessNode = {
  id: string;
  type: ProcessNodeType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

export type ProcessEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, unknown>;
};

export type NodeAssignment = {
  nodeId: string;
  assigneeType: 'user' | 'role' | 'organization';
  assigneeId: string;
};

export type ProcessCommentItem = {
  authorId: string;
  body: string;
  createdAt: string;
};

export type ProcessRequirementItem = {
  id: string;
  label: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
};

export type ProcessApprovalStepItem = {
  nodeId: string;
  status: 'pending' | 'approved' | 'rejected';
  actorId?: string;
  actedAt?: string;
  reason?: string;
};

export type ProcessTemplate = {
  _id: string;
  title: string;
  description?: string;
  processType: string;
  organizationScope?: string | null;
  createdBy: string | { _id: string; firstName: string; lastName: string; email: string };
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  nodeAssignments: NodeAssignment[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProcessInstance = {
  _id: string;
  templateId?: string | ProcessTemplate;
  title: string;
  description?: string;
  status: ProcessInstanceStatus;
  linkedContentType?: 'news' | 'announcement' | 'event' | 'task' | 'meeting' | 'budget';
  linkedContentId?: string;
  organizationId?: string | null;
  createdBy: string | { _id: string; firstName: string; lastName: string; email: string };
  assignedTo: string[];
  nodeAssignments: NodeAssignment[];
  nodesSnapshot: ProcessNode[];
  edgesSnapshot: ProcessEdge[];
  currentNodeIds: string[];
  comments: ProcessCommentItem[];
  requirements: ProcessRequirementItem[];
  approvalSteps: ProcessApprovalStepItem[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
