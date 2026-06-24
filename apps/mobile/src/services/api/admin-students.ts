import { client } from '@/services/api/client';

export type StudentSummary = {
  _id: string;
  studentNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profilePhoto?: string;
  phone?: string;
  address?: string;
  status: string;
  isActive: boolean;
  programId?: { _id: string; code: string; name: string };
  yearLevelId?: { _id: string; code: string; label: string; numericLevel?: number };
  sectionId?: { _id: string; name: string; displayName: string };
  lastLoginAt?: string;
  qrVersion?: number;
};

export type StudentListResponse = {
  students: StudentSummary[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type StudentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  programId?: string;
  yearLevelId?: string;
  status?: string;
};

export const adminStudentsApi = {
  async list(params?: StudentListParams) {
    const response = await client.get<{ success: boolean; data: StudentListResponse }>(
      '/admin/students',
      { params }
    );
    return response.data.data;
  },

  async get(id: string) {
    const response = await client.get<{ success: boolean; data: { student: StudentSummary } }>(
      `/admin/students/${id}`
    );
    return response.data.data.student;
  },

  async toggleStatus(id: string, data: { status: string; isActive: boolean }) {
    const response = await client.patch<{ success: boolean; data: { student: StudentSummary } }>(
      `/admin/students/${id}/status`,
      data
    );
    return response.data.data.student;
  },
};
