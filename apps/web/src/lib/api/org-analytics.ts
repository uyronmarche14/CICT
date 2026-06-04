import api from './axios';

interface AnalyticsOverview {
  members: number;
  tasksCompleted: number;
  tasksCompletionRate: number;
  meetingsHeld: number;
  meetingAttendanceRate: number;
  budgetUtilization: number;
  engagementScore: number;
}

interface EngagementData {
  score: number;
  activeMembers: number;
  totalContributions: number;
  totalHours: number;
}

interface TaskAnalytics {
  byStatus: Array<{ name: string; value: number }>;
  byPriority: Array<{ name: string; value: number }>;
  completionRate: number;
  overdueCount: number;
}

interface EventAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  attendanceRate: number;
  byMonth: Array<{ month: string; registrations: number; attendance: number }>;
}

interface FinancialAnalytics {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budgetAmount: number;
  budgetUsed: number;
  budgetUtilization: number;
  byCategory: Array<{ category: string; income: number; expense: number }>;
}

interface TaskForceAnalytics {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  objectivesTotal: number;
  objectivesCompleted: number;
}

interface ResourceAnalytics {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ resourceType: string; count: number }>;
}

interface PartnershipAnalytics {
  total: number;
  byStatus: Record<string, number>;
}

interface CollaborationAnalytics {
  totalSpaces: number;
  activeSpaces: number;
  totalMessages: number;
}

interface MentorshipAnalytics {
  total: number;
  byStatus: Record<string, number>;
  totalSessions: number;
  avgSessionsPerMentorship: number;
}

interface SharedContentAnalytics {
  outgoing: number;
  incoming: number;
  total: number;
  byType: Array<{ contentType: string; count: number }>;
}

export const analyticsAPI = {
  getOverview: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: AnalyticsOverview }>(`/organizations/${orgId}/analytics/overview`);
    return res.data.data;
  },
  getEngagement: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: EngagementData }>(`/organizations/${orgId}/analytics/engagement`);
    return res.data.data;
  },
  getTasks: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: TaskAnalytics }>(`/organizations/${orgId}/analytics/tasks`);
    return res.data.data;
  },
  getEvents: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: EventAnalytics }>(`/organizations/${orgId}/analytics/events`);
    return res.data.data;
  },
  getFinancial: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: FinancialAnalytics }>(`/organizations/${orgId}/analytics/financial`);
    return res.data.data;
  },
  getTaskForces: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: TaskForceAnalytics }>(`/organizations/${orgId}/analytics/task-forces`);
    return res.data.data;
  },
  getResources: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: ResourceAnalytics }>(`/organizations/${orgId}/analytics/resources`);
    return res.data.data;
  },
  getPartnerships: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: PartnershipAnalytics }>(`/organizations/${orgId}/analytics/partnerships`);
    return res.data.data;
  },
  getCollaborations: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: CollaborationAnalytics }>(`/organizations/${orgId}/analytics/collaborations`);
    return res.data.data;
  },
  getMentorships: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: MentorshipAnalytics }>(`/organizations/${orgId}/analytics/mentorships`);
    return res.data.data;
  },
  getSharedContent: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: SharedContentAnalytics }>(`/organizations/${orgId}/analytics/shared-content`);
    return res.data.data;
  },
};
