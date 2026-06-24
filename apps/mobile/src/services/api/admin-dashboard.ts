import { client } from '@/services/api/client';

export type DashboardSummary = {
  cards: {
    users: number;
    students: number;
    news: number;
    announcements: number;
    roles: number;
    organizations: number;
    events: number;
  };
  visibleModules: string[];
};

export const adminDashboardApi = {
  async getDashboardSummary() {
    const response = await client.get<{ success: boolean; data: DashboardSummary }>(
      '/admin/dashboard/summary'
    );
    return response.data.data;
  },
};
