import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import type { Announcement, ContentOwnerType } from '@/types';

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
      const response = await api.get<AnnouncementListResponse>(
        publicOnly ? '/public/announcements' : '/announcements',
        {
          params: {
            page,
            limit,
            search,
            type,
            ownerType,
            organizationId,
            isActive: publicOnly ? undefined : true,
          },
        },
      );

      return {
        success: response.data.success,
        data: response.data.data.announcements,
        pagination: response.data.data.pagination,
      };
    },
    staleTime: publicOnly ? 0 : undefined,
  });
}
