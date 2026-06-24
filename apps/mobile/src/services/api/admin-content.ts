import { client } from '@/services/api/client';

export type ContentItem = {
  _id: string;
  type: 'news' | 'announcement';
  title: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  author?: { firstName: string; lastName: string };
  priority?: string;
};

export const adminContentApi = {
  async listNews(params?: { status?: string; page?: number; limit?: number }) {
    const response = await client.get<{
      success: boolean;
      data: { news: ContentItem[]; pagination: { page: number; limit: number; total: number; pages: number } };
    }>('/news', { params });
    return response.data.data;
  },

  async listAnnouncements(params?: { status?: string; page?: number; limit?: number }) {
    const response = await client.get<{
      success: boolean;
      data: { announcements: ContentItem[]; pagination: { page: number; limit: number; total: number; pages: number } };
    }>('/announcements', { params });
    return response.data.data;
  },

  async publishNews(id: string) {
    const response = await client.patch(`/news/${id}/publish`);
    return response.data;
  },

  async archiveNews(id: string) {
    const response = await client.patch(`/news/${id}/archive`);
    return response.data;
  },

  async publishAnnouncement(id: string) {
    const response = await client.patch(`/announcements/${id}/publish`);
    return response.data;
  },

  async archiveAnnouncement(id: string) {
    const response = await client.patch(`/announcements/${id}/archive`);
    return response.data;
  },
};
