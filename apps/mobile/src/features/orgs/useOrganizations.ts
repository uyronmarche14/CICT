import { useQuery } from '@tanstack/react-query';

import { client } from '@/services/api/client';
import { fetchWithCache } from '@/services/storage/cache';
import type { Organization } from '@/types/models';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const fetcher = async () => {
        const res = await client.get<{ success: boolean; data: Organization[] }>('/organizations');
        return res.data.data;
      };
      return fetchWithCache('organizations', fetcher);
    },
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const fetcher = async () => {
        const res = await client.get<{ success: boolean; data: Organization }>(`/organizations/${id}`);
        return res.data.data;
      };
      return fetchWithCache(`organization_${id}`, fetcher);
    },
    enabled: !!id,
  });
}
