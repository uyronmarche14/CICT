import { z } from 'zod';
import { contentOwnerTypeSchema } from './content-enums';

export const updatesHubSourceSchema = z.enum(['news', 'announcements', 'events']);

export const updateFeedItemMetaSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const updateFeedItemImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export const updateFeedItemSchema = z.object({
  id: z.string(),
  kind: updatesHubSourceSchema,
  title: z.string(),
  summary: z.string(),
  href: z.string(),
  sortDate: z.string(),
  displayDate: z.string(),
  ownerType: contentOwnerTypeSchema,
  organizationId: z.string().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  image: updateFeedItemImageSchema.nullable().optional(),
  priorityOrType: z.string().nullable().optional(),
  meta: z.array(updateFeedItemMetaSchema),
});

export const paginatedUpdatesSchema = z.object({
  items: z.array(updateFeedItemSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number(),
});
