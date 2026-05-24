import { Document, Types } from 'mongoose';
import {
  AnnouncementPriority,
  AnnouncementType,
  AttendanceScanResult,
  ContentOwnerType,
  EventRegistrationStatus,
  EventStatus,
  NewsStatus,
  Permission,
  StudentStatus,
  UserRole,
} from '@cict/contracts';

export {
  AnnouncementPriority,
  AnnouncementType,
  AttendanceScanResult,
  ContentOwnerType,
  EventRegistrationStatus,
  EventStatus,
  NewsStatus,
  Permission,
  StudentStatus,
  UserRole,
};

// User Interface
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  customRole?: Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Role Interface
export interface IRole extends Document {
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMediaAsset {
  imageUrl: string;
  imageId?: string;
  assetFingerprint?: string;
  alt: string;
  caption?: string;
  sortOrder?: number;
}

export interface IContentSection {
  heading: string;
  style: 'default' | 'callout' | 'checklist';
  bodyHtml?: string;
  items?: string[];
}

export interface IEventScheduleItem {
  label: string;
  title: string;
  description?: string;
}

// News Interface
export interface INews extends Document {
  title: string;
  content?: string;
  bodyHtml: string;
  excerpt: string;
  author: string | IUser;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  status: NewsStatus;
  publishedAt?: Date;
  archivedAt?: Date;
  approvalSummary?: IApprovalSummary;
  processInstanceId?: string | null;
  tags: string[];
  coverImage?: IMediaAsset;
  gallery: IMediaAsset[];
  sections: IContentSection[];
  imageUrl?: string;
  imageId?: string; // Cloudinary public ID
  createdAt: Date;
  updatedAt: Date;
}

// Announcement Interface
export interface IAnnouncement extends Document {
  title: string;
  content?: string;
  bodyHtml: string;
  author: string | IUser;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  status: NewsStatus;
  isActive: boolean;
  publishedAt?: Date;
  archivedAt?: Date;
  approvalSummary?: IApprovalSummary;
  processInstanceId?: string | null;
  expiresAt?: Date;
  targetAudience: string[];
  coverImage?: IMediaAsset;
  gallery: IMediaAsset[];
  sections: IContentSection[];
  imageUrl?: string;
  imageId?: string; // Cloudinary public ID
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log Interface
export interface IActivityLog extends Document {
  user?: string | IUser;
  actorType?: 'admin' | 'student' | 'system';
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  organizationId?: string;
  eventId?: string;
  studentId?: string;
  outcome?: 'success' | 'failure' | 'denied' | 'duplicate';
  severity?: 'info' | 'warn' | 'critical';
  reasonCode?: string;
  correlationId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IApprovalSummary {
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

// Event Interface
export interface IEvent extends Document {
  title: string;
  description?: string;
  bodyHtml: string;
  excerpt: string;
  organizer: string | IUser;
  ownerType: ContentOwnerType;
  organizationId?: string | null;
  startDate: Date;
  endDate: Date;
  location: string;
  status: EventStatus;
  publishedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  attendees: Array<string | IUser>;
  maxAttendees?: number;
  coverImage?: IMediaAsset;
  gallery: IMediaAsset[];
  sections: IContentSection[];
  schedule: IEventScheduleItem[];
  imageUrl?: string;
  imageId?: string; // Cloudinary public ID
  tags: string[];
  isRegistrationOpen: boolean;
  registeredCount?: number;
  checkedInCount?: number;
  registrationCloseAt?: Date;
  allowWalkIns?: boolean;
  targetProgramIds?: Array<string>;
  targetYearLevelIds?: Array<string>;
  targetSectionIds?: Array<string>;
  approvalSummary?: IApprovalSummary;
  processInstanceId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  customRole?: string;
}

export interface IOrganizationAssignment extends Document {
  user: string | IUser;
  organizationId: string;
  role: string | IRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFAQTopic {
  id: string;
  label: string;
}

export interface IFAQEntry {
  category: string;
  question: string;
  answer: string;
}

export interface IFAQContent extends Document {
  key: string;
  title: string;
  subtitle: string;
  topics: IFAQTopic[];
  questions: IFAQEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IResolvedOrganizationAssignment {
  id: string;
  organizationId: string;
  organizationName?: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface IAdminScopes {
  global: boolean;
  organizations: string[];
}

export type AdminModule =
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

export type IScopedAdminModulesByOrganization = Record<string, AdminModule[]>;

export interface IPermissionMetadata {
  value: Permission;
  label: string;
  description: string;
  group: string;
}

export interface IAuthenticatedUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  customRole?: string;
  customRoleDetails?: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  } | null;
  permissions: Permission[];
  baseRoleLabel?: string;
  effectiveRoleLabel: string;
  effectiveRoleKind?: 'system' | 'custom';
  canAccessAdmin: boolean;
  adminScopes?: IAdminScopes;
  visibleAdminModules?: AdminModule[];
  scopedAdminModulesByOrganization?: IScopedAdminModulesByOrganization;
  organizationAssignments?: IResolvedOrganizationAssignment[];
  isActive: boolean;
}

// Organization Member Interface
export interface IOrganizationMember {
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

// Organization Interface
export interface IOrganization extends Document {
  id: string; // slug like 'ict-sf'
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
  members: IOrganizationMember[];
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgram extends Document {
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IYearLevel extends Document {
  code: string;
  label: string;
  numericLevel: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISection extends Document {
  programId: Types.ObjectId | IProgram;
  yearLevelId: Types.ObjectId | IYearLevel;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends Document {
  studentNumber: string;
  email?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  programId: Types.ObjectId | IProgram;
  yearLevelId: Types.ObjectId | IYearLevel;
  sectionId: Types.ObjectId | ISection;
  status: StudentStatus;
  isActive: boolean;
  lastLoginAt?: Date;
  qrVersion: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IStudentSession extends Document {
  studentId: Types.ObjectId | IStudent;
  tokenHash: string;
  deviceLabel?: string;
  platform?: string;
  lastUsedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventRegistration extends Document {
  eventId: Types.ObjectId | IEvent;
  studentId: Types.ObjectId | IStudent;
  status: EventRegistrationStatus;
  qrNonce: string;
  qrIssuedAt?: Date;
  registeredAt?: Date;
  cancelledAt?: Date;
  checkedInAt?: Date;
  eligibilitySnapshot?: {
    programId?: string;
    yearLevelId?: string;
    sectionId?: string;
  };
  scanCount: number;
  source: 'self' | 'admin' | 'walk_in';
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventAttendanceLog extends Document {
  eventId: Types.ObjectId | IEvent;
  registrationId?: Types.ObjectId | IEventRegistration;
  studentId?: Types.ObjectId | IStudent;
  scanType: 'entry' | 'manual';
  result: AttendanceScanResult;
  scannedByAdminId?: Types.ObjectId | IUser | string;
  scannedAt: Date;
  scannerDevice?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentApprovalAction extends Document {
  contentType: 'news' | 'announcement' | 'event';
  contentId: string;
  action:
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'archived'
    | 'returned_to_draft';
  actorUserId: Types.ObjectId | IUser | string;
  reason?: string;
  comment?: string;
  fromStatus?: string;
  toStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcessNode {
  id: string;
  type: 'start' | 'task' | 'approval' | 'document_requirement' | 'comment_review' | 'end';
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface IProcessEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, unknown>;
}

export interface IProcessTemplate extends Document {
  title: string;
  description?: string;
  processType: string;
  organizationScope?: string | null;
  createdBy: Types.ObjectId | IUser;
  nodes: IProcessNode[];
  edges: IProcessEdge[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcessInstance extends Document {
  templateId?: Types.ObjectId | IProcessTemplate;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  linkedContentType?: 'news' | 'announcement' | 'event';
  linkedContentId?: string;
  organizationId?: string | null;
  createdBy: Types.ObjectId | IUser;
  assignedTo: string[];
  nodesSnapshot: IProcessNode[];
  edgesSnapshot: IProcessEdge[];
  currentNodeIds: string[];
  comments: Array<{
    authorId: string;
    body: string;
    createdAt: Date;
  }>;
  requirements: Array<{
    id: string;
    label: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: Date;
  }>;
  approvalSteps: Array<{
    nodeId: string;
    status: 'pending' | 'approved' | 'rejected';
    actorId?: string;
    actedAt?: Date;
    reason?: string;
  }>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentJWTPayload {
  studentId: string;
  studentNumber: string;
  email?: string;
  actorType: 'student';
  sessionId?: string;
}

export interface IAuthenticatedStudent {
  studentId: string;
  studentNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  status: StudentStatus;
  isActive: boolean;
  qrVersion: number;
  programId: string;
  yearLevelId: string;
  sectionId: string;
}
