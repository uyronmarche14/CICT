'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api/org-analytics';

export function useOrgDashboard(orgId: string) {
  const dashboard = useQuery({
    queryKey: ['org-analytics', orgId, 'dashboard'],
    queryFn: () => analyticsAPI.getDashboard(orgId),
    staleTime: 60_000,
    enabled: Boolean(orgId),
  });

  return {
    dashboard: dashboard.data ?? null,
    isLoading: dashboard.isLoading,
    error: dashboard.error ?? null,
  };
}
