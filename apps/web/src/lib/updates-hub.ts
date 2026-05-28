import { format } from "date-fns";

import api from "@/lib/api/axios";
import { Event, eventAPI } from "@/lib/api/event";
import {
  Announcement,
  AnnouncementPriority,
  ContentOwnerType,
  News,
  NewsStatus,
  Organization,
} from "@/types";

export const UPDATES_HUB_PAGE_SIZE = 9;
export const UPDATES_HUB_FEATURED_LIMIT = 18;

export type UpdatesHubCategory =
  | "all"
  | "news"
  | "announcements"
  | "events"
  | "organization-updates";

export type UpdatesHubScope = "all" | "official" | "community";
export type UpdatesHubSource = "news" | "announcements" | "events";

export interface UpdatesHubFilters {
  category: UpdatesHubCategory;
  scope: UpdatesHubScope;
  org?: string;
  q?: string;
}

export interface UpdateFeedItemMeta {
  label: string;
  value: string;
}

export interface UpdateFeedItemImage {
  src: string;
  alt: string;
}

export interface UpdateFeedItem {
  id: string;
  kind: UpdatesHubSource;
  title: string;
  summary: string;
  href: string;
  sortDate: string;
  displayDate: string;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  organizationName?: string | null;
  image?: UpdateFeedItemImage;
  priorityOrType?: string | null;
  meta: UpdateFeedItemMeta[];
}

export interface PaginatedPublicResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ActiveOrganizationSummary {
  organizationId: string;
  organizationName: string;
  latestActivityDate: string;
  itemCount: number;
}

type SearchParamsReader = {
  get(name: string): string | null;
};

