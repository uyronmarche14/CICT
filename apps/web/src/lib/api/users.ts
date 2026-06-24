import api from './axios';
import {
  AssignUserRoleInput,
  OrganizationAssignment,
  OrganizationAssignmentInput,
  User,
  UserRole,
} from '@/types';

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | '';
  isActive?: '' | 'true' | 'false';
  customRoleId?: string;
}

const buildUsersQueryParams = (params: UsersQueryParams): Record<string, string | number> => {
  const query: Record<string, string | number> = {};

  if (params.page !== undefined) {
    query.page = params.page;
  }

  if (params.limit !== undefined) {
    query.limit = params.limit;
  }

  if (typeof params.search === 'string') {
    query.search = params.search;
  }

  if (params.role) {
    query.role = params.role;
  }

  if (params.isActive === 'true' || params.isActive === 'false') {
    query.isActive = params.isActive;
  }

  if (typeof params.customRoleId === 'string' && params.customRoleId.trim().length > 0) {
    query.customRoleId = params.customRoleId.trim();
  }

  return query;
};

export const usersAPI = {
  create: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    customRoleId: string | null;
    organizationAssignments?: Array<{ organizationId: string; roleId: string }>;
  }) => {
    const response = await api.post<{ success: boolean; data: { user: User } }>('/users', payload);
    return response.data;
  },

  getAll: async (params: UsersQueryParams) => {
    const response = await api.get<{
      success: boolean;
      data: {
        users: User[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>('/users', { params: buildUsersQueryParams(params) });

    return response.data.data;
  },

  update: async (id: string, payload: Pick<User, 'firstName' | 'lastName'>) => {
    const response = await api.put<{ success: boolean; data: { user: User } }>(`/users/${id}`, payload);
    return response.data.data.user;
  },

  setRole: async (id: string, payload: AssignUserRoleInput) => {
    const response = await api.patch<{ success: boolean; data: { user: User } }>(
      `/users/${id}/role`,
      payload
    );
    return response.data.data.user;
  },

  setStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch<{ success: boolean; data: { user: User } }>(
      `/users/${id}/status`,
      { isActive }
    );
    return response.data.data.user;
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  getOrgAssignments: async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: { assignments: OrganizationAssignment[] };
    }>(`/users/${id}/org-assignments`);
    return response.data.data.assignments;
  },

  createOrgAssignment: async (id: string, payload: OrganizationAssignmentInput) => {
    const response = await api.post<{
      success: boolean;
      data: { assignment: OrganizationAssignment | null; assignments: OrganizationAssignment[] };
    }>(`/users/${id}/org-assignments`, payload);
    return response.data.data;
  },

  updateOrgAssignment: async (
    id: string,
    assignmentId: string,
    payload: OrganizationAssignmentInput
  ) => {
    const response = await api.put<{
      success: boolean;
      data: { assignment: OrganizationAssignment | null; assignments: OrganizationAssignment[] };
    }>(`/users/${id}/org-assignments/${assignmentId}`, payload);
    return response.data.data;
  },

  deleteOrgAssignment: async (id: string, assignmentId: string) => {
    const response = await api.delete<{
      success: boolean;
      data: { assignments: OrganizationAssignment[] };
    }>(`/users/${id}/org-assignments/${assignmentId}`);
    return response.data.data.assignments;
  },
};
