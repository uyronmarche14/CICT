import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { publicAnnouncementsApi } from '@/services/api/public-announcements';

export function useAnnouncementById(announcementId: string) {
  return useQuery({
    queryKey: queryKeys.announcementDetail(announcementId),
    queryFn: () => publicAnnouncementsApi.getById(announcementId),
    enabled: !!announcementId,
  });
}
