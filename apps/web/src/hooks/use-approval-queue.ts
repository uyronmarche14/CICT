import { useQuery } from '@tanstack/react-query';
import { approvalAPI, type ApprovalQueueParams } from '@/lib/api/approval';

export function useApprovalQueue(params?: ApprovalQueueParams) {
  return useQuery({
    queryKey: ['admin', 'approvals', 'queue', params],
    queryFn: () => approvalAPI.getPendingQueue(params),
    staleTime: 30_000,
  });
}

export function useApprovalStats() {
  return useQuery({
    queryKey: ['admin', 'approvals', 'stats'],
    queryFn: () => approvalAPI.getStats(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useApprovalHistory(contentType: string, contentId: string) {
  return useQuery({
    queryKey: ['admin', 'approvals', 'history', contentType, contentId],
    queryFn: () => approvalAPI.getHistory(contentType, contentId),
    enabled: !!contentType && !!contentId,
    staleTime: 60_000,
  });
}
