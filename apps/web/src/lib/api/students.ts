import api from './axios';
import { Student, StudentStatus } from '@/types';

export interface StudentListResponse {
  success: boolean;
  data: {
    students: Student[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface StudentSingleResponse {
  success: boolean;
  data: {
    student: Student;
  };
}

export type StudentMutationPayload = {
  studentNumber: string;
  email?: string;
  password?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  programId: string;
  yearLevelId: string;
  sectionId: string;
  status?: StudentStatus;
  isActive?: boolean;
  profilePhoto?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  aboutMe?: string;
  enrollmentDate?: string;
  expectedGraduationYear?: number;
  previousSchool?: string;
  guardianName?: string;
  guardianContact?: string;
  guardianRelationship?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
};

export const studentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    programId?: string;
    yearLevelId?: string;
    sectionId?: string;
    status?: string;
    isActive?: string;
  }) => {
    const response = await api.get<StudentListResponse>('/admin/students', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<StudentSingleResponse>(`/admin/students/${id}`);
    return response.data.data.student;
  },

  create: async (payload: StudentMutationPayload) => {
    const response = await api.post<StudentSingleResponse>('/admin/students', payload);
    return response.data.data.student;
  },

  update: async (id: string, payload: StudentMutationPayload) => {
    const response = await api.put<StudentSingleResponse>(`/admin/students/${id}`, payload);
    return response.data.data.student;
  },

  updateStatus: async (id: string, payload: { status: StudentStatus; isActive: boolean }) => {
    const response = await api.patch<StudentSingleResponse>(`/admin/students/${id}/status`, payload);
    return response.data.data.student;
  },
};
