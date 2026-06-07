import { z } from 'zod';
import type { Event } from '../types/event';
import type { StudentEvent } from '../types/student';
import type { StudentEventsResponse } from '../types/student';
import { contentOwnerTypeSchema } from './content-enums';
import { eventStatusSchema } from './content-enums';
import { mediaAssetSchema } from './common';
import { contentSectionExtendedSchema } from './common';
import { speakerItemSchema } from './common';
import { venueDetailsSchema } from './common';
import { attachmentItemSchema } from './common';
import { studentRegistrationSchema } from './registration';

export const eventSchema: z.ZodType<Event> = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  bodyHtml: z.string(),
  excerpt: z.string(),
  organizer: z.union([z.string(), z.object({ firstName: z.string(), lastName: z.string(), email: z.string() })]),
  ownerType: contentOwnerTypeSchema,
  organizationId: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  status: z.union([eventStatusSchema, z.string()]),
  publishedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  completedAt: z.string().optional(),
  attendees: z.array(z.string()),
  maxAttendees: z.number().optional(),
  coverImage: mediaAssetSchema.optional(),
  gallery: z.array(mediaAssetSchema),
  sections: z.array(contentSectionExtendedSchema),
  schedule: z.array(z.object({ label: z.string(), title: z.string(), description: z.string().optional() })),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRegistrationOpen: z.boolean(),
  registeredCount: z.number().optional(),
  checkedInCount: z.number().optional(),
  registrationCloseAt: z.string().optional(),
  allowWalkIns: z.boolean().optional(),
  targetProgramIds: z.array(z.string()).optional(),
  targetYearLevelIds: z.array(z.string()).optional(),
  targetSectionIds: z.array(z.string()).optional(),
  approvalSummary: z.record(z.unknown()).optional(),
  processInstanceId: z.string().nullable().optional(),
  registrationUrl: z.string().optional(),
  registrationDeadline: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  hostOrganizationIds: z.array(z.string()).optional(),
  coHostOrganizationIds: z.array(z.string()).optional(),
  speakerItems: z.array(speakerItemSchema).optional(),
  audience: z.string().optional(),
  eligibility: z.string().optional(),
  feeLabel: z.string().optional(),
  certificateInfo: z.string().optional(),
  venueDetails: venueDetailsSchema.optional(),
  mapUrl: z.string().optional(),
  meetingUrl: z.string().optional(),
  requirements: z.string().optional(),
  attachmentItems: z.array(attachmentItemSchema).optional(),
  posterCaption: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const studentEventSchema: z.ZodType<StudentEvent> = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  bodyHtml: z.string(),
  excerpt: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  status: z.string(),
  coverImage: mediaAssetSchema.optional(),
  imageUrl: z.string().optional(),
  maxAttendees: z.number().optional(),
  registeredCount: z.number().optional(),
  checkedInCount: z.number().optional(),
  isRegistrationOpen: z.boolean().optional(),
  registrationCloseAt: z.string().optional(),
  allowWalkIns: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  speakerItems: z.array(speakerItemSchema).optional(),
  feeLabel: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  venueDetails: venueDetailsSchema.optional(),
  organizer: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
    })
    .optional(),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        title: z.string().optional(),
        style: z.enum(['default', 'callout', 'checklist']),
        bodyHtml: z.string().optional(),
        content: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
    )
    .optional(),
  schedule: z
    .array(
      z.object({
        label: z.string(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  registration: studentRegistrationSchema.nullable(),
  ownerType: z.union([contentOwnerTypeSchema, z.string()]).optional(),
  organizationId: z.string().nullable().optional(),
});

export const studentEventsResponseSchema: z.ZodType<StudentEventsResponse> = z.object({
  events: z.array(studentEventSchema),
});
