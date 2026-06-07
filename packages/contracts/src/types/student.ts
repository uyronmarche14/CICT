import type { StudentStatus } from '../enums/student';
import type { EventRegistrationStatus } from '../enums/student';
import type { AttendanceScanResult } from '../enums/student';
import type { MediaAsset } from './common';
import type { SpeakerItem } from './common';
import type { VenueDetails } from './common';
import type { EventScheduleItem } from './common';
import type { StudentEventSection } from './common';
import type { ContentOwnerType } from '../enums/content';

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

export type AuthSession = AuthTokens & {
  student: StudentProfile | null;
};

export type StudentLoginResponse = AuthTokens & {
  student: StudentProfile;
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

import type { AuthTokens } from './auth';
