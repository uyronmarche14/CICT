import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { membershipApi } from '@/services/api/memberships';
import { client } from '@/services/api/client';

export function useMyMemberships() {
  return useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => membershipApi.getMyMemberships(),
    staleTime: 30_000,
  });
}

export function useMembershipStatus(orgId: string) {
  return useQuery({
    queryKey: ['membership-status', orgId],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
    },
  });
}

export function useResignFromOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => membershipApi.resignFromOrg(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
    },
  });
}
