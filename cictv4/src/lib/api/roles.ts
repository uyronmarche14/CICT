import api from './axios';
import { CreateRoleInput, Role, UpdateRoleInput } from '@/types';

export const rolesAPI = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: { roles: Role[] } }>('/roles');
    return response.data.data.roles;
  },

  create: async (payload: CreateRoleInput) => {
    const response = await api.post<{ success: boolean; data: { role: Role } }>('/roles', payload);
    return response.data.data.role;
  },

  update: async (id: string, payload: UpdateRoleInput) => {
    const response = await api.put<{ success: boolean; data: { role: Role } }>(`/roles/${id}`, payload);
    return response.data.data.role;
  },

  delete: async (id: string) => {
    await api.delete(`/roles/${id}`);
  },
};
