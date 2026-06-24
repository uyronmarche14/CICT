import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/constants/queryKeys';
import { eventsApi } from '@/services/api/events';
import { newsApi } from '@/services/api/news';
import { publicAnnouncementsApi } from '@/services/api/public-announcements';
import { useOrganizations } from '@/features/orgs/useOrganizations';
import type { AnnouncementPriority, StudentEvent, UpdateItem, UpdateItemKind } from '@/types/models';
import { stripHtml } from '@/utils/format';

type UpdatesHubFilters = {
  category: UpdateItemKind | 'all';
  search: string;
  scope: 'all' | 'official' | 'community';
};

function normalizeNews(item: { _id: string; title: string; excerpt: string; bodyHtml: string; publishedAt?: string; createdAt: string; imageUrl?: string }): UpdateItem {
  return {
    id: item._id,
    kind: 'news',
    title: item.title,
    summary: item.excerpt || stripHtml(item.bodyHtml),
    publishedAt: item.publishedAt || item.createdAt,
    imageUrl: item.imageUrl,
  };
}

function normalizeAnnouncement(item: { _id: string; title: string; content?: string; bodyHtml: string; priority: AnnouncementPriority; publishedAt?: string; createdAt: string; imageUrl?: string }): UpdateItem {
  return {
    id: item._id,
    kind: 'announcement',
    title: item.title,
    summary: stripHtml(item.content || item.bodyHtml),
    publishedAt: item.publishedAt || item.createdAt,
    imageUrl: item.imageUrl,
    priority: item.priority,
  };
}

function normalizeEvent(event: StudentEvent): UpdateItem {
  return {
    id: event._id,
    kind: 'event',
    title: event.title,
    summary: event.excerpt || stripHtml(event.bodyHtml),
    publishedAt: event.startDate,
    imageUrl: event.coverImage?.imageUrl || event.imageUrl,
    eventDate: event.startDate,
    eventLocation: event.location,
    ownerType: event.ownerType,
    organizationId: event.organizationId ?? undefined,
  };
}

export function useUpdatesHub(filters: UpdatesHubFilters) {
  const [newsQuery, announcementsQuery, eventsQuery] = useQueries({
    queries: [
      {
        queryKey: [...queryKeys.news, 1, 50],
        queryFn: () => newsApi.listPublished(1, 50),
      },
      {
        queryKey: [...queryKeys.announcements, 1, 50],
        queryFn: () => publicAnnouncementsApi.listPublished(1, 50),
      },
      {
        queryKey: queryKeys.studentEvents,
        queryFn: eventsApi.getEligibleEvents,
      },
    ],
  });
  const orgsQuery = useOrganizations();

  const orgMap = useMemo(() => {
    const map = new Map<string, string>();
    const orgs = orgsQuery.data ?? [];
    for (const org of orgs) {
      map.set(org.id, org.name);
    }
    return map;
  }, [orgsQuery.data]);

  const allItems: UpdateItem[] = useMemo(() => {
    const news: UpdateItem[] = (newsQuery.data?.news ?? []).map(normalizeNews);
    const announcements: UpdateItem[] = (announcementsQuery.data?.announcements ?? []).map(normalizeAnnouncement);
    const events: UpdateItem[] = (eventsQuery.data ?? []).map(normalizeEvent);

    return [...news, ...announcements, ...events].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [newsQuery.data, announcementsQuery.data, eventsQuery.data]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    if (filters.category !== 'all') {
      items = items.filter((item) => item.kind === filters.category);
    }

    if (filters.scope !== 'all') {
      items = items.filter((item) => item.ownerType === filters.scope);
    }

    const query = filters.search.trim().toLowerCase();
    if (query) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query)
      );
    }

    return items;
  }, [allItems, filters]);

  const featured = useMemo(() => {
    const announcements = allItems.filter((i) => i.kind === 'announcement');
    const priorityOrder: Record<AnnouncementPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const topAnnouncement = announcements.length > 0
      ? announcements.reduce((best, curr) => {
          const currRank = curr.priority ? priorityOrder[curr.priority] ?? 99 : 99;
          const bestRank = best.priority ? priorityOrder[best.priority] ?? 99 : 99;
          return currRank < bestRank ? curr : best;
        })
      : null;

    const upcomingEvent = allItems
      .filter((i) => i.kind === 'event' && i.eventDate && new Date(i.eventDate) >= new Date())
      .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())[0] ?? null;

    const latestOfficial = [...allItems]
      .filter((i) => !i.ownerType || i.ownerType === 'system' || i.ownerType === 'official')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0] ?? null;

    const orgActivity = new Map<string, { name: string; count: number; latest: string }>();
    for (const item of allItems) {
      if (item.organizationId && orgMap.has(item.organizationId)) {
        const existing = orgActivity.get(item.organizationId);
        if (existing) {
          existing.count++;
          if (item.publishedAt > existing.latest) existing.latest = item.publishedAt;
        } else {
          orgActivity.set(item.organizationId, {
            name: orgMap.get(item.organizationId)!,
            count: 1,
            latest: item.publishedAt,
          });
        }
      }
    }
    const activeOrgs = [...orgActivity.entries()]
      .sort(([, a], [, b]) => new Date(b.latest).getTime() - new Date(a.latest).getTime())
      .slice(0, 3)
      .map(([id, data]) => ({ id, ...data }));

    return { topAnnouncement, upcomingEvent, latestOfficial, activeOrgs };
  }, [allItems, orgMap]);

  const isLoading = (newsQuery.isPending && !newsQuery.data) ||
    (announcementsQuery.isPending && !announcementsQuery.data) ||
    (eventsQuery.isPending && !eventsQuery.data);

  const isError = newsQuery.isError || announcementsQuery.isError || eventsQuery.isError;

  const refetch = () => {
    newsQuery.refetch();
    announcementsQuery.refetch();
    eventsQuery.refetch();
    orgsQuery.refetch();
  };

  const isRefetching = newsQuery.isRefetching || announcementsQuery.isRefetching || eventsQuery.isRefetching;

  return {
    items: filteredItems,
    featured,
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}
