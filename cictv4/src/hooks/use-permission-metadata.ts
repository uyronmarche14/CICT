'use client';

import { useEffect, useState } from 'react';
import { permissionsMetadataAPI } from '@/lib/api/permissions';
import { PermissionMetadataGroup } from '@/types';

export const usePermissionMetadata = () => {
  const [groups, setGroups] = useState<PermissionMetadataGroup[]>(
    permissionsMetadataAPI.getFallback()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMetadata = async () => {
      try {
        const data = await permissionsMetadataAPI.getAll();
        if (!cancelled) {
          setGroups(data);
        }
      } catch (error) {
        console.error('Failed to fetch permission metadata:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMetadata();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    groups,
    isLoading,
  };
};
