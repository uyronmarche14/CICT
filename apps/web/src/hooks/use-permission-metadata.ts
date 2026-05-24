'use client';

import { useQuery } from '@tanstack/react-query';
import { permissionsMetadataAPI } from '@/lib/api/permissions';
import { queryKeys } from '@/lib/query-keys';

export const usePermissionMetadata = () => {
  const { data: groups, isLoading } = useQuery({
    queryKey: queryKeys.permissionsMetadata.all,
    queryFn: () => permissionsMetadataAPI.getAll(),
    staleTime: Infinity,
  });

  return {
    groups: groups ?? permissionsMetadataAPI.getFallback(),
    isLoading,
  };
};
