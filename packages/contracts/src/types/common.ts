export type MediaAsset = {
  imageUrl: string;
  imageId?: string;
  assetFingerprint?: string;
  alt?: string;
  caption?: string;
  sortOrder?: number;
};

export type ContentSection = {
  heading: string;
  style: 'default' | 'callout' | 'checklist';
  bodyHtml?: string;
  items?: string[];
  image?: MediaAsset;
  link?: {
    url: string;
    label: string;
  };
  embed?: {
    type: 'video' | 'map' | 'form';
    url: string;
  };
};

export type SpeakerItem = {
  name: string;
  title?: string;
  organization?: string;
  photo?: MediaAsset;
};

export type AttachmentItem = {
  label: string;
  url: string;
  fileType?: string;
  fileSize?: number;
};

export type VenueDetails = {
  name?: string;
  address?: string;
  room?: string;
  capacity?: number;
  accessibility?: string;
};

export type OfficerItem = {
  position: string;
  name: string;
  photo?: MediaAsset;
};

export type AwardItem = {
  title: string;
  recipient: string;
  category?: string;
  description?: string;
};

export type ReferenceLink = {
  label: string;
  url: string;
};

export type EventScheduleItem = {
  label: string;
  title: string;
  description?: string;
};

export type StudentEventSection = ContentSection & {
  title?: string;
  content?: string;
};

export type ApprovalActionItem = {
  action: 'submitted' | 'approved' | 'rejected' | 'published' | 'archived' | 'cancelled' | 'completed' | 'returned_to_draft';
  actorUserId: string;
  actorDisplayName: string;
  timestamp: string;
  reason?: string;
  comment?: string;
  fromStatus: string;
  toStatus: string;
};

export type ApprovalSummary = {
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  approvalHistory?: ApprovalActionItem[];
};

export type ApprovalQueueItem = {
  _id: string;
  contentType: 'news' | 'announcement' | 'event';
  contentId: string;
  title: string;
  status: string;
  submittedAt: string;
  submittedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  organizationId?: string | null;
  organizationName?: string | null;
  ownerType: ContentOwnerType;
};

export type ApprovalStats = {
  pending: number;
  byType: {
    events: number;
    news: number;
    announcements: number;
  };
};

import type { ContentOwnerType } from '../enums/content';
