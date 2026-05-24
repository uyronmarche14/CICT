import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { publicAnnouncementsApi } from '@/services/api/public-announcements';

export function useAnnouncementsList(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.announcements, page, limit],
    queryFn: () => publicAnnouncementsApi.listPublished(page, limit),
  });
}
