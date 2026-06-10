import News from '../models/News';
import Announcement from '../models/Announcement';
import Event from '../models/Event';
import logger from '../utils/logger';
import type { UpdateFeedItem } from '@cict/contracts/types';

const CONTENT_TYPES = ['news', 'announcements', 'events'] as const;
type ContentType = typeof CONTENT_TYPES[number];

interface UpdatesParams {
  category: 'all' | 'news' | 'announcements' | 'events';
  scope: 'all' | 'official' | 'community';
  org?: string;
  q?: string;
  page: number;
  limit: number;
}

function buildQuery(
  type: ContentType,
  params: UpdatesParams
): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (type === 'news') {query.status = 'published';}
  else if (type === 'announcements') {query.isActive = true;}
  else if (type === 'events') {query.status = 'published';}

  if (params.scope === 'community') {
    query.ownerType = 'organization';
  } else if (params.scope === 'official') {
    query.ownerType = 'system';
  }

  if (params.org) {
    query.organizationId = params.org.toLowerCase();
  }

  if (params.q) {
    query.$or = [
      { title: { $regex: params.q, $options: 'i' } },
      { excerpt: { $regex: params.q, $options: 'i' } },
    ];
  }

  return query;
}

function buildHref(type: ContentType, id: unknown): string {
  if (type === 'news') {return `/news/${id}`;}
  if (type === 'announcements') {return `/announcements/${id}`;}
  return `/events/${id}`;
}

function docToFeedItem(
  doc: Record<string, unknown>,
  type: ContentType
): UpdateFeedItem {
  const publishedAt = (doc.publishedAt as string) || (doc.createdAt as string) || '';
  const cover = doc.coverImage as Record<string, unknown> | undefined;
  const imageUrl = cover?.imageUrl as string | undefined;

  return {
    id: `${type}:${doc._id}`,
    kind: type === 'announcements' ? 'announcements' : type,
    title: (doc.title as string) || '',
    summary: (doc.excerpt as string) || (doc.description as string) || '',
    href: buildHref(type, doc._id),
    sortDate: publishedAt,
    displayDate: publishedAt,
    ownerType: (doc.ownerType as string) || 'system' as any,
    organizationId: doc.organizationId as string | null | undefined,
    organizationName: null,
    image: imageUrl ? { src: imageUrl, alt: (doc.title as string) || '' } : null,
    priorityOrType:
      type === 'announcements'
        ? (doc.priority as string | null)
        : (doc.ownerType as string),
    meta: [],
  };
}

export async function getUpdates(
  params: UpdatesParams
): Promise<{
  items: UpdateFeedItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}> {
  const { category, page, limit } = params;
  const skip = (page - 1) * limit;

  const typesToFetch: ContentType[] =
    category === 'all'
      ? [...CONTENT_TYPES]
      : [category === 'announcements' ? 'announcements' : category];

  const allItems: UpdateFeedItem[] = [];

  for (const type of typesToFetch) {
    const query = buildQuery(type, params);

    try {
      let docs: Record<string, unknown>[] = [];

      if (type === 'news') {
        docs = await News.find(query)
          .sort({ publishedAt: -1 })
          .select('title excerpt description publishedAt createdAt ownerType organizationId coverImage')
          .lean() as unknown as Record<string, unknown>[];
      } else if (type === 'announcements') {
        docs = await Announcement.find(query)
          .sort({ publishedAt: -1 })
          .select('title excerpt description publishedAt createdAt ownerType organizationId coverImage priority')
          .lean() as unknown as Record<string, unknown>[];
      } else {
        docs = await Event.find(query)
          .sort({ publishedAt: -1 })
          .select('title excerpt description publishedAt createdAt ownerType organizationId coverImage')
          .lean() as unknown as Record<string, unknown>[];
      }

      for (const doc of docs) {
        allItems.push(docToFeedItem(doc, type));
      }
    } catch (err) {
      logger.error(`Updates fetch error for ${type}:`, err);
    }
  }

  allItems.sort(
    (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
  );

  const total = allItems.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const items = allItems.slice(skip, skip + limit);

  return { items, page, limit, total, pages };
}
