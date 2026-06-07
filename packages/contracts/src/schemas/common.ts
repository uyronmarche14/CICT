import { z } from 'zod';
import type { ContentSection } from '../types/common';
import type { SpeakerItem } from '../types/common';
import type { AttachmentItem } from '../types/common';
import type { VenueDetails } from '../types/common';
import type { OfficerItem } from '../types/common';
import type { AwardItem } from '../types/common';
import type { ReferenceLink } from '../types/common';

export const mediaAssetSchema = z.object({
  imageUrl: z.string(),
  imageId: z.string().optional(),
  assetFingerprint: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  sortOrder: z.number().optional(),
});

export const contentSectionExtendedSchema: z.ZodType<ContentSection> = z.object({
  heading: z.string(),
  style: z.enum(['default', 'callout', 'checklist']),
  bodyHtml: z.string().optional(),
  items: z.array(z.string()).optional(),
  image: mediaAssetSchema.optional(),
  link: z.object({ url: z.string(), label: z.string() }).optional(),
  embed: z.object({ type: z.enum(['video', 'map', 'form']), url: z.string() }).optional(),
});

export const speakerItemSchema: z.ZodType<SpeakerItem> = z.object({
  name: z.string(),
  title: z.string().optional(),
  organization: z.string().optional(),
  photo: mediaAssetSchema.optional(),
});

export const attachmentItemSchema: z.ZodType<AttachmentItem> = z.object({
  label: z.string(),
  url: z.string(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export const venueDetailsSchema: z.ZodType<VenueDetails> = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  room: z.string().optional(),
  capacity: z.number().optional(),
  accessibility: z.string().optional(),
});

export const officerItemSchema: z.ZodType<OfficerItem> = z.object({
  position: z.string(),
  name: z.string(),
  photo: mediaAssetSchema.optional(),
});

export const awardItemSchema: z.ZodType<AwardItem> = z.object({
  title: z.string(),
  recipient: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const referenceLinkSchema: z.ZodType<ReferenceLink> = z.object({
  label: z.string(),
  url: z.string(),
});
