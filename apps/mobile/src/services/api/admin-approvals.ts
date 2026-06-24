import { client } from '@/services/api/client';

export type ApprovalQueueItem = {
  _id: string;
  contentType: 'event' | 'news' | 'announcement';
  contentId: string;
  title: string;
  status: string;
  submittedAt: string;
  submittedBy: { _id: string; firstName: string; lastName: string };
  organizationId?: string | null;
  organizationName?: string | null;
  ownerType: string;
};

export type ApprovalStats = {
  pending: number;
  byType: { events: number; news: number; announcements: number };
};

export type PendingMembership = {
  _id: string;
  studentId: { _id: string; studentNumber: string; firstName: string; lastName: string };
  organizationId: { _id: string; name: string };
  status: string;
  appliedAt: string;
};

export const adminApprovalsApi = {
  async getPendingQueue(params?: { page?: number; limit?: number; type?: string }) {
    const response = await client.get<{ success: boolean; data: { items: ApprovalQueueItem[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(
      '/admin/approvals/pending',
      { params }
    );
    return response.data.data;
  },

  async getApprovalStats() {
    const response = await client.get<{ success: boolean; data: ApprovalStats }>(
      '/admin/approvals/stats'
    );
    return response.data.data;
  },

  async approveContent(contentType: string, contentId: string, comment?: string) {
    const response = await client.patch(`/${contentType}s/${contentId}/approve`, { comment });
    return response.data;
  },

  async rejectContent(contentType: string, contentId: string, reason: string, comment?: string) {
    const response = await client.patch(`/${contentType}s/${contentId}/reject`, { reason, comment });
    return response.data;
  },

  async getPendingMemberships() {
    const response = await client.get<{ success: boolean; data: { memberships: PendingMembership[] } }>(
      '/organizations/memberships/pending'
    );
    return response.data.data.memberships;
  },

  async approveMembership(orgId: string, membershipId: string) {
    const response = await client.post(`/organizations/${orgId}/memberships/${membershipId}/approve`);
    return response.data;
  },

  async rejectMembership(orgId: string, membershipId: string) {
    const response = await client.post(`/organizations/${orgId}/memberships/${membershipId}/reject`);
    return response.data;
  },
};
