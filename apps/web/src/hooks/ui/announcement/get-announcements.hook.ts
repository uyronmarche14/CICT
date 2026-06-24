import { useQuery } from '@tanstack/react-query';
import type { Announcement, ContentOwnerType } from '@/types';
import { contentFeatureAPI } from '@/features/content/api';

interface AnnouncementListResponse {
  success: boolean;
  data: {
    announcements: Announcement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export function useGetAnnouncements(
  page = 1,
  limit = 10,
  search?: string,
  type?: string,
  publicOnly = false,
  ownerType?: ContentOwnerType,
  organizationId?: string
) {
  return useQuery({
    queryKey: [
      'announcements',
      publicOnly ? 'public' : 'admin',
      page,
      limit,
      search,
      type,
      ownerType,
      organizationId,
    ],
    queryFn: async () => {
      const response = await contentFeatureAPI.announcements.list({
        page,
        limit,
        search,
        type,
        ownerType,
        organizationId,
        publicOnly,
      }) as AnnouncementListResponse;

      return {
        success: response.success,
        data: response.data.announcements,
        pagination: response.data.pagination,
      };
    },
    staleTime: publicOnly ? 0 : undefined,
  });
}
