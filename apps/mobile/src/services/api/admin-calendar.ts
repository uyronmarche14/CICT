import { client } from '@/services/api/client';

export type CalendarSourceType = 'event' | 'meeting' | 'task' | 'vote' | 'resource';

export type CalendarItem = {
  id: string;
  sourceType: CalendarSourceType;
  sourceId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  allDay?: boolean;
  organizationId?: string;
  organizationName?: string;
  status?: string;
  priority?: string;
  href?: string;
};

export const adminCalendarApi = {
  async getFeed(params?: { startDate?: string; endDate?: string; sourceTypes?: string }) {
    const response = await client.get<{ success: boolean; data: { items: CalendarItem[]; total: number } }>(
      '/calendar/feed',
      { params }
    );
    return response.data.data;
  },
};
