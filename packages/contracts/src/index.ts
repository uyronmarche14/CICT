import { z } from 'zod';

export const UserRole = {
  FULL_ADMIN: 'full_admin',
  SEMI_ADMIN: 'semi_admin',
  SUPPORT: 'support',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  SET_USER_STATUS: 'set_user_status',
  VIEW_ORGANIZATION: 'view_organization',
  CREATE_ORGANIZATION: 'create_organization',
  EDIT_ORGANIZATION: 'edit_organization',
  DELETE_ORGANIZATION: 'delete_organization',
  CREATE_NEWS: 'create_news',
  EDIT_NEWS: 'edit_news',
  DELETE_NEWS: 'delete_news',
  PUBLISH_NEWS: 'publish_news',
  ARCHIVE_NEWS: 'archive_news',
  VIEW_NEWS: 'view_news',
  CREATE_ANNOUNCEMENT: 'create_announcement',
  EDIT_ANNOUNCEMENT: 'edit_announcement',
  DELETE_ANNOUNCEMENT: 'delete_announcement',
  PUBLISH_ANNOUNCEMENT: 'publish_announcement',
  ARCHIVE_ANNOUNCEMENT: 'archive_announcement',
  VIEW_ANNOUNCEMENT: 'view_announcement',
  CREATE_MEMBER: 'create_member',
  EDIT_MEMBER: 'edit_member',
  DELETE_MEMBER: 'delete_member',
  VIEW_MEMBER: 'view_member',
  MANAGE_MEMBER_ROLES: 'manage_member_roles',
  VIEW_EVENT: 'view_event',
  CREATE_EVENT: 'create_event',
  EDIT_EVENT: 'edit_event',
  DELETE_EVENT: 'delete_event',
  PUBLISH_EVENT: 'publish_event',
  CANCEL_EVENT: 'cancel_event',
  COMPLETE_EVENT: 'complete_event',
  JOIN_EVENT: 'join_event',
  VIEW_STUDENT: 'view_student',
  CREATE_STUDENT: 'create_student',
  EDIT_STUDENT: 'edit_student',
  SET_STUDENT_STATUS: 'set_student_status',
  VIEW_ACADEMIC_GROUPS: 'view_academic_groups',
  MANAGE_ACADEMIC_GROUPS: 'manage_academic_groups',
  VIEW_EVENT_REGISTRATIONS: 'view_event_registrations',
  MANAGE_EVENT_REGISTRATIONS: 'manage_event_registrations',
  SCAN_EVENT_ATTENDANCE: 'scan_event_attendance',
  SUBMIT_CONTENT_FOR_APPROVAL: 'submit_content_for_approval',
  APPROVE_CONTENT: 'approve_content',
  REJECT_CONTENT: 'reject_content',
  VIEW_PROCESS: 'view_process',
  CREATE_PROCESS: 'create_process',
  EDIT_PROCESS: 'edit_process',
  COMMENT_PROCESS: 'comment_process',
  APPROVE_PROCESS_STEP: 'approve_process_step',
  CREATE_ROLE: 'create_role',
  EDIT_ROLE: 'edit_role',
  DELETE_ROLE: 'delete_role',
  VIEW_ROLE: 'view_role',
  ASSIGN_ROLE: 'assign_role',
  VIEW_LOGS: 'view_logs',
  MANAGE_SETTINGS: 'manage_settings',
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

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

export const StudentStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const EventRegistrationStatus = {
  RESERVED: 'reserved',
  REGISTERED: 'registered',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked_in',
  DENIED: 'denied',
} as const;
export type EventRegistrationStatus =
  (typeof EventRegistrationStatus)[keyof typeof EventRegistrationStatus];

export const AttendanceScanResult = {
  SUCCESS: 'success',
  DUPLICATE: 'duplicate',
  NOT_REGISTERED: 'not_registered',
  EVENT_FULL: 'event_full',
  NOT_ELIGIBLE: 'not_eligible',
  REGISTRATION_CLOSED: 'registration_closed',
  INVALID_QR: 'invalid_qr',
  DENIED: 'denied',
} as const;
export type AttendanceScanResult =
  (typeof AttendanceScanResult)[keyof typeof AttendanceScanResult];

export const NotificationChannel = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
} as const;

export type AdminModuleKey =
  | 'dashboard'
  | 'organizations'
  | 'users'
  | 'students'
  | 'events'
  | 'news'
  | 'announcements'
  | 'roles'
  | 'faq'
  | 'logs'
  | 'processes'
  | 'approvals'
  | 'settings';

export type AdminScopes = {
  global: boolean;
  organizations: string[];
};

export type OrganizationAssignment = {
  id: string;
  organizationId: string;
  organizationName?: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
};

