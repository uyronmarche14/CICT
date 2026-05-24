import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { eventsApi } from '@/services/api/events';
import { fetchWithCache } from '@/services/storage/cache';

export function useStudentEvents() {
  return useQuery({
    queryKey: queryKeys.studentEvents,
    queryFn: () => fetchWithCache('events', eventsApi.getEligibleEvents),
  });
}

export function useRegisterForEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.register(eventId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.studentEvents }),
        queryClient.invalidateQueries({ queryKey: queryKeys.registration(eventId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.registrations }),
      ]);
    },
  });
}

export function useCancelEventRegistration(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.cancelRegistration(eventId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.studentEvents }),
        queryClient.invalidateQueries({ queryKey: queryKeys.registration(eventId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.registrations }),
      ]);
    },
  });
}
