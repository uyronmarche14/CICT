export const queryKeys = {
  auth: ['auth'] as const,
  me: ['student', 'me'] as const,
  updates: ['updates'] as const,
  studentEvents: ['student', 'events'] as const,
  publicEvent: (eventId: string) => ['public', 'event', eventId] as const,
  registration: (eventId: string) => ['student', 'registration', eventId] as const,
  registrations: ['student', 'registrations'] as const,
  attendance: ['student', 'attendance'] as const,
  news: ['news'] as const,
  newsDetail: (id: string) => ['news', id] as const,
  announcements: ['announcements'] as const,
  announcementDetail: (id: string) => ['announcements', id] as const,
};
