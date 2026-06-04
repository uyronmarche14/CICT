import api from './axios';

interface Task {
  _id: string;
  organizationId: string;
  title: string;
  description?: string;
  assigneeIds?: string[];
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category?: string;
  tags?: string[];
  attachments?: Array<{ name: string; url: string; type: string }>;
  checklist?: Array<{ text: string; completed: boolean }>;
  statusHistory?: Array<{ status: string; changedBy: string; changedAt: string; reason?: string }>;
  meetingId?: string;
  actionItemIndex?: number;
  committee?: string;
  officerPosition?: string;
  createdAt: string;
  updatedAt: string;
}

export const orgTasksAPI = {
  list: async (orgId: string, params?: Record<string, string>) => {
    const res = await api.get<{ success: boolean; data: Task[] }>(`/organizations/${orgId}/tasks`, { params });
    return res.data.data;
  },
  get: async (orgId: string, taskId: string) => {
    const res = await api.get<{ success: boolean; data: Task }>(`/organizations/${orgId}/tasks/${taskId}`);
    return res.data.data;
  },
  create: async (orgId: string, data: Partial<Task>) => {
    const res = await api.post<{ success: boolean; data: Task }>(`/organizations/${orgId}/tasks`, data);
    return res.data.data;
  },
  update: async (orgId: string, taskId: string, data: Partial<Task>) => {
    const res = await api.put<{ success: boolean; data: Task }>(`/organizations/${orgId}/tasks/${taskId}`, data);
    return res.data.data;
  },
  delete: async (orgId: string, taskId: string) => {
    await api.delete(`/organizations/${orgId}/tasks/${taskId}`);
  },
  updateStatus: async (orgId: string, taskId: string, status: string) => {
    const res = await api.patch<{ success: boolean; data: Task }>(`/organizations/${orgId}/tasks/${taskId}/status`, { status });
    return res.data.data;
  },
  toggleChecklist: async (orgId: string, taskId: string, index: number, completed: boolean) => {
    const res = await api.patch<{ success: boolean; data: Task }>(`/organizations/${orgId}/tasks/${taskId}/checklist`, { index, completed });
    return res.data.data;
  },
  promoteFromMeetingAction: async (orgId: string, title: string, meetingId: string, actionItemIndex: number) => {
    const res = await api.post<{ success: boolean; data: Task }>(`/organizations/${orgId}/tasks`, {
      title, meetingId, actionItemIndex,
    });
    return res.data.data;
  },
};
