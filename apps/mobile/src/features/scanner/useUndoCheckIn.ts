import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminEventsApi } from '@/services/api/admin-events';

export function useUndoCheckIn(eventId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registrationId: string) => {
      if (!eventId) {
        throw new Error('Event is required before undoing a check-in.');
      }
      return adminEventsApi.undoCheckIn(eventId, registrationId);
    },
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.adminAttendanceLogs(eventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEventRegistrations(eventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEvent(eventId) });
      }
    },
  });
}
