import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminEventsApi } from '@/services/api/admin-events';

export function useRecentScans(eventId?: string, limit = 20) {
  return useQuery({
    queryKey: eventId ? queryKeys.adminAttendanceLogs(eventId) : ['admin', 'attendance', 'missing'],
    queryFn: () => adminEventsApi.getAttendanceLogs(eventId ?? '', { limit }),
    enabled: Boolean(eventId),
  });
}

