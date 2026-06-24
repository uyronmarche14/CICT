import api from '@/lib/api/axios';
import type { UpdateFeedItem } from '@cict/contracts/types';

export type UpdatesFeedResponse = {
  items: UpdateFeedItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export const updatesFeatureAPI = {
  getFeed: async (query: string) => {
    const { data: res } = await api.get(`/updates?${query}`);
    return res.data as UpdatesFeedResponse;
  },
};
