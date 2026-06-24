import { announcementAPI } from '@/lib/api/announcements';
import { eventAPI } from '@/lib/api/event';
import { newsAPI } from '@/lib/api/news';
import type { Announcement, News } from '@/types';
import type {
  AdminContentKind,
  ContentListFilters,
  ContentWorkflowAction,
} from './types';

const cleanListParams = (filters: ContentListFilters) => ({
  page: filters.page,
  limit: filters.limit,
  search: filters.search || undefined,
  status: filters.status === 'all' ? undefined : filters.status,
  ownerType: filters.ownerType === 'all' ? undefined : filters.ownerType,
  organizationId: filters.organizationId === 'all' ? undefined : filters.organizationId,
  category: filters.category === 'all' ? undefined : filters.category,
  featured:
    filters.featured === 'all' || !filters.featured
      ? undefined
      : filters.featured === 'featured'
        ? 'true'
        : 'false',
  subtype: filters.subtype === 'all' ? undefined : filters.subtype,
  ctaFilter: filters.ctaFilter === 'all' ? undefined : filters.ctaFilter,
});

export const adminContentAPI = {
  news: {
    list: async (filters: ContentListFilters) => {
      const response = await newsAPI.getAll(cleanListParams(filters));
      return response.data as { news: News[]; pagination: { pages: number } };
    },
    save: (payload: Record<string, unknown>, id?: string) =>
      id ? newsAPI.update(id, payload) : newsAPI.create(payload),
    delete: newsAPI.delete,
    workflow: (id: string, action: Exclude<ContentWorkflowAction, 'delete'>, reason?: string) => {
      if (action === 'reject') {
        return newsAPI.reject(id, { reason: reason ?? '' });
      }
      return newsAPI[action](id);
    },
  },
  announcements: {
    list: async (filters: ContentListFilters) => {
      const response = await announcementAPI.getAll(cleanListParams(filters));
      return response.data as { announcements: Announcement[]; pagination: { pages: number } };
    },
    save: (payload: Record<string, unknown>, id?: string) =>
      id ? announcementAPI.update(id, payload) : announcementAPI.create(payload),
    delete: announcementAPI.delete,
    workflow: (id: string, action: Exclude<ContentWorkflowAction, 'delete'>, reason?: string) => {
      if (action === 'reject') {
        return announcementAPI.reject(id, { reason: reason ?? '' });
      }
      return announcementAPI[action](id);
    },
  },
  events: {
    workflow: (id: string, action: Exclude<ContentWorkflowAction, 'delete'>, reason?: string) => {
      if (action === 'reject') {
        return eventAPI.reject(id, { reason: reason ?? '' });
      }
      if (action === 'archive') {
        return eventAPI.cancel(id);
      }
      return eventAPI[action](id);
    },
  },
  workflow: (
    kind: AdminContentKind,
    id: string,
    action: Exclude<ContentWorkflowAction, 'delete'>,
    reason?: string
  ) => {
    if (kind === 'announcement') {
      return adminContentAPI.announcements.workflow(id, action, reason);
    }
    if (kind === 'event') {
      return adminContentAPI.events.workflow(id, action, reason);
    }
    return adminContentAPI.news.workflow(id, action, reason);
  },
};
