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
  orgTasks: {
    all: (orgId: string) => ['org-tasks', orgId] as const,
    detail: (orgId: string, taskId: string) => ['org-tasks', orgId, taskId] as const,
  },
  orgMeetings: {
    all: (orgId: string) => ['org-meetings', orgId] as const,
    detail: (orgId: string, meetingId: string) => ['org-meetings', orgId, meetingId] as const,
  },
  orgVotes: {
    all: (orgId: string) => ['org-votes', orgId] as const,
    detail: (orgId: string, voteId: string) => ['org-votes', orgId, voteId] as const,
    results: (orgId: string, voteId: string) => ['org-votes', orgId, voteId, 'results'] as const,
  },
  orgBudget: {
    overview: (orgId: string) => ['org-budget', orgId] as const,
    transactions: (orgId: string) => ['org-budget', orgId, 'transactions'] as const,
  },
  orgTemplates: {
    all: ['org-templates'] as const,
    detail: (id: string) => ['org-templates', id] as const,
  },
  orgAnalytics: {
    overview: (orgId: string) => ['org-analytics', orgId, 'overview'] as const,
    engagement: (orgId: string) => ['org-analytics', orgId, 'engagement'] as const,
    tasks: (orgId: string) => ['org-analytics', orgId, 'tasks'] as const,
    events: (orgId: string) => ['org-analytics', orgId, 'events'] as const,
    financial: (orgId: string) => ['org-analytics', orgId, 'financial'] as const,
  },
  orgPartnerships: {
    all: (orgId: string) => ['org-partnerships', orgId] as const,
  },
  orgCollaborations: {
    all: (orgId: string) => ['org-collaborations', orgId] as const,
    detail: (orgId: string, id: string) => ['org-collaborations', orgId, id] as const,
    messages: (orgId: string, spaceId: string) => ['org-collaborations', orgId, spaceId, 'messages'] as const,
  },
  orgSharedContent: {
    incoming: (orgId: string) => ['org-shared-content', orgId, 'incoming'] as const,
    outgoing: (orgId: string) => ['org-shared-content', orgId, 'outgoing'] as const,
  },
  orgTaskForces: {
    all: (orgId: string) => ['org-task-forces', orgId] as const,
    detail: (orgId: string, id: string) => ['org-task-forces', orgId, id] as const,
  },
  orgResources: {
    outgoing: (orgId: string) => ['org-resources', orgId, 'outgoing'] as const,
    incoming: (orgId: string) => ['org-resources', orgId, 'incoming'] as const,
  },
  orgMentorships: {
    all: (orgId: string) => ['org-mentorships', orgId] as const,
  },
};
