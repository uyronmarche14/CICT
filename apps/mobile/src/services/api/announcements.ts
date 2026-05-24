import { client } from '@/services/api/client';
import type { AnnouncementsResponse, HomeUpdatesResponse, NewsResponse } from '@/types/api';
import type { Announcement, HomeUpdate, News } from '@/types/models';
import { stripHtml } from '@/utils/format';

const normalizeAnnouncement = (item: Announcement): HomeUpdate => ({
  id: item._id,
  kind: 'announcement',
  title: item.title,
  summary: stripHtml(item.content || item.bodyHtml) || 'Official CICT announcement.',
  publishedAt: item.publishedAt || item.createdAt,
  imageUrl: item.imageUrl,
});

const normalizeNews = (item: News): HomeUpdate => ({
  id: item._id,
  kind: 'news',
  title: item.title,
  summary: item.excerpt || stripHtml(item.bodyHtml),
  publishedAt: item.publishedAt || item.createdAt,
  imageUrl: item.imageUrl,
});

export const announcementsApi = {
  async listUpdates(limit = 4): Promise<HomeUpdatesResponse> {
    const [announcementsResponse, newsResponse] = await Promise.all([
      client.get<{ success: boolean; data: AnnouncementsResponse }>(
        `/public/announcements?page=1&limit=${limit}`
      ),
      client.get<{ success: boolean; data: NewsResponse }>(
        `/news?page=1&limit=${limit}&status=published`
      ),
    ]);

    const items = [
      ...announcementsResponse.data.data.announcements.map(normalizeAnnouncement),
      ...newsResponse.data.data.news.map(normalizeNews),
    ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
      items: items.slice(0, limit),
    };
  },
};
