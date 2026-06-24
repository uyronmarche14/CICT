
import { useQuery } from '@tanstack/react-query';
import { ContentOwnerType, News, NewsStatus } from '@/types';
import { contentFeatureAPI } from '@/features/content/api';

interface NewsResponse {
  success: boolean;
  data: {
    news: News[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface UseNewsOptions {
  ownerType?: ContentOwnerType;
  organizationId?: string;
  search?: string;
}

export const useNews = (
  page = 1,
  limit = 10,
  status?: NewsStatus,
  options?: UseNewsOptions
) => {
  return useQuery({
    queryKey: ['news', page, limit, status, options?.ownerType, options?.organizationId, options?.search],
    queryFn: async () => {
      const response = await contentFeatureAPI.news.list({
        page,
        limit,
        status,
        ownerType: options?.ownerType,
        organizationId: options?.organizationId,
        search: options?.search,
      }) as NewsResponse;
      return response.data;
    },
    staleTime: 30_000,
  });
};

export const useLatestNews = () => {
  return useQuery({
    queryKey: ['latest-news'],
    queryFn: async () => {
      const response = await contentFeatureAPI.news.list({
        page: 1,
        limit: 1,
        status: NewsStatus.PUBLISHED,
      }) as NewsResponse;
      return response.data.news[0];
    },
    staleTime: 30_000,
  });
};
