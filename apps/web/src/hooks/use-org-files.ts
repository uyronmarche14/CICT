'use client';

import { useQuery } from '@tanstack/react-query';
import {
  organizationsAdminAPI,
  type OrgFileRecord,
  type OrgQuotaData,
} from '@/features/organizations-admin/api';

export type { OrgFileRecord, OrgQuotaData };

export function useOrgFiles(orgId: string, mimeType?: string) {
  return useQuery({
    queryKey: ['org-files', orgId, mimeType],
    queryFn: () => organizationsAdminAPI.getFiles(orgId, mimeType),
    staleTime: 30_000,
    enabled: !!orgId,
  });
}

export function useOrgQuota(orgId: string) {
  return useQuery({
    queryKey: ['org-quota', orgId],
    queryFn: () => organizationsAdminAPI.getQuota(orgId),
    staleTime: 30_000,
    enabled: !!orgId,
  });
}
