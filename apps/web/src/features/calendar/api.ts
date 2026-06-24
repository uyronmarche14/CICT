import api from '@/lib/api/axios';
import type { CalendarItem } from '@cict/contracts/types';

export const calendarFeatureAPI = {
  getAdminFeed: async (params: { startDate: string; endDate: string; limit?: number }) => {
    const { data: res } = await api.get('/calendar/feed', { params });
    return (res.data as { items: CalendarItem[]; total: number }).items;
  },
  getOrganizationFeed: async (
    orgId: string,
    params: { startDate: string; endDate: string }
  ) => {
    const { data: res } = await api.get(`/organizations/${orgId}/calendar`, { params });
    return (res.data.data?.items ?? []) as CalendarItem[];
  },
};
