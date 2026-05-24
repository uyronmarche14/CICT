import api from '../lib/api/axios';
import {
  Organization,
  OrganizationAdminAssignment,
  OrganizationInput,
  OrganizationMember,
} from '../types';

export const organizationService = {
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get<{ success: boolean; data: Organization[] }>('/organizations');
    return response.data.data;
  },

  getAdminAll: async (): Promise<Organization[]> => {
    const response = await api.get<{ success: boolean; data: Organization[] }>('/organizations/admin');
    return response.data.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await api.get<{ success: boolean; data: Organization }>(`/organizations/${id}`);
    return response.data.data;
  },

  getAdminById: async (id: string): Promise<Organization> => {
    const response = await api.get<{ success: boolean; data: Organization }>(
      `/organizations/admin/${id}`
    );
    return response.data.data;
  },

  getAdminAssignments: async (id: string): Promise<OrganizationAdminAssignment[]> => {
    const response = await api.get<{
      success: boolean;
      data: { assignments: OrganizationAdminAssignment[] };
    }>(`/organizations/admin/${id}/assignments`);
    return response.data.data.assignments;
  },

  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    const response = await api.put<{ success: boolean; data: Organization }>(
      `/organizations/${id}`,
      data
    );
    return response.data.data;
  },

  create: async (data: OrganizationInput): Promise<Organization> => {
    const response = await api.post<{ success: boolean; data: Organization }>(
      '/organizations',
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`);
  },

  addMember: async (orgId: string, member: OrganizationMember): Promise<Organization> => {
    const response = await api.post<{ success: boolean; data: Organization }>(
      `/organizations/${orgId}/members`,
      member
    );
    return response.data.data;
  },

  updateMember: async (orgId: string, memberId: string, data: Partial<OrganizationMember>): Promise<Organization> => {
    const response = await api.put<{ success: boolean; data: Organization }>(
      `/organizations/${orgId}/members/${memberId}`,
      data
    );
    return response.data.data;
  },

  deleteMember: async (orgId: string, memberId: string): Promise<Organization> => {
    const response = await api.delete<{ success: boolean; data: Organization }>(
      `/organizations/${orgId}/members/${memberId}`
    );
    return response.data.data;
  },
  
  uploadImage: async (file: File): Promise<{ imageUrl: string; imageId: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post<{ success: boolean; data: { imageUrl: string; imageId: string } }>(
      '/organizations/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }
};
