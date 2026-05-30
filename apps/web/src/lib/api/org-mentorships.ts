import api from './axios';

export const orgMentorshipsAPI = {
  list: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/mentorships`); return r.data.data; },
  create: async (orgId: string, data: Record<string, unknown>) => { const r = await api.post(`/organizations/${orgId}/mentorships`, data); return r.data.data; },
  get: async (orgId: string, id: string) => { const r = await api.get(`/organizations/${orgId}/mentorships/${id}`); return r.data.data; },
  updateStatus: async (orgId: string, id: string, status: string) => { const r = await api.patch(`/organizations/${orgId}/mentorships/${id}/status`, { status }); return r.data.data; },
  delete: async (orgId: string, id: string) => { await api.delete(`/organizations/${orgId}/mentorships/${id}`); },
};
