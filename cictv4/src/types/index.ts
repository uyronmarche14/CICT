export enum UserRole {
  FULL_ADMIN = 'full_admin',
  SEMI_ADMIN = 'semi_admin',
  SUPPORT = 'support',
}

export enum Permission {
  // User Account Management
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',
  SET_USER_STATUS = 'set_user_status',

  // Organization Management
  VIEW_ORGANIZATION = 'view_organization',
  CREATE_ORGANIZATION = 'create_organization',
  EDIT_ORGANIZATION = 'edit_organization',
  DELETE_ORGANIZATION = 'delete_organization',

  // News Management
  CREATE_NEWS = 'create_news',
  EDIT_NEWS = 'edit_news',
  DELETE_NEWS = 'delete_news',
  PUBLISH_NEWS = 'publish_news',
  ARCHIVE_NEWS = 'archive_news',
  VIEW_NEWS = 'view_news',
  
  // Announcement Management
  CREATE_ANNOUNCEMENT = 'create_announcement',
  EDIT_ANNOUNCEMENT = 'edit_announcement',
  DELETE_ANNOUNCEMENT = 'delete_announcement',
  PUBLISH_ANNOUNCEMENT = 'publish_announcement',
  ARCHIVE_ANNOUNCEMENT = 'archive_announcement',
  VIEW_ANNOUNCEMENT = 'view_announcement',
  
  // Member Management
  CREATE_MEMBER = 'create_member',
  EDIT_MEMBER = 'edit_member',
  DELETE_MEMBER = 'delete_member',
  VIEW_MEMBER = 'view_member',
  MANAGE_MEMBER_ROLES = 'manage_member_roles',
  
  // Event Management
  VIEW_EVENT = 'view_event',
  CREATE_EVENT = 'create_event',
  EDIT_EVENT = 'edit_event',
  DELETE_EVENT = 'delete_event',
  PUBLISH_EVENT = 'publish_event',
  CANCEL_EVENT = 'cancel_event',
  COMPLETE_EVENT = 'complete_event',
  JOIN_EVENT = 'join_event',

  VIEW_STUDENT = 'view_student',
  CREATE_STUDENT = 'create_student',
  EDIT_STUDENT = 'edit_student',
  SET_STUDENT_STATUS = 'set_student_status',
  VIEW_ACADEMIC_GROUPS = 'view_academic_groups',
  MANAGE_ACADEMIC_GROUPS = 'manage_academic_groups',
  VIEW_EVENT_REGISTRATIONS = 'view_event_registrations',
  MANAGE_EVENT_REGISTRATIONS = 'manage_event_registrations',
  SCAN_EVENT_ATTENDANCE = 'scan_event_attendance',
  SUBMIT_CONTENT_FOR_APPROVAL = 'submit_content_for_approval',
  APPROVE_CONTENT = 'approve_content',
  REJECT_CONTENT = 'reject_content',
  VIEW_PROCESS = 'view_process',
  CREATE_PROCESS = 'create_process',
  EDIT_PROCESS = 'edit_process',
  COMMENT_PROCESS = 'comment_process',
  APPROVE_PROCESS_STEP = 'approve_process_step',

  // Role Management
  CREATE_ROLE = 'create_role',
  EDIT_ROLE = 'edit_role',
  DELETE_ROLE = 'delete_role',
  VIEW_ROLE = 'view_role',
  ASSIGN_ROLE = 'assign_role',
  
  // System
  VIEW_LOGS = 'view_logs',
  MANAGE_SETTINGS = 'manage_settings',
}

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

export interface AdminScopes {
  global: boolean;
  organizations: string[];
}

export interface PermissionMetadataItem {
  value: Permission;
  label: string;
  description: string;
}

export interface PermissionMetadataGroup {
  key: string;
  label: string;
  permissions: PermissionMetadataItem[];
}

export interface User {
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
}

export interface AuthProfile {
  user: User;
  permissions: Permission[];
  canAccessAdmin: boolean;
  adminScopes?: AdminScopes;
  visibleAdminModules?: AdminModuleKey[];
  scopedAdminModulesByOrganization?: Record<string, AdminModuleKey[]>;
}

export interface Role {
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
}

export interface MediaAsset {
  imageUrl: string;
  imageId?: string;
  assetFingerprint?: string;
  alt: string;
  caption?: string;
  sortOrder?: number;
}

export interface ContentSection {
  heading: string;
  style: 'default' | 'callout' | 'checklist';
  bodyHtml?: string;
  items?: string[];
}

export interface EventScheduleItem {
  label: string;
  title: string;
  description?: string;
}

export enum ContentOwnerType {
  SYSTEM = 'system',
  ORGANIZATION = 'organization',
}

export interface OrganizationAssignment {
  id: string;
  organizationId: string;
  organizationName?: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface OrganizationAdminAssignment extends OrganizationAssignment {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export enum NewsStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
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
  createdAt: string;
  updatedAt: string;
}

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementType {
  GENERAL = 'general',
  ACADEMIC = 'academic',
  EVENT = 'event',
  EMERGENCY = 'emergency',
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
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalSummary {
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
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
