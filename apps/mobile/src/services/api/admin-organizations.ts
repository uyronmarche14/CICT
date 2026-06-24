import { client } from '@/services/api/client';

export type AdminOrg = {
  _id: string;
  id: string;
  name: string;
  fullName: string;
  description: string;
  logo?: string;
  banner?: string;
  organizationType?: string;
  isActive: boolean;
  email?: string;
  phone?: string;
  building?: string;
  room?: string;
  advisorName?: string;
  members?: { id: string; name: string; position: string }[];
  color?: { primary: string; secondary: string; accent: string };
};

export const adminOrganizationsApi = {
  async list() {
    const response = await client.get<{ success: boolean; data: AdminOrg[] }>(
      '/organizations/admin'
    );
    return response.data.data;
  },

  async get(id: string) {
    const response = await client.get<{ success: boolean; data: AdminOrg }>(
      `/organizations/admin/${id}`
    );
    return response.data.data;
  },

  async getTasks(orgId: string) {
    const response = await client.get<{ success: boolean; data: { tasks: unknown[] } }>(
      `/organizations/${orgId}/tasks`
    );
    return response.data.data.tasks;
  },

  async getMeetings(orgId: string) {
    const response = await client.get<{ success: boolean; data: { meetings: unknown[] } }>(
      `/organizations/${orgId}/meetings`
    );
    return response.data.data.meetings;
  },

  async getVotes(orgId: string) {
    const response = await client.get<{ success: boolean; data: { votes: unknown[] } }>(
      `/organizations/${orgId}/votes`
    );
    return response.data.data.votes;
  },
};
