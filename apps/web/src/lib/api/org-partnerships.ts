import api from './axios';

export const orgPartnershipsAPI = {
  list: async (orgId: string) => { const r = await api.get(`/organizations/${orgId}/partnerships`); return r.data.data; },
  create: async (orgId: string, data: { orgIdB: string; partnershipType?: string }) => { const r = await api.post(`/organizations/${orgId}/partnerships`, data); return r.data.data; },
  accept: async (orgId: string, id: string) => { const r = await api.patch(`/organizations/${orgId}/partnerships/${id}/accept`); return r.data.data; },
  decline: async (orgId: string, id: string) => { const r = await api.patch(`/organizations/${orgId}/partnerships/${id}/decline`); return r.data.data; },
  terminate: async (orgId: string, id: string) => { const r = await api.patch(`/organizations/${orgId}/partnerships/${id}/terminate`); return r.data.data; },
};
