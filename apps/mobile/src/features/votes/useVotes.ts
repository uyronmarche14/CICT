import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { client } from '@/services/api/client';

export type VotePosition = {
  title: string;
  description?: string;
  maxSelections: number;
};

export type VoteCandidate = {
  name: string;
  position: string;
  photo?: string;
  bio?: string;
};

export type OrgVote = {
  _id: string;
  title: string;
  description?: string;
  positions: VotePosition[];
  candidates: VoteCandidate[];
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  isActive: boolean;
  eligibleMemberTypes?: string[];
  resultsVisibility: 'admins_only' | 'members_after_close' | 'public_after_close';
  allowAdminBallots: boolean;
};

export type BallotSelection = {
  position: string;
  candidateIds: string[];
};

export type VoteResults = {
  vote: OrgVote;
  results: Record<string, Record<string, number>>;
  totalBallots: number;
};

export function useOrgVotes(orgId: string) {
  return useQuery({
    queryKey: queryKeys.orgVotes(orgId),
    queryFn: async () => {
      const res = await client.get<{ success: boolean; data: OrgVote[] }>(
        `/student/organizations/${orgId}/votes`
      );
      return res.data.data;
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });
}

export function useVoteDetail(orgId: string, voteId: string) {
  return useQuery({
    queryKey: queryKeys.orgVote(orgId, voteId),
    queryFn: async () => {
      const res = await client.get<{ success: boolean; data: OrgVote }>(
        `/student/organizations/${orgId}/votes/${voteId}`
      );
      return res.data.data;
    },
    enabled: !!orgId && !!voteId,
    staleTime: 30_000,
  });
}

export function useCastBallot(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ voteId, selections }: { voteId: string; selections: BallotSelection[] }) => {
      const res = await client.post<{ success: boolean; data: unknown }>(
        `/student/organizations/${orgId}/votes/${voteId}/cast`,
        { selections }
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgVotes(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orgVote(orgId, variables.voteId) });
    },
  });
}

export function useVoteResults(orgId: string, voteId: string) {
  return useQuery({
    queryKey: queryKeys.orgVoteResults(orgId, voteId),
    queryFn: async () => {
      const res = await client.get<{ success: boolean; data: VoteResults }>(
        `/student/organizations/${orgId}/votes/${voteId}/results`
      );
      return res.data.data;
    },
    enabled: !!orgId && !!voteId,
    staleTime: 30_000,
  });
}
