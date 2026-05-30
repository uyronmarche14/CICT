import api from './axios';

export const orgCollaborationsAPI = {
  list: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/collaborations`); return r.data.data; },
  create: async (orgId: string, data: Record<string, unknown>) => { const r = await api.post(`/organizations/${orgId}/collaborations`, data); return r.data.data; },
  get: async (orgId: string, id: string) => { const r = await api.get(`/organizations/${orgId}/collaborations/${id}`); return r.data.data; },
  update: async (orgId: string, id: string, data: Record<string, unknown>) => { const r = await api.put(`/organizations/${orgId}/collaborations/${id}`, data); return r.data.data; },
  delete: async (orgId: string, id: string) => { await api.delete(`/organizations/${orgId}/collaborations/${id}`); },
  listMessages: async (orgId: string, spaceId: string) => { const r = await api.get(`/organizations/${orgId}/collaborations/${spaceId}/messages`); return r.data.data; },
  sendMessage: async (orgId: string, spaceId: string, content: string) => { const r = await api.post(`/organizations/${orgId}/collaborations/${spaceId}/messages`, { content }); return r.data.data; },
  deleteMessage: async (orgId: string, spaceId: string, msgId: string) => { await api.delete(`/organizations/${orgId}/collaborations/${spaceId}/messages/${msgId}`); },
};
