import api from './axios';

export const orgSharedContentAPI = {
  share: async (orgId: string, data: { contentType: string; contentId: string; targetOrgIds: string[] }) => { const r = await api.post(`/organizations/${orgId}/shared-content`, data); return r.data.data; },
  incoming: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/shared-content/incoming`); return r.data.data; },
  outgoing: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/shared-content/outgoing`); return r.data.data; },
  remove: async (orgId: string, id: string) => { const r = await api.delete(`/organizations/${orgId}/shared-content/${id}`); return r.data.data; },
};