export const OrganizationStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;
export type OrganizationStatus = (typeof OrganizationStatus)[keyof typeof OrganizationStatus];

export const OrganizationType = {
  ACADEMIC: 'academic',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  SPECIAL_INTEREST: 'special_interest',
  OTHER: 'other',
} as const;
export type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType];

export const MembershipStatus = {
  APPLIED: 'applied',
  INVITED: 'invited',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ALUMNI: 'alumni',
  REJECTED: 'rejected',
  RESIGNED: 'resigned',
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const MemberType = {
  OFFICER: 'officer',
  GENERAL: 'general',
  ALUMNI: 'alumni',
  HONORARY: 'honorary',
  ADVISOR: 'advisor',
} as const;
export type MemberType = (typeof MemberType)[keyof typeof MemberType];

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
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  members: OrganizationMember[];
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
  organizationType?: OrganizationType | string;
  tags?: string[];
  gallery?: MediaAsset[];
  seoDescription?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
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
};

export type OrganizationMembership = {
  _id: string;
  studentId: string;
  organizationId: string;
  position: string;
  memberType: MemberType;
  status: MembershipStatus;
  appliedAt?: string;
  invitedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  resignedAt?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: string;
  notes?: string;
  history: MembershipHistoryEntry[];
  contributions?: MembershipContribution[];
  createdAt: string;
  updatedAt: string;
};

export type MembershipHistoryEntry = {
  field: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt: string;
};

