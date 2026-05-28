
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { ContentOwnerType, News, NewsStatus } from '@/types';

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
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) {
        params.append('status', status);
      }
      if (options?.ownerType) {
        params.append('ownerType', options.ownerType);
      }
      if (options?.organizationId) {
        params.append('organizationId', options.organizationId);
      }
      if (options?.search) {
        params.append('search', options.search);
      }
      
      const { data } = await api.get<NewsResponse>(`/news?${params.toString()}`);
      return data.data;
    },
    staleTime: 30_000,
  });
};

export const useLatestNews = () => {
  return useQuery({
    queryKey: ['latest-news'],
    queryFn: async () => {
      const { data } = await api.get<NewsResponse>('/news?page=1&limit=1&status=published');
      return data.data.news[0];
    },
    staleTime: 30_000,
  });
};
