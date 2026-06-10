'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';

export interface OrgFileRecord {
  _id: string;
  organizationId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  visibility: string;
  createdAt: string;
}

export interface OrgQuotaData {
  quota: {
    storageLimitMb: number;
    monthlyUploadLimitMb: number;
    usedStorageBytes: number;
    usedUploadBytesThisMonth: number;
  };
  usagePercent: number;
  monthlyPercent: number;
}

export function useOrgFiles(orgId: string, mimeType?: string) {
  const params = new URLSearchParams();
  if (mimeType) params.set('mimeType', mimeType);

  return useQuery({
    queryKey: ['org-files', orgId, mimeType],
    queryFn: async () => {
      const { data: res } = await api.get(`/organizations/${orgId}/files?${params}`);
      return res.data as { files: OrgFileRecord[]; total: number };
    },
    staleTime: 30_000,
    enabled: !!orgId,
  });
}

export function useOrgQuota(orgId: string) {
  return useQuery({
    queryKey: ['org-quota', orgId],
    queryFn: async () => {
      const { data: res } = await api.get(`/organizations/${orgId}/files/quota`);
      return res.data.data as OrgQuotaData;
    },
    staleTime: 30_000,
    enabled: !!orgId,
  });
}