export type MembershipContribution = {
  type: string;
  description: string;
  hours?: number;
  date: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  baseRoleLabel: string;
  customRoleId?: string | null;
  customRole?: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  } | null;
  effectiveRoleLabel: string;
  effectiveRoleKind: 'system' | 'custom';
  effectivePermissions: Permission[];
  canAccessAdmin: boolean;
  adminScopes?: AdminScopes;
  visibleAdminModules?: AdminModuleKey[];
  scopedAdminModulesByOrganization?: Record<string, AdminModuleKey[]>;
  organizationAssignments: OrganizationAssignment[];
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthProfile = {
  user: User;
  permissions: Permission[];
  canAccessAdmin: boolean;
  adminScopes?: AdminScopes;
  visibleAdminModules?: AdminModuleKey[];
  scopedAdminModulesByOrganization?: Record<string, AdminModuleKey[]>;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  kind: 'system' | 'custom';
  isEditable: boolean;
  isDeletable: boolean;
  systemRoleKey?: UserRole;
  assignedUserCount?: number;
  createdBy?: string | User | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PermissionMetadataItem = {
  value: Permission;
  label: string;
  description: string;
};

export type PermissionMetadataGroup = {
  key: string;
  label: string;
  permissions: PermissionMetadataItem[];
};

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

export type Event = {
  _id: string;
  title: string;
  description?: string;
  bodyHtml: string;
  excerpt: string;
  organizer: string | { firstName: string; lastName: string; email: string };
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus | string;
  publishedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  attendees: string[];
  maxAttendees?: number;
  coverImage?: MediaAsset;
  gallery: MediaAsset[];
  sections: ContentSection[];
  schedule: EventScheduleItem[];
  imageUrl?: string;
  tags?: string[];
  isRegistrationOpen: boolean;
  registeredCount?: number;
  checkedInCount?: number;
  registrationCloseAt?: string;
  allowWalkIns?: boolean;
  targetProgramIds?: string[];
  targetYearLevelIds?: string[];
  targetSectionIds?: string[];
  approvalSummary?: ApprovalSummary;
  processInstanceId?: string | null;
  registrationUrl?: string;
  registrationDeadline?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  hostOrganizationIds?: string[];
  coHostOrganizationIds?: string[];
  speakerItems?: SpeakerItem[];
  audience?: string;
  eligibility?: string;
  feeLabel?: string;
  certificateInfo?: string;
  venueDetails?: VenueDetails;
  mapUrl?: string;
  meetingUrl?: string;
  requirements?: string;
  attachmentItems?: AttachmentItem[];
  posterCaption?: string;
  createdAt: string;
  updatedAt: string;
};

export type News = {
  _id: string;
  title: string;
  content?: string;
  bodyHtml: string;
  excerpt: string;
  author: string | { firstName: string; lastName: string; email: string };
  ownerType: ContentOwnerType;
  organizationId?: string | null;
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
};

export type Announcement = {
  _id: string;
  title: string;
  content?: string;
  bodyHtml: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  author: string | { firstName: string; lastName: string; email: string };
  ownerType: ContentOwnerType;
  organizationId?: string | null;
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
};

export type StudentEventSection = ContentSection & {
  title?: string;
  content?: string;
};

export type EventScheduleItem = {
  label: string;
  title: string;
  description?: string;
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

export type StudentIdentity = {
  id?: string;
  _id: string;
  studentNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profilePhoto?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  aboutMe?: string;
};

export type StudentProfile = StudentIdentity & {
  status?: StudentStatus | string;
  isActive?: boolean;
  qrVersion?: number;
  programId?:
    | string
    | {
        _id?: string;
        code?: string;
        name?: string;
      };
  yearLevelId?:
    | string
    | {
        _id?: string;
        code?: string;
        label?: string;
        numericLevel?: number;
      };
  sectionId?:
    | string
    | {
        _id?: string;
        name?: string;
        displayName?: string;
      };
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
};

export type StudentRegistration = {
  _id: string;
  eventId:
    | string
    | {
        _id: string;
        title: string;
        startDate: string;
        endDate: string;
        location: string;
        status: string;
      };
  studentId: string;
  status: EventRegistrationStatus;
  qrNonce?: string;
  qrIssuedAt?: string;
  registeredAt: string;
  cancelledAt?: string;
  checkedInAt?: string;
  source: 'self' | 'admin' | 'walk_in';
};

export type StudentEvent = {
  _id: string;
  title: string;
  description?: string;
  bodyHtml: string;
  excerpt: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  coverImage?: MediaAsset;
  imageUrl?: string;
  maxAttendees?: number;
  registeredCount?: number;
  checkedInCount?: number;
  isRegistrationOpen?: boolean;
  registrationCloseAt?: string;
  allowWalkIns?: boolean;
  tags?: string[];
  speakerItems?: SpeakerItem[];
  feeLabel?: string;
  contactName?: string;
  contactEmail?: string;
  venueDetails?: VenueDetails;
  organizer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  sections?: StudentEventSection[];
  schedule?: EventScheduleItem[];
  registration: StudentRegistration | null;
  ownerType?: ContentOwnerType | string;
  organizationId?: string | null;
};

export type AttendanceLog = {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    startDate: string;
    location: string;
  };
  registrationId?: string;
  scanType: 'entry' | 'manual';
  result: AttendanceScanResult;
  scannedByAdminId?: string;
  scannedAt: string;
  notes?: string;
  createdAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type StudentLoginResponse = AuthTokens & {
  student: StudentProfile;
};

export type AuthSession = AuthTokens & {
  student: StudentProfile | null;
};

export type StudentProfileResponse = {
  student: StudentProfile;
};

export type StudentEventsResponse = {
  events: StudentEvent[];
};

export type StudentRegistrationResponse = {
  registration: StudentRegistration | null;
};

export type StudentRegistrationsResponse = {
  registrations: StudentRegistration[];
};

export type StudentQrPayload = {
  token: string;
  registrationId: string;
};

export type StudentAttendanceResponse = {
  attendanceLogs: AttendanceLog[];
};

export type PushTokenRegistrationRequest = {
  token: string;
  platform: 'ios' | 'android';
};

export type PushTokenUnregistrationRequest = {
  token: string;
};

export const userRoleSchema = z.nativeEnum(UserRole);
export const permissionSchema = z.nativeEnum(Permission);
export const contentOwnerTypeSchema = z.nativeEnum(ContentOwnerType);
export const newsStatusSchema = z.nativeEnum(NewsStatus);
export const announcementPrioritySchema = z.nativeEnum(AnnouncementPriority);
export const announcementTypeSchema = z.nativeEnum(AnnouncementType);
export const eventStatusSchema = z.nativeEnum(EventStatus);
export const studentStatusSchema = z.nativeEnum(StudentStatus);
export const eventRegistrationStatusSchema = z.nativeEnum(EventRegistrationStatus);
export const attendanceScanResultSchema = z.nativeEnum(AttendanceScanResult);

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

export const studentProfileSchema: z.ZodType<StudentProfile> = z.object({
  id: z.string().optional(),
  _id: z.string(),
  studentNumber: z.string(),
  email: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),
  profilePhoto: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  aboutMe: z.string().optional(),
  status: z.union([studentStatusSchema, z.string()]).optional(),
  isActive: z.boolean().optional(),
  qrVersion: z.number().optional(),
  programId: z.union([z.string(), z.record(z.unknown())]).optional(),
  yearLevelId: z.union([z.string(), z.record(z.unknown())]).optional(),
  sectionId: z.union([z.string(), z.record(z.unknown())]).optional(),
  enrollmentDate: z.string().optional(),
  expectedGraduationYear: z.number().optional(),
  previousSchool: z.string().optional(),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  guardianRelationship: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  notificationPreferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }).optional(),
});

export const studentRegistrationSchema: z.ZodType<StudentRegistration> = z.object({
  _id: z.string(),
  eventId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      location: z.string(),
      status: z.string(),
    }),
  ]),
  studentId: z.string(),
  status: eventRegistrationStatusSchema,
  qrNonce: z.string().optional(),
  qrIssuedAt: z.string().optional(),
  registeredAt: z.string(),
  cancelledAt: z.string().optional(),
  checkedInAt: z.string().optional(),
  source: z.enum(['self', 'admin', 'walk_in']),
});

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

