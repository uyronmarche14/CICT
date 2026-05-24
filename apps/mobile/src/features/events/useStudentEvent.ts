import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { eventsApi } from '@/services/api/events';
import { useStudentEvents } from '@/features/events/useStudentEvents';

export function useStudentEvent(eventId: string) {
  const { data: studentEvents } = useStudentEvents();

  const cachedEvent = useMemo(
    () => studentEvents?.find((event) => event._id === eventId) ?? null,
    [eventId, studentEvents]
  );

  const publicEventQuery = useQuery({
    queryKey: queryKeys.publicEvent(eventId),
    queryFn: () => eventsApi.getPublicEvent(eventId),
    enabled: Boolean(eventId),
  });

  return {
    ...publicEventQuery,
    data: publicEventQuery.data
      ? {
          ...publicEventQuery.data,
          registration: cachedEvent?.registration ?? null,
        }
      : cachedEvent,
  };
}

export function useStudentRegistration(eventId: string) {
  return useQuery({
    queryKey: queryKeys.registration(eventId),
    queryFn: () => eventsApi.getRegistration(eventId),
    enabled: Boolean(eventId),
  });
}

export function useStudentQrPayload(eventId: string) {
  return useQuery({
    queryKey: ['student', 'qr', eventId],
    queryFn: () => eventsApi.getQrPayload(eventId),
    enabled: Boolean(eventId),
  });
}
