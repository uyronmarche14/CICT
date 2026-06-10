import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client } from '@/services/api/client';

export function useOrgVotes(orgId: string) {
  return useQuery({
    queryKey: ['org-votes', orgId],
    queryFn: async () => {
      const res = await client.get(`/student/organizations/${orgId}/votes`);
      return res.data.data as any[];
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });
}

export function useVoteDetail(orgId: string, voteId: string) {
  return useQuery({
    queryKey: ['org-vote', voteId],
    queryFn: async () => {
      const res = await client.get(`/student/organizations/${orgId}/votes/${voteId}`);
      return res.data.data as any;
    },
    enabled: !!orgId && !!voteId,
    staleTime: 30_000,
  });
}

export function useCastBallot(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ voteId, selections }: { voteId: string; selections: Array<{ position: string; candidateIds: string[] }> }) => {
      const res = await client.post(`/student/organizations/${orgId}/votes/${voteId}/cast`, { selections });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-votes'] });
    },
  });
}

export function useVoteResults(orgId: string, voteId: string) {
  return useQuery({
    queryKey: ['org-vote-results', voteId],
    queryFn: async () => {
      const res = await client.get(`/student/organizations/${orgId}/votes/${voteId}/results`);
      return res.data.data as { vote: any; results: Record<string, Record<string, number>>; totalBallots: number };
    },
    enabled: !!orgId && !!voteId,
    staleTime: 30_000,
  });
}
