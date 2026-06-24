import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminContentAPI } from './api';
import type { ContentListFilters } from './types';

export const adminContentQueryKeys = {
  news: (filters: ContentListFilters) => [
    'admin',
    'news',
    filters.page,
    filters.search,
    filters.status,
    filters.category,
    filters.featured,
    filters.ownerType,
    filters.organizationId,
  ],
  announcements: (filters: ContentListFilters) => [
    'admin',
    'announcements',
    filters.page,
    filters.search,
    filters.status,
    filters.subtype,
    filters.ctaFilter,
    filters.ownerType,
    filters.organizationId,
  ],
};

export const useAdminNewsList = (filters: ContentListFilters) =>
  useQuery({
    queryKey: adminContentQueryKeys.news(filters),
    queryFn: () => adminContentAPI.news.list(filters),
    placeholderData: keepPreviousData,
  });

export const useAdminAnnouncementsList = (filters: ContentListFilters) =>
  useQuery({
    queryKey: adminContentQueryKeys.announcements(filters),
    queryFn: () => adminContentAPI.announcements.list(filters),
    placeholderData: keepPreviousData,
  });
