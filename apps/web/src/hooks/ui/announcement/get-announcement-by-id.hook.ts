import { useQuery } from '@tanstack/react-query';
import { contentFeatureAPI } from '@/features/content/api';

export function useGetAnnouncementById(id: string) {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const response = await contentFeatureAPI.announcements.publicDetail(id);
      return response.data.announcement;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
