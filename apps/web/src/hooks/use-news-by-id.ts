import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { News } from '@/types';

interface NewsDetailResponse {
  success: boolean;
  data: {
    news: News;
  };
}

export const useNewsById = (id: string) => {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data } = await api.get<NewsDetailResponse>(`/news/${id}`);
      return data.data.news;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
};
