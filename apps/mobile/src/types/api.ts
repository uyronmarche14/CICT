import type { Announcement, HomeUpdate, News } from '@/types/models';

export type {
  AuthSession,
  AuthTokens,
  StudentAttendanceResponse,
  StudentEventsResponse,
  StudentLoginResponse,
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
