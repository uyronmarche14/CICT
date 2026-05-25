import {
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  NewsStatus,
  Permission,
  UserRole,
} from '@cict/contracts';
import type {
  AdminModuleKey,
  AdminScopes,
  ApprovalActionItem,
  ApprovalSummary,
  ApprovalQueueItem,
  ApprovalStats,
  AuthProfile,
  ContentSection,
  EventScheduleItem,
  MediaAsset,
  OrganizationAssignment,
  PermissionMetadataGroup,
  PermissionMetadataItem,
  Role,
  User,
  ReferenceLink,
  AttachmentItem,
  OfficerItem,
  AwardItem,
  SpeakerItem,
  VenueDetails,
  StudentEvent,
} from '@cict/contracts';

export {
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  NewsStatus,
  Permission,
  UserRole,
};

export type {
  AdminModuleKey,
  AdminScopes,
  ApprovalActionItem,
  ApprovalSummary,
  ApprovalQueueItem,
  ApprovalStats,
  AuthProfile,
  ContentSection,
  EventScheduleItem,
  MediaAsset,
  OrganizationAssignment,
  PermissionMetadataGroup,
  PermissionMetadataItem,
  Role,
  User,
  ReferenceLink,
  AttachmentItem,
  OfficerItem,
  AwardItem,
  SpeakerItem,
  VenueDetails,
  StudentEvent,
};

export interface OrganizationAdminAssignment extends OrganizationAssignment {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export interface News {
  _id: string;
  title: string;
  content?: string;
  bodyHtml: string;
  excerpt: string;
  author: string | User;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  organizationName?: string | null;
  status: NewsStatus;
  publishedAt?: string;
  archivedAt?: string;
  approvalSummary?: ApprovalSummary;
  processInstanceId?: string | null;
  tags: string[];
  coverImage?: MediaAsset;
  gallery: MediaAsset[];
  sections: ContentSection[];
  imageUrl?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content?: string;
  bodyHtml: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  author: string | User;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  organizationName?: string | null;
  isActive: boolean;
  targetAudience: string[];
  expiresAt?: string;
  coverImage?: MediaAsset;
  gallery: MediaAsset[];
  sections: ContentSection[];
  imageUrl?: string;
  status?: NewsStatus;
  publishedAt?: string;
  archivedAt?: string;
  approvalSummary?: ApprovalSummary;
  processInstanceId?: string | null;
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
}

export interface FAQTopic {
  id: string;
  label: string;
}

export interface FAQEntry {
  category: string;
  question: string;
  answer: string;
}

export interface FAQContent {
  key?: string;
  title: string;
  subtitle: string;
  topics: FAQTopic[];
  questions: FAQEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationMember {
  id: string;
  name: string;
  position: string;
  photo: string;
  bio: string;
  joinedDate?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills?: string[];
  timeline?: {
    year: string;
    title: string;
    description: string;
    category: 'achievement' | 'project' | 'milestone' | 'award' | 'education';
    details?: string[];
  }[];
  gallery?: string[];
  social?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

export interface Organization {
  _id: string;
  id: string; // slug
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
  adminAssignments?: OrganizationAdminAssignment[];
  createdAt: string;
  updatedAt: string;
}

export enum StudentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface Program {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface YearLevel {
  _id: string;
  code: string;
  label: string;
  numericLevel: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  _id: string;
  programId:
    | string
    | {
        _id: string;
        code: string;
        name: string;
      };
  yearLevelId:
    | string
    | {
        _id: string;
        code: string;
        label: string;
        numericLevel: number;
      };
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  studentNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  programId:
    | string
    | {
        _id: string;
        code: string;
        name: string;
      };
  yearLevelId:
    | string
    | {
        _id: string;
        code: string;
        label: string;
        numericLevel: number;
      };
  sectionId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  status: StudentStatus;
  isActive: boolean;
  lastLoginAt?: string;
  qrVersion: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAuthProfile {
  accessToken: string;
  refreshToken: string;
  student: Student;
}

export interface DashboardSummary {
  cards: {
    users: number;
    students: number;
    news: number;
    announcements: number;
    roles: number;
    organizations: number;
    events: number;
  };
  visibleModules: AdminModuleKey[];
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: Permission[];
}

export type UpdateRoleInput = CreateRoleInput;

export interface AssignUserRoleInput {
  role?: UserRole;
  customRoleId?: string | null;
}

export interface OrganizationAssignmentInput {
  organizationId: string;
  roleId: string;
}

export interface OrganizationInput {
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
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
