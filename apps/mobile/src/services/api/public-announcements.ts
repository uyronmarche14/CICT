import { client } from '@/services/api/client';
import { fetchWithCache } from '@/services/storage/cache';
import type { AnnouncementsResponse } from '@/types/api';
import type { Announcement } from '@/types/models';

export const publicAnnouncementsApi = {
  async listPublished(page = 1, limit = 20): Promise<{ announcements: Announcement[]; pagination: AnnouncementsResponse['pagination'] }> {
    const fetcher = async () => {
      const response = await client.get<{ success: boolean; data: AnnouncementsResponse }>(
        `/public/announcements?page=${page}&limit=${limit}`
      );
      return response.data.data;
    };
    return fetchWithCache(`announcements_${page}_${limit}`, fetcher);
  },

  async getById(announcementId: string): Promise<Announcement> {
    const response = await client.get<{ success: boolean; data: { announcement: Announcement } }>(
      `/public/announcements/${announcementId}`
    );
    return response.data.data.announcement;
  },
};
