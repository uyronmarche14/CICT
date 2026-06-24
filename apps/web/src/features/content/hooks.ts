import { useQuery } from '@tanstack/react-query';
import { contentFeatureAPI, type AnnouncementListParams, type ContentListParams } from './api';

export const contentQueryKeys = {
  news: (params: ContentListParams) => [
    'content',
    'news',
    params.page,
    params.limit,
    params.status,
    params.ownerType,
    params.organizationId,
    params.search,
  ],
  newsDetail: (id: string) => ['content', 'news', id],
  announcements: (params: AnnouncementListParams) => [
    'content',
    'announcements',
    params.publicOnly ? 'public' : 'admin',
    params.page,
    params.limit,
    params.search,
    params.type,
    params.ownerType,
    params.organizationId,
  ],
};

export const useContentNews = (params: ContentListParams) =>
  useQuery({
    queryKey: contentQueryKeys.news(params),
    queryFn: async () => {
      const response = await contentFeatureAPI.news.list(params);
      return response.data;
    },
    staleTime: 30_000,
  });

export const useContentNewsDetail = (id: string) =>
  useQuery({
    queryKey: contentQueryKeys.newsDetail(id),
    queryFn: async () => {
      const response = await contentFeatureAPI.news.detail(id);
      return response.data.news;
    },
    enabled: !!id,
    staleTime: 30_000,
  });

export const useContentAnnouncements = (params: AnnouncementListParams) =>
  useQuery({
    queryKey: contentQueryKeys.announcements(params),
    queryFn: async () => {
      const response = await contentFeatureAPI.announcements.list(params);
      return {
        success: response.success,
        data: response.data.announcements,
        pagination: response.data.pagination,
      };
    },
    staleTime: params.publicOnly ? 0 : undefined,
  });
