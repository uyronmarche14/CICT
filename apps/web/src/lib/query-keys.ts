export const queryKeys = {
  news: {
    all: ['news'] as const,
    list: (page: number, limit?: number, status?: string) =>
      ['news', 'list', page, limit, status] as const,
    detail: (id: string) => ['news', 'detail', id] as const,
  },
  events: {
    all: ['events'] as const,
    list: (page: number, limit?: number, filters?: Record<string, unknown>) =>
      ['events', 'list', page, limit, filters] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
  },
  announcements: {
    all: ['announcements'] as const,
    list: (page: number, limit?: number, scope?: string) =>
      ['announcements', 'list', page, limit, scope] as const,
    detail: (id: string) => ['announcements', 'detail', id] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
  },
  faq: {
    all: ['faq'] as const,
  },
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard-summary'] as const,
  },
  student: {
    profile: ['student', 'profile'] as const,
    events: ['student', 'events'] as const,
    registrations: ['student', 'registrations'] as const,
  },
  updatesHub: {
    feed: (source: string, category: string, scope: string) =>
      ['updates-hub', 'feed', source, category, scope] as const,
    featured: (source: string) => ['updates-hub', 'featured', source] as const,
  },
  permissionsMetadata: {
    all: ['permissions-metadata'] as const,
  },
};
