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
};
