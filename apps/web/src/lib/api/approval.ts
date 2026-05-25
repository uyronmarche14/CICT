import api from './axios';
import type { ApprovalQueueItem, ApprovalActionItem, ApprovalStats } from '@/types';

export interface ApprovalQueueParams {
  page?: number;
  limit?: number;
  type?: 'all' | 'events' | 'news' | 'announcements';
}

export interface ApprovalQueueResponse {
  success: boolean;
  data: {
    items: ApprovalQueueItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ApprovalStatsResponse {
  success: boolean;
  data: ApprovalStats;
}

export interface ApprovalHistoryResponse {
  success: boolean;
  data: {
    actions: ApprovalActionItem[];
  };
}

export const approvalAPI = {
  getPendingQueue: async (params?: ApprovalQueueParams) => {
    const { data } = await api.get<ApprovalQueueResponse>('/admin/approvals/pending', { params });
    return data;
  },

  getStats: async () => {
    const { data } = await api.get<ApprovalStatsResponse>('/admin/approvals/stats');
    return data;
  },

  getHistory: async (contentType: string, contentId: string) => {
    const { data } = await api.get<ApprovalHistoryResponse>(
      `/admin/approvals/history/${contentType}/${contentId}`
    );
    return data;
  },
};
