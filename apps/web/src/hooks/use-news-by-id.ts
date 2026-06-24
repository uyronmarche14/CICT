import { useQuery } from '@tanstack/react-query';
import { contentFeatureAPI } from '@/features/content/api';

export const useNewsById = (id: string) => {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const response = await contentFeatureAPI.news.detail(id);
      return response.data.news;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
};
