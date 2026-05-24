import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import type { Announcement } from '@/types';

interface AnnouncementDetailResponse {
  success: boolean;
  data: {
    announcement: Announcement;
  };
}

export function useGetAnnouncementById(id: string) {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const response = await api.get<AnnouncementDetailResponse>(`/public/announcements/${id}`);
      return response.data.data.announcement;
    },
    enabled: !!id,
    staleTime: 0,
  });
}
