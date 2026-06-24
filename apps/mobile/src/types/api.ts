import type { Announcement, HomeUpdate, News } from '@/types/models';

export type {
  AdminLoginResponse,
  AdminAccessPolicy,
  AdminModuleKey,
  AuthProfile,
  AuthSession,
  AuthTokens,
  MobileSession,
  StudentAttendanceResponse,
  StudentEventsResponse,
  StudentLoginResponse,
  StudentMobileSession,
  StudentProfileResponse,
  StudentQrPayload,
  StudentRegistrationResponse,
  StudentRegistrationsResponse,
} from '@cict/contracts/types';

export type AnnouncementsResponse = {
  announcements: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type NewsResponse = {
  news: News[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type HomeUpdatesResponse = {
  items: HomeUpdate[];
};
