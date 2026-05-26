import api from './axios';
import type { ProcessNodeType, ProcessInstanceStatus } from '@/types';
import type { NodeAssignment } from '@/types';
export type { NodeAssignment };

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

export type ProcessTemplate = {
  _id: string;
  title: string;
  description?: string;
  processType: string;
  organizationScope?: string | null;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  nodeAssignments: NodeAssignment[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProcessTemplateMutationPayload = {
  title: string;
  description?: string;
  processType: string;
  organizationScope?: string | null;
  nodes?: ProcessNode[];
  edges?: ProcessEdge[];
  nodeAssignments?: NodeAssignment[];
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

export type ProcessInstance = {
  _id: string;
  templateId?: string | { _id: string; title: string; description?: string; processType?: string };
  title: string;
  description?: string;
  status: ProcessInstanceStatus;
  linkedContentType?: 'news' | 'announcement' | 'event';
  linkedContentId?: string;
  organizationId?: string | null;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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

export type ProcessInstanceMutationPayload = {
  title: string;
  description?: string;
  templateId?: string;
  linkedContentType?: 'news' | 'announcement' | 'event';
  linkedContentId?: string;
  organizationId?: string | null;
  assignedTo?: string[];
};

type ListResponse<T> = {
  success: boolean;
  data: {
    templates?: T[];
    instances?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

type SingleResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type ActivityItem = {
  type: string;
  timestamp: string;
  detail: string;
  actor?: string;
};

export const processAPI = {
  getTemplates: async (params?: {
    page?: number;
    limit?: number;
    processType?: string;
    organizationScope?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const response = await api.get<ListResponse<ProcessTemplate>>('/admin/processes/templates', { params });
    return response.data;
  },

  getTemplate: async (id: string) => {
    const response = await api.get<SingleResponse<{ template: ProcessTemplate }>>(`/admin/processes/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: ProcessTemplateMutationPayload) => {
    const response = await api.post<SingleResponse<{ template: ProcessTemplate }>>('/admin/processes/templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<ProcessTemplateMutationPayload> & { isActive?: boolean }) => {
    const response = await api.put<SingleResponse<{ template: ProcessTemplate }>>(`/admin/processes/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await api.delete<SingleResponse<never>>(`/admin/processes/templates/${id}`);
    return response.data;
  },

  getInstances: async (params?: {
    page?: number;
    limit?: number;
    status?: ProcessInstanceStatus;
    linkedContentType?: string;
    linkedContentId?: string;
    organizationId?: string;
    assignedTo?: string;
    search?: string;
  }) => {
    const response = await api.get<ListResponse<ProcessInstance>>('/admin/processes/instances', { params });
    return response.data;
  },

  getInstance: async (id: string) => {
    const response = await api.get<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}`);
    return response.data;
  },

  createInstance: async (data: ProcessInstanceMutationPayload) => {
    const response = await api.post<SingleResponse<{ instance: ProcessInstance }>>('/admin/processes/instances', data);
    return response.data;
  },

  updateInstance: async (id: string, data: Partial<ProcessInstanceMutationPayload>) => {
    const response = await api.put<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}`, data);
    return response.data;
  },

  deleteInstance: async (id: string) => {
    const response = await api.delete<SingleResponse<never>>(`/admin/processes/instances/${id}`);
    return response.data;
  },

  transitionStatus: async (id: string, status: ProcessInstanceStatus) => {
    const response = await api.patch<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}/status`, { status });
    return response.data;
  },

  addComment: async (id: string, body: string) => {
    const response = await api.patch<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}/comments`, { body });
    return response.data;
  },

  toggleRequirement: async (id: string, reqId: string, completed: boolean) => {
    const response = await api.patch<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}/requirements/${reqId}`, { completed });
    return response.data;
  },

  approveStep: async (id: string, nodeId: string, status: 'approved' | 'rejected', reason?: string) => {
    const response = await api.patch<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}/approve-step`, { nodeId, status, reason });
    return response.data;
  },

  advanceInstance: async (id: string, completedNodeIds: string[]) => {
    const response = await api.patch<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}/advance`, { completedNodeIds });
    return response.data;
  },

  updateChecklistItem: async (id: string, nodeId: string, itemId: string, completed: boolean) => {
    const response = await api.patch<SingleResponse<{ instance: ProcessInstance }>>(`/admin/processes/instances/${id}/checklist-item`, { nodeId, itemId, completed });
    return response.data;
  },

  getActivity: async (id: string) => {
    const response = await api.get<SingleResponse<{ activity: ActivityItem[] }>>(`/admin/processes/instances/${id}/activity`);
    return response.data;
  },
};
