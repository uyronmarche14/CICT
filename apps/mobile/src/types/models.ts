import {
  MembershipStatus,
  type AttendanceLog,
  type AttendanceScanResult,
  type ContentOwnerType,
  type EventRegistrationStatus,
  type MemberType,
  type NewsStatus,
  type OrganizationMembership,
  type OrganizationStatus,
  type OrganizationType,
  type StudentEvent,
  type StudentIdentity,
  type StudentProfile,
  type StudentRegistration,
} from '@cict/contracts';

export type {
  AttendanceLog,
  MemberType,
  OrganizationMembership,
  OrganizationStatus,
  OrganizationType,
  StudentEvent,
  StudentIdentity,
  StudentProfile,
  StudentRegistration,
};
export { MembershipStatus };

export type StudentRegistrationStatus = EventRegistrationStatus;
export type AttendanceResult = AttendanceScanResult;

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AnnouncementType = 'general' | 'academic' | 'event' | 'emergency';

export type OfficerItem = {
  position: string;
  name: string;
  photo?: string;
};

export type AwardItem = {
  title: string;
  recipient: string;
  category?: string;
  description?: string;
};

export type AttachmentItem = {
  label: string;
  url: string;
  fileType?: string;
  fileSize?: number;
};

export type ContentSection = {
  heading: string;
  bodyHtml?: string;
  items?: string[];
  style?: 'default' | 'callout' | 'checklist';
  image?: MediaAsset;
  link?: { url: string; label: string };
  embed?: { type: 'video' | 'map' | 'form'; url: string };
};

export type MediaAsset = {
  imageUrl: string;
  alt?: string;
  imageId?: string;
};

export type ApprovalSummary = {
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reason?: string;
};

export type ReferenceLink = {
  label: string;
  url: string;
};

export type Announcement = {
  _id: string;
  title: string;
  content?: string;
  bodyHtml: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  author?: string | { firstName: string; lastName: string; email: string };
  ownerType?: ContentOwnerType | string;
  organizationId?: string | null;
  isActive?: boolean;
  targetAudience?: string[];
  expiresAt?: string;
  coverImage?: MediaAsset;
  gallery?: MediaAsset[];
  sections?: ContentSection[];
  imageUrl?: string;
  status?: NewsStatus | string;
  publishedAt?: string;
  archivedAt?: string;
  approvalSummary?: ApprovalSummary;
  processInstanceId?: string | null;
  subtitle?: string;
  excerpt?: string;
  tags?: string[];
  audience?: string;
  subtype?: string;
  effectiveDate?: string;
  termStart?: string;
  termEnd?: string;
  relatedOrganizationId?: string;
  relatedEventId?: string;
  approvalSource?: string;
  contactName?: string;
  contactEmail?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  officerItems?: OfficerItem[];
  outgoingOfficerItems?: OfficerItem[];
  awardItems?: AwardItem[];
  attachmentItems?: AttachmentItem[];
  createdAt: string;
  updatedAt: string;
};

export type News = {
  _id: string;
  title: string;
  bodyHtml: string;
  excerpt: string;
  status?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  content?: string;
  subtitle?: string;
  coverImage?: MediaAsset;
  gallery?: MediaAsset[];
  sections?: ContentSection[];
  tags?: string[];
  category?: string;
  featured?: boolean;
  pinned?: boolean;
  sourceUrl?: string;
  referenceLinks?: ReferenceLink[];
  attachmentItems?: AttachmentItem[];
  readingTime?: number;
  authorDisplayName?: string;
  authorRole?: string;
  associatedEventId?: string;
  associatedOrganizationId?: string;
  spotlightLabel?: string;
  seoDescription?: string;
  canonicalSlug?: string;
  relatedArticleIds?: string[];
  approvalSummary?: ApprovalSummary;
  ownerType?: string;
  organizationId?: string;
  author?: { firstName: string; lastName: string; email: string } | string;
  organizer?: { firstName: string; lastName: string; email: string };
};

export type HomeUpdate = {
  id: string;
  kind: 'announcement' | 'news';
  title: string;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
  featured?: boolean;
  subtype?: string;
  contactName?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  priority?: AnnouncementPriority;
  readingTime?: number;
};

export type UpdateItemKind = 'news' | 'announcement' | 'event';

export type UpdateItem = {
  id: string;
  kind: UpdateItemKind;
  title: string;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
  priority?: AnnouncementPriority;
  eventDate?: string;
  eventLocation?: string;
  ownerType?: string;
  organizationId?: string;
};

export type OrganizationMember = {
  id: string;
  name: string;
  position: string;
  photo: string;
  bio: string;
  joinedDate?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills?: string[];
  gallery?: string[];
  social?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
};

export type Organization = {
  _id: string;
  id: string;
  name: string;
  fullName: string;
  description: string;
  longDescription: string;
  logo: string;
  banner: string;
  established: string;
  mission: string;
  vision: string;
  values: string[];
  achievements: string[];
  members: OrganizationMember[];
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  building?: string;
  room?: string;
  campus?: string;
  advisorName?: string;
  advisorEmail?: string;
  moderatorName?: string;
  moderatorEmail?: string;
  organizationType?: string;
  tags?: string[];
  gallery?: { imageUrl: string; alt?: string }[];
  seoDescription?: string;
  isActive?: boolean;
};
