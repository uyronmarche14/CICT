import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { membershipApi } from '@/services/api/memberships';
import { client } from '@/services/api/client';

export function useMyMemberships() {
  return useQuery({
    queryKey: queryKeys.memberships,
    queryFn: () => membershipApi.getMyMemberships(),
    staleTime: 30_000,
  });
}

export function useMembershipStatus(orgId: string) {
  return useQuery({
    queryKey: queryKeys.membershipStatus(orgId),
    queryFn: async () => {
      const res = await client.get<{ success: boolean; data: { status: string } }>(
        `/student/organizations/${orgId}/membership-status`
      );
      return res.data.data.status;
    },
    enabled: !!orgId,
    staleTime: 10_000,
  });
}

export function useApplyToOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => membershipApi.applyToOrg(orgId),
    onSuccess: (_membership, orgId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships });
      queryClient.invalidateQueries({ queryKey: queryKeys.membershipStatus(orgId) });
    },
  });
}

export function useResignFromOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId }: { membershipId: string; orgId?: string }) =>
      membershipApi.resignFromOrg(membershipId),
    onSuccess: (_membership, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships });
      if (variables.orgId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.membershipStatus(variables.orgId) });
      }
    },
  });
}
