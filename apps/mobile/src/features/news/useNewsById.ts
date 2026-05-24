import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { newsApi } from '@/services/api/news';

export function useNewsById(newsId: string) {
  return useQuery({
    queryKey: queryKeys.newsDetail(newsId),
    queryFn: () => newsApi.getById(newsId),
    enabled: !!newsId,
  });
}
