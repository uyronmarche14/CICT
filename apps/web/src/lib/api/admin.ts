import api from './axios';
import { DashboardSummary } from '@/types';

export const adminAPI = {
  getDashboardSummary: async (signal?: AbortSignal) => {
    const response = await api.get<{ success: boolean; data: DashboardSummary }>(
      '/admin/dashboard/summary',
      { signal }
    );
    return response.data.data;
  },
};
