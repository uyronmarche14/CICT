import { z } from 'zod';
import type { Announcement } from '../types/announcement';
import { contentOwnerTypeSchema } from './content-enums';
import { announcementPrioritySchema } from './content-enums';
import { announcementTypeSchema } from './content-enums';
import { newsStatusSchema } from './content-enums';
import { mediaAssetSchema } from './common';
import { contentSectionExtendedSchema } from './common';
import { officerItemSchema } from './common';
import { awardItemSchema } from './common';
import { attachmentItemSchema } from './common';

export const announcementSchema: z.ZodType<Announcement> = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  bodyHtml: z.string(),
  priority: announcementPrioritySchema,
  type: announcementTypeSchema,
  author: z.union([z.string(), z.object({ firstName: z.string(), lastName: z.string(), email: z.string() })]),
  ownerType: contentOwnerTypeSchema,
  organizationId: z.string().nullable().optional(),
  isActive: z.boolean(),
  targetAudience: z.array(z.string()),
  expiresAt: z.string().optional(),
  coverImage: mediaAssetSchema.optional(),
  gallery: z.array(mediaAssetSchema),
  sections: z.array(contentSectionExtendedSchema),
  imageUrl: z.string().optional(),
  status: newsStatusSchema.optional(),
  publishedAt: z.string().optional(),
  archivedAt: z.string().optional(),
  approvalSummary: z.record(z.unknown()).optional(),
  processInstanceId: z.string().nullable().optional(),
  subtype: z.string().optional(),
  effectiveDate: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().optional(),
  relatedOrganizationId: z.string().optional(),
  relatedEventId: z.string().optional(),
  approvalSource: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  officerItems: z.array(officerItemSchema).optional(),
  outgoingOfficerItems: z.array(officerItemSchema).optional(),
  awardItems: z.array(awardItemSchema).optional(),
  attachmentItems: z.array(attachmentItemSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