interface NewsListResponse {
  success: boolean;
  data: {
    news: News[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface AnnouncementListResponse {
  success: boolean;
  data: {
    announcements: Announcement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const UPDATES_HUB_CATEGORY_OPTIONS: Array<{
  value: UpdatesHubCategory;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All Updates",
    description: "A mixed stream of official and community content.",
  },
  {
    value: "news",
    label: "News",
    description: "Stories, features, and official writeups.",
  },
  {
    value: "announcements",
    label: "Announcements",
    description: "Urgent notices, reminders, and public advisories.",
  },
  {
    value: "events",
    label: "Events",
    description: "Upcoming activities, workshops, and gatherings.",
  },
  {
    value: "organization-updates",
    label: "Organization Updates",
    description: "Student-organization activity across the college.",
  },
];

export const UPDATES_HUB_SCOPE_OPTIONS: Array<{
  value: UpdatesHubScope;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "official", label: "Official" },
  { value: "community", label: "Community" },
];

export const UPDATES_HUB_FUTURE_CATEGORIES = [
  { label: "Achievements", description: "Coming soon" },
  { label: "Student Life", description: "Coming soon" },
  { label: "Member Highlights", description: "Coming soon" },
] as const;

const DEFAULT_FILTERS: UpdatesHubFilters = {
  category: "all",
  scope: "all",
};

const priorityRank: Record<AnnouncementPriority, number> = {
  [AnnouncementPriority.URGENT]: 4,
  [AnnouncementPriority.HIGH]: 3,
  [AnnouncementPriority.MEDIUM]: 2,
  [AnnouncementPriority.LOW]: 1,
};

const collapseWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export const stripHtml = (value?: string | null) =>
  collapseWhitespace((value ?? "").replace(/<[^>]+>/g, " "));

export const formatDate = (date: string) => format(new Date(date), "MMM d, yyyy");

const formatEventWindow = (date: string) => format(new Date(date), "MMM d, yyyy");

const buildImage = (
  imageUrl?: string,
  alt?: string,
  fallbackAlt?: string
): UpdateFeedItemImage | undefined => {
  if (!imageUrl) {
    return undefined;
  }

  return {
    src: imageUrl,
    alt: alt || fallbackAlt || "CICT update",
  };
};

export const normalizeUpdatesHubFilters = (
  input?: Partial<UpdatesHubFilters>
): UpdatesHubFilters => {
  const category = UPDATES_HUB_CATEGORY_OPTIONS.some(
    (option) => option.value === input?.category
  )
    ? (input?.category as UpdatesHubCategory)
    : DEFAULT_FILTERS.category;
  let scope = UPDATES_HUB_SCOPE_OPTIONS.some((option) => option.value === input?.scope)
    ? (input?.scope as UpdatesHubScope)
    : DEFAULT_FILTERS.scope;
  const org = input?.org?.trim().toLowerCase() || undefined;
  const q = input?.q?.trim() || undefined;

  if (category === "organization-updates") {
    scope = "community";
  }

  if (org && scope === "official") {
    scope = "community";
  }

  return {
    category,
    scope,
    org: scope === "official" ? undefined : org,
    q,
  };
};

export const parseUpdatesHubFilters = (
  searchParams: SearchParamsReader
): UpdatesHubFilters =>
  normalizeUpdatesHubFilters({
    category: (searchParams.get("category") as UpdatesHubCategory | null) ?? undefined,
    scope: (searchParams.get("scope") as UpdatesHubScope | null) ?? undefined,
    org: searchParams.get("org") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });

export const createUpdatesHubSearchParams = (filters: UpdatesHubFilters) => {
  const normalized = normalizeUpdatesHubFilters(filters);
  const params = new URLSearchParams();

  if (normalized.category !== DEFAULT_FILTERS.category) {
    params.set("category", normalized.category);
  }

  if (normalized.scope !== DEFAULT_FILTERS.scope) {
    params.set("scope", normalized.scope);
  }

  if (normalized.org) {
    params.set("org", normalized.org);
  }

  if (normalized.q) {
    params.set("q", normalized.q);
  }

  return params;
};

export const getActiveUpdatesSources = (
  category: UpdatesHubCategory
): UpdatesHubSource[] => {
  switch (category) {
    case "news":
      return ["news"];
    case "announcements":
      return ["announcements"];
    case "events":
      return ["events"];
    case "all":
    case "organization-updates":
    default:
      return ["news", "announcements", "events"];
  }
};

export const getOwnerTypeForFilters = (
  filters: UpdatesHubFilters
): ContentOwnerType | undefined => {
  if (filters.category === "organization-updates" || filters.scope === "community" || filters.org) {
    return ContentOwnerType.ORGANIZATION;
  }

  if (filters.scope === "official") {
    return ContentOwnerType.SYSTEM;
  }

  return undefined;
};

const buildSharedContentParams = (filters: UpdatesHubFilters) => {
  const ownerType = getOwnerTypeForFilters(filters);

  return {
    ownerType,
    organizationId: filters.org,
    search: filters.q,
  };
};

export const fetchPublicNewsPage = async (
  page: number,
  limit: number,
  filters: UpdatesHubFilters
): Promise<PaginatedPublicResult<News>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("status", NewsStatus.PUBLISHED);

  const { ownerType, organizationId, search } = buildSharedContentParams(filters);

  if (ownerType) {
    params.set("ownerType", ownerType);
  }

  if (organizationId) {
    params.set("organizationId", organizationId);
  }

  if (search) {
    params.set("search", search);
  }

  const response = await api.get<NewsListResponse>(`/news?${params.toString()}`);
  const { news, pagination } = response.data.data;

  return {
    items: news,
    ...pagination,
  };
};

export const fetchPublicAnnouncementsPage = async (
  page: number,
  limit: number,
  filters: UpdatesHubFilters
): Promise<PaginatedPublicResult<Announcement>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const { ownerType, organizationId, search } = buildSharedContentParams(filters);

  if (ownerType) {
    params.set("ownerType", ownerType);
  }

  if (organizationId) {
    params.set("organizationId", organizationId);
  }

  if (search) {
    params.set("search", search);
  }

  const response = await api.get<AnnouncementListResponse>(
    `/public/announcements?${params.toString()}`
  );
  const { announcements, pagination } = response.data.data;

  return {
    items: announcements,
    ...pagination,
  };
};

export const fetchPublicEventsPage = async (
  page: number,
  limit: number,
  filters: UpdatesHubFilters
): Promise<PaginatedPublicResult<Event>> => {
  const { ownerType, organizationId, search } = buildSharedContentParams(filters);
  const response = await eventAPI.getAll({
    page,
    limit,
    status: "published",
    ownerType,
    organizationId: organizationId ?? undefined,
    search,
  });

  return {
    items: response.data.events,
    ...response.data.pagination,
  };
};

export const normalizeNewsUpdateItem = (article: News): UpdateFeedItem => ({
  id: article._id,
  kind: "news",
  title: article.title,
  summary: article.excerpt || stripHtml(article.bodyHtml || article.content),
  href: `/news/${article._id}`,
  sortDate: article.publishedAt ?? article.createdAt,
  displayDate: article.publishedAt ?? article.createdAt,
  ownerType: article.ownerType,
  organizationId: article.organizationId ?? null,
  organizationName: article.organizationName ?? null,
  image: buildImage(
    article.coverImage?.imageUrl || article.imageUrl,
    article.coverImage?.alt,
    article.title
  ),
  priorityOrType: article.tags[0] ?? null,
  meta: [
    { label: "Published", value: formatDate(article.publishedAt ?? article.createdAt) },
    {
      label: "By",
      value:
        typeof article.author === "object"
          ? `${article.author.firstName} ${article.author.lastName}`
          : "CICT",
    },
  ],
});

export const normalizeAnnouncementUpdateItem = (
  announcement: Announcement
): UpdateFeedItem => ({
  id: announcement._id,
  kind: "announcements",
  title: announcement.title,
  summary:
    stripHtml(announcement.content) ||
    stripHtml(announcement.bodyHtml) ||
    "Official announcement from CICT.",
  href: `/announcements/${announcement._id}`,
  sortDate: announcement.publishedAt ?? announcement.createdAt,
  displayDate: announcement.publishedAt ?? announcement.createdAt,
  ownerType: announcement.ownerType,
  organizationId: announcement.organizationId ?? null,
  organizationName: announcement.organizationName ?? null,
  image: buildImage(
    announcement.coverImage?.imageUrl || announcement.imageUrl,
    announcement.coverImage?.alt,
    announcement.title
  ),
  priorityOrType: announcement.priority,
  meta: [
    { label: "Published", value: formatDate(announcement.publishedAt ?? announcement.createdAt) },
    { label: "Type", value: announcement.type },
  ],
});

export const normalizeEventUpdateItem = (event: Event): UpdateFeedItem => ({
  id: event._id,
  kind: "events",
  title: event.title,
  summary:
    event.excerpt ||
    event.description ||
    stripHtml(event.bodyHtml) ||
    "Upcoming CICT event.",
  href: `/events/${event._id}`,
  sortDate: event.startDate,
  displayDate: event.startDate,
  ownerType: event.ownerType,
  organizationId: event.organizationId ?? null,
  organizationName: event.organizationName ?? null,
  image: buildImage(
    event.coverImage?.imageUrl || event.imageUrl,
    event.coverImage?.alt,
    event.title
  ),
  priorityOrType: event.status,
  meta: [
    { label: "Starts", value: formatEventWindow(event.startDate) },
    { label: "Location", value: event.location },
  ],
});

export const mergeAndSortUpdateItems = (items: UpdateFeedItem[]) => {
  const uniqueItems = new Map<string, UpdateFeedItem>();

  for (const item of items) {
    uniqueItems.set(`${item.kind}:${item.id}`, item);
  }

  return Array.from(uniqueItems.values()).sort(
    (left, right) =>
      new Date(right.sortDate).getTime() - new Date(left.sortDate).getTime()
  );
};

export const getKindLabel = (kind: UpdatesHubSource) => {
  switch (kind) {
    case "news":
      return "News";
    case "announcements":
      return "Announcement";
    case "events":
      return "Event";
    default:
      return "Update";
  }
};

export const rankActiveOrganizations = (
  items: UpdateFeedItem[]
): ActiveOrganizationSummary[] => {
  const summaries = new Map<string, ActiveOrganizationSummary>();

  for (const item of items) {
    if (
      item.ownerType !== ContentOwnerType.ORGANIZATION ||
      !item.organizationId ||
      !item.organizationName
    ) {
      continue;
    }

    const existing = summaries.get(item.organizationId);
    if (!existing) {
      summaries.set(item.organizationId, {
        organizationId: item.organizationId,
        organizationName: item.organizationName,
        latestActivityDate: item.sortDate,
        itemCount: 1,
      });
      continue;
    }

    existing.itemCount += 1;
    if (
      new Date(item.sortDate).getTime() > new Date(existing.latestActivityDate).getTime()
    ) {
      existing.latestActivityDate = item.sortDate;
    }
  }

  return Array.from(summaries.values()).sort((left, right) => {
    const latestDelta =
      new Date(right.latestActivityDate).getTime() -
      new Date(left.latestActivityDate).getTime();

    if (latestDelta !== 0) {
      return latestDelta;
    }

    return right.itemCount - left.itemCount;
  });
};

export const filterOrganizationsWithActivity = (
  organizations: Organization[],
  activeOrganizationIds: Set<string>
) =>
  organizations.filter((organization) => activeOrganizationIds.has(organization.id));

export const selectTopPriorityAnnouncement = (announcements: Announcement[]) =>
  [...announcements].sort((left, right) => {
    const priorityDelta =
      priorityRank[right.priority] - priorityRank[left.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return (
      new Date(right.publishedAt ?? right.createdAt).getTime() -
      new Date(left.publishedAt ?? left.createdAt).getTime()
    );
  })[0];

export const selectUpcomingEvent = (events: Event[]) =>
  [...events]
    .filter((event) => new Date(event.endDate).getTime() >= Date.now())
    .sort(
      (left, right) =>
        new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
    )[0];

export const selectLatestOfficialUpdate = (items: UpdateFeedItem[]) =>
  [...items]
    .filter((item) => item.ownerType === ContentOwnerType.SYSTEM)
    .sort(
      (left, right) =>
        new Date(right.sortDate).getTime() - new Date(left.sortDate).getTime()
    )[0];
