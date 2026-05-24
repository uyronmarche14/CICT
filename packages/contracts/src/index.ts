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
  | 'processes';

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

export type ApprovalSummary = {
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
};

export type StudentIdentity = {
  id?: string;
  _id: string;
  studentNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
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

export const studentProfileSchema: z.ZodType<StudentProfile> = z.object({
  id: z.string().optional(),
  _id: z.string(),
  studentNumber: z.string(),
  email: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),
  status: z.union([studentStatusSchema, z.string()]).optional(),
  isActive: z.boolean().optional(),
  qrVersion: z.number().optional(),
  programId: z.union([z.string(), z.record(z.unknown())]).optional(),
  yearLevelId: z.union([z.string(), z.record(z.unknown())]).optional(),
  sectionId: z.union([z.string(), z.record(z.unknown())]).optional(),
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

export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
