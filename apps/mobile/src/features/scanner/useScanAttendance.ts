import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminEventsApi, type ScanPayload } from '@/services/api/admin-events';

export function useScanAttendance(eventId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScanPayload) => {
      if (!eventId) {
        throw new Error('Event is required before scanning attendance.');
      }
      return adminEventsApi.scanAttendance(eventId, payload);
    },
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.adminAttendanceLogs(eventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEvent(eventId) });
      }
    },
  });
}

