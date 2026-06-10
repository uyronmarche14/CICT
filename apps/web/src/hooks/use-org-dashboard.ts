'use client';

import { useQueries } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api/org-analytics';

export function useOrgDashboard(orgId: string) {
  const results = useQueries({
    queries: [
      {
        queryKey: ['org-analytics', orgId, 'overview'],
        queryFn: () => analyticsAPI.getOverview(orgId),
        staleTime: 60_000,
      },
      {
        queryKey: ['org-analytics', orgId, 'tasks'],
        queryFn: () => analyticsAPI.getTasks(orgId),
        staleTime: 60_000,
      },
      {
        queryKey: ['org-analytics', orgId, 'events'],
        queryFn: () => analyticsAPI.getEvents(orgId),
        staleTime: 60_000,
      },
      {
        queryKey: ['org-analytics', orgId, 'financial'],
        queryFn: () => analyticsAPI.getFinancial(orgId),
        staleTime: 60_000,
      },
    ],
  });

  const [overview, tasks, events, financial] = results;
  const isLoading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error ?? null;

  return {
    overview: overview.data ?? null,
    tasks: tasks.data ?? null,
    events: events.data ?? null,
    financial: financial.data ?? null,
    isLoading,
    error,
  };
}
