import { format } from "date-fns";
import type { ContentOwnerType } from "@cict/contracts/enums";
import type { UpdateFeedItem } from '@cict/contracts/types';

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

export const UPDATES_HUB_CATEGORY_OPTIONS: Array<{
  value: UpdatesHubCategory;
  label: string;
}> = [
  { value: "all", label: "All Updates" },
  { value: "news", label: "News" },
  { value: "announcements", label: "Announcements" },
  { value: "events", label: "Events" },
  { value: "organization-updates", label: "My Orgs" },
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
  "This is a curated list of ongoing and planned features for the CICT Portal.",
  "My Orgs tab to follow specific organizations and see their updates.",
  "Search across all content types in the updates hub.",
  "Improved organization page on the landing page.",
  "Rich text formatting in the event registration form.",
  "Share updates to social media.",
  "Calendar view of events and deadlines.",
  "Notification preferences for updates and events.",
  "Mobile app push notifications for updates and events.",
  "Subscription to specific organizations for updates.",
  "User-generated content with approval workflow.",
  "Integration with external calendars (Google, Outlook).",
  "Dark mode improvements and theme customization.",
  "Accessibility improvements and keyboard navigation.",
];

export const stripHtml = (value?: string | null) =>
  value?.replace(/<[^>]*>/g, "") ?? "";

export const formatDate = (date: string) => format(new Date(date), "MMM d, yyyy");

export const normalizeUpdatesHubFilters = (
  params: URLSearchParams
): UpdatesHubFilters => ({
  category: (params.get("category") as UpdatesHubCategory) ?? "all",
  scope: (params.get("scope") as UpdatesHubScope) ?? "all",
  org: params.get("org") || undefined,
  q: params.get("q") || undefined,
});

export const parseUpdatesHubFilters = normalizeUpdatesHubFilters;

export const createUpdatesHubSearchParams = (
  filters: UpdatesHubFilters
): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.scope && filters.scope !== "all") params.set("scope", filters.scope);
  if (filters.org) params.set("org", filters.org);
  if (filters.q) params.set("q", filters.q);
  return params;
};

export const getActiveUpdatesSources = (
  category: UpdatesHubCategory
): UpdatesHubSource[] => {
  if (category === "all") return ["news", "announcements", "events"];
  if (category === "organization-updates") return ["news", "announcements", "events"];
  if (category === "news") return ["news"];
  if (category === "announcements") return ["announcements"];
  if (category === "events") return ["events"];
  return ["news", "announcements", "events"];
};

export const getOwnerTypeForFilters = (
  scope: UpdatesHubScope
): ContentOwnerType | undefined => {
  if (scope === "community") return "organization";
  if (scope === "official") return "system";
  return undefined;
};

export const getKindLabel = (kind: UpdatesHubSource) => {
  switch (kind) {
    case "news": return "News";
    case "announcements": return "Announcement";
    case "events": return "Event";
    default: return "Update";
  }
};

export const rankActiveOrganizations = (
  items: UpdateFeedItem[]
): ActiveOrganizationSummary[] => {
  const orgMap = new Map<string, { name: string; dates: string[] }>();
  for (const item of items) {
    if (!item.organizationId) continue;
    const existing = orgMap.get(item.organizationId);
    if (existing) {
      existing.dates.push(item.sortDate);
    } else {
      orgMap.set(item.organizationId, {
        name: item.organizationName ?? item.organizationId,
        dates: [item.sortDate],
      });
    }
  }
  return Array.from(orgMap.entries())
    .map(([id, data]) => ({
      organizationId: id,
      organizationName: data.name,
      latestActivityDate: data.dates.sort().reverse()[0] ?? "",
      itemCount: data.dates.length,
    }))
    .sort((a, b) => b.itemCount - a.itemCount);
};

export const filterOrganizationsWithActivity = <T extends { id: string }>(
  orgs: T[],
  activeOrgIds: Set<string>
): T[] => {
  if (activeOrgIds.size === 0) return orgs;
  return orgs.filter((org) => activeOrgIds.has(org.id));
};

export const selectTopPriorityAnnouncement = (
  items: UpdateFeedItem[]
): UpdateFeedItem | undefined =>
  items.find((item) => item.kind === "announcements" && item.priorityOrType === "urgent")
  ?? items.find((item) => item.kind === "announcements" && item.priorityOrType === "high")
  ?? items.find((item) => item.kind === "announcements");

export const selectUpcomingEvent = (
  items: UpdateFeedItem[]
): UpdateFeedItem | undefined =>
  items.find((item) => item.kind === "events");

export const selectLatestOfficialUpdate = (
  items: UpdateFeedItem[]
): UpdateFeedItem | undefined =>
  items.find((item) => item.ownerType === "system");
