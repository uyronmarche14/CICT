import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { newsApi } from '@/services/api/news';

export function useNewsList(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.news, page, limit],
    queryFn: () => newsApi.listPublished(page, limit),
  });
}
