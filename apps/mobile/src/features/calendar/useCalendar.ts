import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminCalendarApi, type CalendarItem } from '@/services/api/admin-calendar';

export function useCalendarFeed(startDate: string, endDate: string, sourceTypes?: string) {
  return useQuery({
    queryKey: [...queryKeys.adminCalendar, startDate, endDate, sourceTypes],
    queryFn: () => adminCalendarApi.getFeed({ startDate, endDate, sourceTypes }),
    staleTime: 60_000,
  });
}

export function useUpcomingEvents() {
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: [...queryKeys.adminCalendar, 'upcoming'],
    queryFn: () => adminCalendarApi.getFeed({ startDate, endDate }),
    staleTime: 60_000,
  });
}
