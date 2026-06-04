'use client';

import { useQuery } from '@tanstack/react-query';
import { lookupsAPI } from '@/lib/api/lookups';

export const useReferenceData = (groupKey: string) => {
  const query = useQuery({
    queryKey: ['lookup', 'reference-data'],
    queryFn: lookupsAPI.getReferenceData,
    staleTime: 60_000,
  });

  const group = query.data?.[groupKey];

  return {
    ...query,
    group,
    items: group?.items ?? [],
    suggested: group?.suggested ?? [],
  };
};
