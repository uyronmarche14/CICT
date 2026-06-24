import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminEventsApi, type AdminEvent } from '@/services/api/admin-events';

export type { AdminEvent };

export function useAdminEvents() {
  return useQuery({
    queryKey: queryKeys.adminEvents,
    queryFn: () => adminEventsApi.listEvents(),
  });
}

export function useAdminEvent(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.adminEvent(eventId ?? ''),
    queryFn: () => adminEventsApi.getEvent(eventId ?? ''),
    enabled: Boolean(eventId),
  });
}

export function useEventRegistrations(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.adminEventRegistrations(eventId ?? ''),
    queryFn: () => adminEventsApi.getRegistrations(eventId ?? ''),
    enabled: Boolean(eventId),
  });
}

export function useSearchRegistrations(eventId?: string, q?: string) {
  return useQuery({
    queryKey: queryKeys.adminEventRegistrationsSearch(eventId ?? '', q ?? ''),
    queryFn: () => adminEventsApi.searchRegistrations(eventId ?? '', q ?? ''),
    enabled: Boolean(eventId) && Boolean(q) && q!.length >= 2,
  });
}

export function useCreateRegistration(eventId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentNumber: string) => {
      if (!eventId) throw new Error('Event ID is required');
      return adminEventsApi.createRegistration(eventId, studentNumber);
    },
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEventRegistrations(eventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEvent(eventId) });
      }
    },
  });
}

export function useCancelRegistration(eventId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registrationId: string) => {
      if (!eventId) throw new Error('Event ID is required');
      return adminEventsApi.cancelRegistration(eventId, registrationId);
    },
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEventRegistrations(eventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEvent(eventId) });
      }
    },
  });
}

export function useUpdateRegistrationStatus(eventId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registrationId, ...update }: { registrationId: string; status: string; reason?: string }) => {
      if (!eventId) throw new Error('Event ID is required');
      return adminEventsApi.updateRegistrationStatus(eventId, registrationId, update);
    },
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEventRegistrations(eventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.adminEvent(eventId) });
      }
    },
  });
}
