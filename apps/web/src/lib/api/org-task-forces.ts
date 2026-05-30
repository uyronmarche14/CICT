import api from './axios';

export const orgTaskForcesAPI = {
  list: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/task-forces`); return r.data.data; },
  create: async (orgId: string, data: Record<string, unknown>) => { const r = await api.post(`/organizations/${orgId}/task-forces`, data); return r.data.data; },
  get: async (orgId: string, id: string) => { const r = await api.get(`/organizations/${orgId}/task-forces/${id}`); return r.data.data; },
  update: async (orgId: string, id: string, data: Record<string, unknown>) => { const r = await api.put(`/organizations/${orgId}/task-forces/${id}`, data); return r.data.data; },
  delete: async (orgId: string, id: string) => { await api.delete(`/organizations/${orgId}/task-forces/${id}`); },
};
