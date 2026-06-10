import type { ContentOwnerType } from '../enums/content';

export type UpdatesHubSource = 'news' | 'announcements' | 'events';

export type UpdateFeedItemMeta = {
  label: string;
  value: string;
};

export type UpdateFeedItemImage = {
  src: string;
  alt: string;
};

export type UpdateFeedItem = {
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
  image?: UpdateFeedItemImage | null;
  priorityOrType?: string | null;
  meta: UpdateFeedItemMeta[];
};

export type PaginatedUpdates = {
  items: UpdateFeedItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};
