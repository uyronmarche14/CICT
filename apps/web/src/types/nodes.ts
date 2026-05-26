export interface AssigneeItem {
  type: string;
  id: string;
  name?: string;
}

export interface BaseNodeData {
  label?: string;
  assignees?: AssigneeItem[];
}

export interface StartNodeData extends BaseNodeData {
  triggerType?: 'manual' | 'automatic' | 'scheduled';
}

export interface TaskNodeData extends BaseNodeData {
  completed?: boolean;
  completedAt?: string;
  completedBy?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  estimatedHours?: number;
  instructions?: string;
}

export interface ApprovalNodeData extends BaseNodeData {
  status?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string[];
  rejectedBy?: string[];
  approvalType?: 'any' | 'all';
  minApprovers?: number;
  dueDate?: string;
  instructions?: string;
  rejectionBehavior?: 'revise' | 'end' | 'redirect';
  rejectionTargetNodeId?: string;
}

export interface DocumentNodeData extends BaseNodeData {
  requiredDocuments?: string[];
  acceptFileTypes?: string;
  maxFileSize?: number;
}

export interface ReviewNodeData extends BaseNodeData {
  minApprovers?: number;
  instructions?: string;
}

export interface EndNodeData extends BaseNodeData {
  notifyOnComplete?: boolean;
}
