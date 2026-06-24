import {
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  NewsStatus,
  Permission,
  StudentStatus,
  UserRole,
  OrganizationType,
  OrganizationStatus,
  MembershipStatus,
  MemberType,
  ProcessNodeType,
  ProcessInstanceStatus,
} from '@cict/contracts/enums';
import type {
  AdminModuleKey,
  AdminAccessPolicy,
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
  OrganizationMembership,
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
  NodeAssignment,
} from '@cict/contracts/types';

export {
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  NewsStatus,
  Permission,
  StudentStatus,
  UserRole,
  OrganizationType,
  OrganizationStatus,
  MembershipStatus,
  MemberType,
  ProcessNodeType,
  ProcessInstanceStatus,
};

export type {
  AdminModuleKey,
  AdminAccessPolicy,
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
  OrganizationMembership,
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
  NodeAssignment,
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

export type InquiryStatus = 'new' | 'read' | 'archived';

export interface Inquiry {
  _id: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  userType: string;
  subject: string;
  inquiryType: string;
  message: string;
  status: InquiryStatus;
  source?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  membershipId?: string;
  studentId?: string;
  isPublic?: boolean;
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
  phone?: string;
  personalEmail?: string;
  program?: string;
  yearLevel?: string;
  startDate?: string;
  endDate?: string;
  memberType?: 'officer' | 'general' | 'alumni' | 'honorary' | 'advisor';
  status?: 'active' | 'inactive' | 'alumni';
  sortOrder?: number;
  batch?: string;
  termStart?: string;
  termEnd?: string;
  leadershipStatus?: 'current' | 'past' | 'emeritus';
  course?: string;
  department?: string;
  committee?: string;
  displayOrder?: number;
  isAdviser?: boolean;
  contactNumber?: string;
  projectItems?: Array<{ name: string; role?: string; description?: string; date?: string; url?: string }>;
  milestoneItems?: Array<{ title: string; date?: string; description?: string; category?: string }>;
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
  gallery?: MediaAsset[];
  seoDescription?: string;
  isActive?: boolean;
  tagline?: string;
  officialEmail?: string;
  socialLinks?: Array<{ platform: string; url: string; label?: string }>;
  adviserItems?: Array<{ name: string; role?: string; email?: string; photo?: string }>;
  officeLocation?: { building?: string; room?: string; campus?: string; mapUrl?: string };
  meetingSchedule?: string;
  membershipSize?: number;
  joinRequirements?: string;
  joinSteps?: string[];
  joinUrl?: string;
  benefits?: string;
  programs?: Array<{ name: string; description?: string; schedule?: string; icon?: string }>;
  flagshipEvents?: Array<{ name: string; description?: string; frequency?: string; eventId?: string }>;
  partnerItems?: Array<{ name: string; logo?: string; website?: string; description?: string; partnershipType?: string }>;
  committeeItems?: Array<{ name: string; description?: string; headName?: string; memberCount?: number; icon?: string }>;
  structuredAchievements?: Array<{ title: string; date?: string; description?: string; category?: string; imageUrl?: string }>;
  createdAt: string;
  updatedAt: string;
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
  profilePhoto?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  aboutMe?: string;
  enrollmentDate?: string;
  expectedGraduationYear?: number;
  previousSchool?: string;
  guardianName?: string;
  guardianContact?: string;
  guardianRelationship?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
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
  seoDescription?: string;
  isActive?: boolean;
  tagline?: string;
  officialEmail?: string;
  socialLinks?: Array<{ platform: string; url: string; label?: string }>;
  adviserItems?: Array<{ name: string; role?: string; email?: string; photo?: string }>;
  officeLocation?: { building?: string; room?: string; campus?: string; mapUrl?: string };
  meetingSchedule?: string;
  membershipSize?: number;
  joinRequirements?: string;
  joinSteps?: string[];
  joinUrl?: string;
  benefits?: string;
  programs?: Array<{ name: string; description?: string; schedule?: string; icon?: string }>;
  flagshipEvents?: Array<{ name: string; description?: string; frequency?: string; eventId?: string }>;
  partnerItems?: Array<{ name: string; logo?: string; website?: string; description?: string; partnershipType?: string }>;
  committeeItems?: Array<{ name: string; description?: string; headName?: string; memberCount?: number; icon?: string }>;
  structuredAchievements?: Array<{ title: string; date?: string; description?: string; category?: string; imageUrl?: string }>;
}
