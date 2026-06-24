import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminApprovalsApi } from '@/services/api/admin-approvals';

export function usePendingApprovals(params?: { page?: number; type?: string }) {
  return useQuery({
    queryKey: [...queryKeys.adminApprovals, params],
    queryFn: () => adminApprovalsApi.getPendingQueue(params),
  });
}

export function useApprovalStats() {
  return useQuery({
    queryKey: queryKeys.adminApprovalStats,
    queryFn: () => adminApprovalsApi.getApprovalStats(),
  });
}

export function useApproveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentType, contentId, comment }: { contentType: string; contentId: string; comment?: string }) =>
      adminApprovalsApi.approveContent(contentType, contentId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovals });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovalStats });
    },
  });
}

export function useRejectContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentType, contentId, reason, comment }: { contentType: string; contentId: string; reason: string; comment?: string }) =>
      adminApprovalsApi.rejectContent(contentType, contentId, reason, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovals });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovalStats });
    },
  });
}

export function usePendingMemberships() {
  return useQuery({
    queryKey: [...queryKeys.adminApprovals, 'memberships'],
    queryFn: () => adminApprovalsApi.getPendingMemberships(),
  });
}

export function useApproveMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, membershipId }: { orgId: string; membershipId: string }) =>
      adminApprovalsApi.approveMembership(orgId, membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovals });
    },
  });
}

export function useRejectMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, membershipId }: { orgId: string; membershipId: string }) =>
      adminApprovalsApi.rejectMembership(orgId, membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovals });
    },
  });
}
