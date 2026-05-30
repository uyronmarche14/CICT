import api from './axios';

export const orgResourcesAPI = {
  outgoing: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/resource-requests/outgoing`); return r.data.data; },
  incoming: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/resource-requests/incoming`); return r.data.data; },
  create: async (orgId: string, data: Record<string, unknown>) => { const r = await api.post(`/organizations/${orgId}/resource-requests`, data); return r.data.data; },
  get: async (orgId: string, id: string) => { const r = await api.get(`/organizations/${orgId}/resource-requests/${id}`); return r.data.data; },
  approve: async (orgId: string, id: string, notes?: string) => { const r = await api.patch(`/organizations/${orgId}/resource-requests/${id}/approve`, { notes }); return r.data.data; },
  deny: async (orgId: string, id: string, notes?: string) => { const r = await api.patch(`/organizations/${orgId}/resource-requests/${id}/deny`, { notes }); return r.data.data; },
  cancel: async (orgId: string, id: string) => { const r = await api.patch(`/organizations/${orgId}/resource-requests/${id}/cancel`); return r.data.data; },
};
