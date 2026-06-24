import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminOrganizationsApi } from '@/services/api/admin-organizations';

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.adminOrganizations,
    queryFn: () => adminOrganizationsApi.list(),
  });
}

export function useOrganizationDetail(id?: string) {
  return useQuery({
    queryKey: queryKeys.adminOrganization(id ?? ''),
    queryFn: () => adminOrganizationsApi.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useOrgTasks(orgId?: string) {
  return useQuery({
    queryKey: queryKeys.adminOrgTasks(orgId ?? ''),
    queryFn: () => adminOrganizationsApi.getTasks(orgId ?? ''),
    enabled: Boolean(orgId),
  });
}

export function useOrgMeetings(orgId?: string) {
  return useQuery({
    queryKey: queryKeys.adminOrgMeetings(orgId ?? ''),
    queryFn: () => adminOrganizationsApi.getMeetings(orgId ?? ''),
    enabled: Boolean(orgId),
  });
}

export function useOrgVotes(orgId?: string) {
  return useQuery({
    queryKey: queryKeys.adminOrgVotes(orgId ?? ''),
    queryFn: () => adminOrganizationsApi.getVotes(orgId ?? ''),
    enabled: Boolean(orgId),
  });
}
