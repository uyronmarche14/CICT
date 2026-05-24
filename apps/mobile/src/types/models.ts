import type {
  AttendanceLog,
  AttendanceScanResult,
  EventRegistrationStatus,
  StudentEvent,
  StudentIdentity,
  StudentProfile,
  StudentRegistration,
} from '@cict/contracts';

export type {
  AttendanceLog,
  StudentEvent,
  StudentIdentity,
  StudentProfile,
  StudentRegistration,
};

export type StudentRegistrationStatus = EventRegistrationStatus;
export type AttendanceResult = AttendanceScanResult;

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AnnouncementType = 'general' | 'academic' | 'event' | 'emergency';

export type Announcement = {
  _id: string;
  title: string;
  content?: string;
  bodyHtml: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
};

export type News = {
  _id: string;
  title: string;
  bodyHtml: string;
  excerpt: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
};

export type HomeUpdate = {
  id: string;
  kind: 'announcement' | 'news';
  title: string;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
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
};
