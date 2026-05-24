import { client } from '@/services/api/client';
import { fetchWithCache } from '@/services/storage/cache';
import type { NewsResponse } from '@/types/api';
import type { News } from '@/types/models';

export const newsApi = {
  async listPublished(page = 1, limit = 20): Promise<{ news: News[]; pagination: NewsResponse['pagination'] }> {
    const fetcher = async () => {
      const response = await client.get<{ success: boolean; data: NewsResponse }>(
        `/news?page=${page}&limit=${limit}&status=published`
      );
      return response.data.data;
    };
    return fetchWithCache(`news_${page}_${limit}`, fetcher);
  },

  async getById(newsId: string): Promise<News> {
    const response = await client.get<{ success: boolean; data: { news: News } }>(
      `/news/${newsId}`
    );
    return response.data.data.news;
  },
};
