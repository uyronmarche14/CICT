import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { ContentOwnerType } from "@/types";
import {
  fetchPublicAnnouncementsPage,
  fetchPublicEventsPage,
  fetchPublicNewsPage,
  mergeAndSortUpdateItems,
  normalizeAnnouncementUpdateItem,
  normalizeEventUpdateItem,
  normalizeNewsUpdateItem,
  rankActiveOrganizations,
  selectLatestOfficialUpdate,
  selectTopPriorityAnnouncement,
  selectUpcomingEvent,
  type UpdatesHubFilters,
  UPDATES_HUB_FEATURED_LIMIT,
  UPDATES_HUB_PAGE_SIZE,
  getActiveUpdatesSources,
  type UpdateFeedItem,
} from "@/lib/updates-hub";

export function useUpdatesHub(filters: UpdatesHubFilters) {
  const [visibleCount, setVisibleCount] = useState(UPDATES_HUB_PAGE_SIZE);

  const queryKeySuffix = [
    filters.category,
    filters.scope,
    filters.org ?? "",
    filters.q ?? "",
  ] as const;
  const activeSources = useMemo(
    () => getActiveUpdatesSources(filters.category),
    [filters.category]
  );

  useEffect(() => {
    setVisibleCount(UPDATES_HUB_PAGE_SIZE);
  }, [filters.category, filters.scope, filters.org, filters.q]);

  const newsEnabled = activeSources.includes("news");
  const announcementsEnabled = activeSources.includes("announcements");
  const eventsEnabled = activeSources.includes("events");

  const newsQuery = useInfiniteQuery({
    queryKey: ["updates-hub", "feed", "news", ...queryKeySuffix],
    queryFn: ({ pageParam }) =>
      fetchPublicNewsPage(pageParam, UPDATES_HUB_PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
    enabled: newsEnabled,
  });

  const announcementsQuery = useInfiniteQuery({
    queryKey: ["updates-hub", "feed", "announcements", ...queryKeySuffix],
    queryFn: ({ pageParam }) =>
      fetchPublicAnnouncementsPage(pageParam, UPDATES_HUB_PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
    enabled: announcementsEnabled,
  });

  const eventsQuery = useInfiniteQuery({
    queryKey: ["updates-hub", "feed", "events", ...queryKeySuffix],
    queryFn: ({ pageParam }) =>
      fetchPublicEventsPage(pageParam, UPDATES_HUB_PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
    enabled: eventsEnabled,
  });

  const featuredFilters = useMemo(
    () => ({
      category: "all",
      scope: filters.org ? "community" : "all",
      org: filters.org,
    }) as UpdatesHubFilters,
    [filters.org]
  );

  const featuredNewsQuery = useQuery({
    queryKey: ["updates-hub", "featured", "news", filters.org ?? ""],
    queryFn: () =>
      fetchPublicNewsPage(1, UPDATES_HUB_FEATURED_LIMIT, featuredFilters),
    staleTime: 30_000,
  });

  const featuredAnnouncementsQuery = useQuery({
    queryKey: ["updates-hub", "featured", "announcements", filters.org ?? ""],
    queryFn: () =>
      fetchPublicAnnouncementsPage(1, UPDATES_HUB_FEATURED_LIMIT, featuredFilters),
    staleTime: 30_000,
  });

  const featuredEventsQuery = useQuery({
    queryKey: ["updates-hub", "featured", "events", filters.org ?? ""],
    queryFn: () =>
      fetchPublicEventsPage(1, UPDATES_HUB_FEATURED_LIMIT, featuredFilters),
    staleTime: 30_000,
  });

  const feedItems = useMemo<UpdateFeedItem[]>(
    () =>
      mergeAndSortUpdateItems([
        ...((newsQuery.data?.pages ?? []).flatMap((page) =>
          page.items.map(normalizeNewsUpdateItem)
        ) ?? []),
        ...((announcementsQuery.data?.pages ?? []).flatMap((page) =>
          page.items.map(normalizeAnnouncementUpdateItem)
        ) ?? []),
        ...((eventsQuery.data?.pages ?? []).flatMap((page) =>
          page.items.map(normalizeEventUpdateItem)
        ) ?? []),
      ]),
    [announcementsQuery.data, eventsQuery.data, newsQuery.data]
  );

  const featuredItems = useMemo<UpdateFeedItem[]>(
    () =>
      mergeAndSortUpdateItems([
        ...(featuredNewsQuery.data?.items.map(normalizeNewsUpdateItem) ?? []),
        ...(featuredAnnouncementsQuery.data?.items.map(normalizeAnnouncementUpdateItem) ??
          []),
        ...(featuredEventsQuery.data?.items.map(normalizeEventUpdateItem) ?? []),
      ]),
    [featuredAnnouncementsQuery.data, featuredEventsQuery.data, featuredNewsQuery.data]
  );

  const feedQueries = [
    newsEnabled ? newsQuery : null,
    announcementsEnabled ? announcementsQuery : null,
    eventsEnabled ? eventsQuery : null,
  ].filter(Boolean);

  const isInitialLoading =
    feedItems.length === 0 &&
    feedQueries.some((query) => query?.isPending);

  const isFetchingMore = feedQueries.some((query) => query?.isFetchingNextPage);
  const canFetchMore = feedQueries.some((query) => query?.hasNextPage);
  const visibleItems = feedItems.slice(0, visibleCount);
  const hasMore = visibleCount < feedItems.length || canFetchMore;
  const error = feedQueries.find((query) => query?.error)?.error ?? null;

  const loadMore = async () => {
    if (visibleCount < feedItems.length) {
      setVisibleCount((current) => current + UPDATES_HUB_PAGE_SIZE);
      return;
    }

    if (canFetchMore) {
      setVisibleCount((current) => current + UPDATES_HUB_PAGE_SIZE);
      await Promise.all(
        feedQueries
          .filter((query) => query?.hasNextPage)
          .map((query) => query!.fetchNextPage())
      );
      return;
    }

    setVisibleCount((current) =>
      Math.min(current + UPDATES_HUB_PAGE_SIZE, feedItems.length)
    );
  };

  const communityFeedItems = feedItems.filter(
    (item) => item.ownerType === ContentOwnerType.ORGANIZATION
  );
  const featuredCommunityItems = featuredItems.filter(
    (item) => item.ownerType === ContentOwnerType.ORGANIZATION
  );

  const availableOrganizationIds = useMemo(
    () =>
      new Set(
        [...communityFeedItems, ...featuredCommunityItems]
          .map((item) => item.organizationId)
          .filter((organizationId): organizationId is string => Boolean(organizationId))
      ),
    [communityFeedItems, featuredCommunityItems]
  );

  const activeOrganizations = rankActiveOrganizations(featuredCommunityItems).slice(0, 3);

  return {
    visibleItems,
    totalLoadedItems: feedItems.length,
    visibleCount: visibleItems.length,
    hasMore,
    isInitialLoading,
    isFetchingMore,
    error,
    loadMore,
    topPriorityAnnouncement: selectTopPriorityAnnouncement(
      featuredAnnouncementsQuery.data?.items ?? []
    ),
    upcomingEvent: selectUpcomingEvent(featuredEventsQuery.data?.items ?? []),
    latestOfficialUpdate: selectLatestOfficialUpdate(featuredItems),
    activeOrganizations,
    availableOrganizationIds,
  };
}
