import { z } from 'zod';
import type { News } from '../types/news';
import { contentOwnerTypeSchema } from './content-enums';
import { newsStatusSchema } from './content-enums';
import { mediaAssetSchema } from './common';
import { contentSectionExtendedSchema } from './common';
import { referenceLinkSchema } from './common';
import { attachmentItemSchema } from './common';

export const newsSchema: z.ZodType<News> = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  bodyHtml: z.string(),
  excerpt: z.string(),
  author: z.union([z.string(), z.object({ firstName: z.string(), lastName: z.string(), email: z.string() })]),
  ownerType: contentOwnerTypeSchema,
  organizationId: z.string().nullable().optional(),
  status: newsStatusSchema,
  publishedAt: z.string().optional(),
  archivedAt: z.string().optional(),
  approvalSummary: z.record(z.unknown()).optional(),
  processInstanceId: z.string().nullable().optional(),
  tags: z.array(z.string()),
  coverImage: mediaAssetSchema.optional(),
  gallery: z.array(mediaAssetSchema),
  sections: z.array(contentSectionExtendedSchema),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  pinned: z.boolean().optional(),
  sourceUrl: z.string().optional(),
  referenceLinks: z.array(referenceLinkSchema).optional(),
  attachmentItems: z.array(attachmentItemSchema).optional(),
  readingTime: z.number().optional(),
  authorDisplayName: z.string().optional(),
  authorRole: z.string().optional(),
  associatedEventId: z.string().optional(),
  associatedOrganizationId: z.string().optional(),
  spotlightLabel: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalSlug: z.string().optional(),
  relatedArticleIds: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
