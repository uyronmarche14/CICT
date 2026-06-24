import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminContentApi, type ContentItem } from '@/services/api/admin-content';
import { useApprovalStats } from '@/features/approvals/useApprovals';

export function useContentList(filters?: { type?: string; status?: string }) {
  const newsQuery = useQuery({
    queryKey: [...queryKeys.adminContent, 'news', filters],
    queryFn: () => adminContentApi.listNews({ status: filters?.status !== 'all' ? filters?.status : undefined }),
  });

  const annQuery = useQuery({
    queryKey: [...queryKeys.adminContent, 'announcements', filters],
    queryFn: () => adminContentApi.listAnnouncements({ status: filters?.status !== 'all' ? filters?.status : undefined }),
  });

  const items = useMemo(() => {
    const news: ContentItem[] = (newsQuery.data?.news ?? []).map((n) => ({ ...n, type: 'news' as const }));
    const announcements: ContentItem[] = (annQuery.data?.announcements ?? []).map((a) => ({ ...a, type: 'announcement' as const }));
    let all = [...news, ...announcements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filters?.type && filters.type !== 'all') {
      all = all.filter((i) => i.type === filters.type);
    }
    return all;
  }, [newsQuery.data, annQuery.data, filters]);

  return {
    items,
    isLoading: newsQuery.isPending || annQuery.isPending,
    isError: newsQuery.isError || annQuery.isError,
    refetch: () => { newsQuery.refetch(); annQuery.refetch(); },
    isRefetching: newsQuery.isRefetching || annQuery.isRefetching,
  };
}

export function usePublishContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: 'news' | 'announcement'; id: string }) =>
      type === 'news' ? adminContentApi.publishNews(id) : adminContentApi.publishAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminContent });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminApprovalStats });
    },
  });
}

export function useArchiveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: 'news' | 'announcement'; id: string }) =>
      type === 'news' ? adminContentApi.archiveNews(id) : adminContentApi.archiveAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminContent });
    },
  });
}
