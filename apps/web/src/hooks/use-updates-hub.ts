import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api/axios";
import {
  filterOrganizationsWithActivity,
  parseUpdatesHubFilters,
  getActiveUpdatesSources,
  type UpdatesHubFilters,
  rankActiveOrganizations,
  selectLatestOfficialUpdate,
  selectTopPriorityAnnouncement,
  selectUpcomingEvent,
  UPDATES_HUB_PAGE_SIZE,
} from "@/lib/updates-hub";
import type { UpdateFeedItem } from '@cict/contracts/types';

export function useUpdatesHub(filters: UpdatesHubFilters) {
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("category", filters.category);
    params.set("scope", filters.scope);
    params.set("page", "1");
    params.set("limit", String(UPDATES_HUB_PAGE_SIZE));
    if (filters.org) params.set("org", filters.org);
    if (filters.q) params.set("q", filters.q);
    return params.toString();
  }, [filters]);

  const queryKey = ["updates", filters.category, filters.scope, filters.org ?? "", filters.q ?? ""];

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: res } = await api.get(`/api/updates?${queryParams}`);
      return res.data as {
        items: UpdateFeedItem[];
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    },
    staleTime: 30_000,
  });

  const feedItems = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const communityFeedItems = useMemo(
    () => feedItems.filter((item) => item.ownerType === "organization"),
    [feedItems]
  );

  const availableOrganizationIds = useMemo(
    () => new Set(communityFeedItems.map((item) => item.organizationId).filter(Boolean) as string[]),
    [communityFeedItems]
  );

  const activeOrganizations = useMemo(
    () => rankActiveOrganizations(communityFeedItems).slice(0, 3),
    [communityFeedItems]
  );

  const topPriorityAnnouncement = useMemo(
    () => selectTopPriorityAnnouncement(feedItems),
    [feedItems]
  );

  const upcomingEvent = useMemo(
    () => selectUpcomingEvent(feedItems),
    [feedItems]
  );

  const latestOfficialUpdate = useMemo(
    () => selectLatestOfficialUpdate(feedItems),
    [feedItems]
  );

  return {
    visibleItems: feedItems,
    totalLoadedItems: total,
    visibleCount: feedItems.length,
    hasMore: pages > 1,
    isInitialLoading: isLoading,
    isFetchingMore: isFetching,
    error,
    loadMore: async () => {},
    topPriorityAnnouncement,
    upcomingEvent,
    latestOfficialUpdate,
    activeOrganizations,
    availableOrganizationIds,
  };
}
