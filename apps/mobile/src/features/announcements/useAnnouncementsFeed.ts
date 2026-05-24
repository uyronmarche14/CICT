import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { announcementsApi } from '@/services/api/announcements';

export function useAnnouncementsFeed(limit = 4) {
  return useQuery({
    queryKey: [...queryKeys.updates, limit],
    queryFn: () => announcementsApi.listUpdates(limit),
  });
}
