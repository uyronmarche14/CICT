export const ContentOwnerType = {
  SYSTEM: 'system',
  ORGANIZATION: 'organization',
} as const;
export type ContentOwnerType = (typeof ContentOwnerType)[keyof typeof ContentOwnerType];

export const NewsStatus = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;
export type NewsStatus = (typeof NewsStatus)[keyof typeof NewsStatus];

export const AnnouncementPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type AnnouncementPriority =
  (typeof AnnouncementPriority)[keyof typeof AnnouncementPriority];

export const AnnouncementType = {
  GENERAL: 'general',
  ACADEMIC: 'academic',
  EVENT: 'event',
  EMERGENCY: 'emergency',
} as const;
export type AnnouncementType = (typeof AnnouncementType)[keyof typeof AnnouncementType];

export const EventStatus = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
