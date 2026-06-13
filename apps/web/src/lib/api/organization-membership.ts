import api from './axios';
import type { OrganizationMember } from '@/types';

export type OrganizationMembership = {
  _id: string;
  studentId: string | {
    _id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    programId?: string | { _id: string; code?: string; name?: string };
    yearLevelId?: string | { _id: string; code?: string; label?: string };
  };
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    fullName: string;
    logo?: string;
  };
  position: string;
  memberType: 'officer' | 'general' | 'alumni' | 'honorary' | 'advisor';
  status: 'applied' | 'invited' | 'active' | 'inactive' | 'alumni' | 'rejected' | 'resigned';
  appliedAt?: string;
  invitedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  resignedAt?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: string;
  notes?: string;
  history: { field: string; oldValue?: string; newValue?: string; changedBy?: string; changedAt: string }[];
  contributions?: { type: string; description: string; hours?: number; date: string }[];
  publicProfile?: OrganizationMember | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMembershipPayload = {
  studentId: string;
  position?: string;
  memberType?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: string;
  notes?: string;
};

export type UpdateMembershipPayload = Partial<CreateMembershipPayload> & {
  status?: string;
};

export const membershipAPI = {
  async list(orgId: string, params?: { page?: number; limit?: number; status?: string; memberType?: string }) {
    const response = await api.get(`/organizations/${orgId}/memberships`, { params });
    return response.data.data;
  },

  async create(orgId: string, payload: CreateMembershipPayload) {
    const response = await api.post(`/organizations/${orgId}/memberships`, payload);
    return response.data.data.membership;
  },

  async update(orgId: string, id: string, payload: UpdateMembershipPayload) {
    const response = await api.put(`/organizations/${orgId}/memberships/${id}`, payload);
    return response.data.data.membership;
  },

  async delete(orgId: string, id: string) {
    await api.delete(`/organizations/${orgId}/memberships/${id}`);
  },

  async getPending(): Promise<OrganizationMembership[]> {
    const response = await api.get<{ success: boolean; data: { memberships: OrganizationMembership[] } }>('/organizations/memberships/pending');
    return response.data.data.memberships;
  },

  async approve(orgId: string, id: string) {
    const response = await api.post(`/organizations/${orgId}/memberships/${id}/approve`);
    return response.data.data.membership;
  },

  async reject(orgId: string, id: string) {
    const response = await api.post(`/organizations/${orgId}/memberships/${id}/reject`);
    return response.data.data.membership;
  },
};