export const attendanceLogSchema: z.ZodType<AttendanceLog> = z.object({
  _id: z.string(),
  eventId: z.object({
    _id: z.string(),
    title: z.string(),
    startDate: z.string(),
    location: z.string(),
  }),
  registrationId: z.string().optional(),
  scanType: z.enum(['entry', 'manual']),
  result: attendanceScanResultSchema,
  scannedByAdminId: z.string().optional(),
  scannedAt: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const studentLoginResponseSchema: z.ZodType<StudentLoginResponse> =
  authTokensSchema.extend({
    student: studentProfileSchema,
  });

export const studentProfileResponseSchema: z.ZodType<StudentProfileResponse> = z.object({
  student: studentProfileSchema,
});

export const studentEventsResponseSchema: z.ZodType<StudentEventsResponse> = z.object({
  events: z.array(studentEventSchema),
});

export const studentRegistrationResponseSchema: z.ZodType<StudentRegistrationResponse> =
  z.object({
    registration: studentRegistrationSchema.nullable(),
  });

export const studentRegistrationsResponseSchema: z.ZodType<StudentRegistrationsResponse> =
  z.object({
    registrations: z.array(studentRegistrationSchema),
  });

export const studentQrPayloadSchema: z.ZodType<StudentQrPayload> = z.object({
  token: z.string(),
  registrationId: z.string(),
});

export const studentAttendanceResponseSchema: z.ZodType<StudentAttendanceResponse> =
  z.object({
    attendanceLogs: z.array(attendanceLogSchema),
  });

export const pushTokenRegistrationRequestSchema: z.ZodType<PushTokenRegistrationRequest> =
  z.object({
    token: z.string().min(1),
    platform: z.enum(['ios', 'android']),
  });

export const pushTokenUnregistrationRequestSchema: z.ZodType<PushTokenUnregistrationRequest> =
  z.object({
    token: z.string().min(1),
  });

export const organizationStatusSchema = z.nativeEnum(OrganizationStatus);
export const organizationTypeSchema = z.nativeEnum(OrganizationType);
export const membershipStatusSchema = z.nativeEnum(MembershipStatus);
export const memberTypeSchema = z.nativeEnum(MemberType);

export const organizationMemberSchema: z.ZodType<OrganizationMember> = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  photo: z.string(),
  bio: z.string(),
  joinedDate: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  timeline: z.array(z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(['achievement', 'project', 'milestone', 'award', 'education']),
    details: z.array(z.string()).optional(),
  })).optional(),
  gallery: z.array(z.string()).optional(),
  social: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  phone: z.string().optional(),
  personalEmail: z.string().optional(),
  program: z.string().optional(),
  yearLevel: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  memberType: z.enum(['officer', 'general', 'alumni', 'honorary', 'advisor']).optional(),
  status: z.enum(['active', 'inactive', 'alumni']).optional(),
  sortOrder: z.number().optional(),
  batch: z.string().optional(),
});

export const organizationSchema: z.ZodType<Organization> = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  description: z.string(),
  longDescription: z.string(),
  logo: z.string(),
  banner: z.string(),
  established: z.string(),
  mission: z.string(),
  vision: z.string(),
  values: z.array(z.string()),
  achievements: z.array(z.string()),
  color: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  members: z.array(organizationMemberSchema),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  building: z.string().optional(),
  room: z.string().optional(),
  campus: z.string().optional(),
  advisorName: z.string().optional(),
  advisorEmail: z.string().optional(),
  moderatorName: z.string().optional(),
  moderatorEmail: z.string().optional(),
  organizationType: z.union([organizationTypeSchema, z.string()]).optional(),
  tags: z.array(z.string()).optional(),
  gallery: z.array(mediaAssetSchema).optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const membershipHistoryEntrySchema: z.ZodType<MembershipHistoryEntry> = z.object({
  field: z.string(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  changedBy: z.string().optional(),
  changedAt: z.string(),
});

export const membershipContributionSchema: z.ZodType<MembershipContribution> = z.object({
  type: z.string(),
  description: z.string(),
  hours: z.number().optional(),
  date: z.string(),
});

export const organizationMembershipSchema: z.ZodType<OrganizationMembership> = z.object({
  _id: z.string(),
  studentId: z.string(),
  organizationId: z.string(),
  position: z.string(),
  memberType: memberTypeSchema,
  status: membershipStatusSchema,
  appliedAt: z.string().optional(),
  invitedAt: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  resignedAt: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
  notes: z.string().optional(),
  history: z.array(membershipHistoryEntrySchema),
  contributions: z.array(membershipContributionSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
