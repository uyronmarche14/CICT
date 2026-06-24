import { organizationService } from '../services/organizationService';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const useOrganizations = () => {
  const { data: organizations = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.organizations.all,
    queryFn: () => organizationService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    organizations,
    loading: isLoading,
    error: error ? 'Failed to fetch organizations' : null,
    refresh: refetch,
  };
};

export const useOrganization = (id: string | null) => {
  const { data: organization = null, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.organizations.detail(id ?? ''),
    queryFn: () => organizationService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    organization,
    loading: isLoading,
    error: error ? 'Failed to fetch organization' : null,
    refresh: refetch,
  };
};

export const useAdminOrganizations = () => {
  const { data: organizations = [], isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.organizations.all, 'admin'],
    queryFn: () => organizationService.getAdminAll(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    organizations,
    loading: isLoading,
    error: error ? 'Failed to fetch organizations' : null,
    refresh: refetch,
  };
};

export const useAdminOrganization = (id: string | null) => {
  const { data: organization = null, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.organizations.detail(id ?? ''), 'admin'],
    queryFn: () => organizationService.getAdminById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    organization,
    loading: isLoading,
    error: error ? 'Failed to fetch organization' : null,
    refresh: refetch,
  };
};
