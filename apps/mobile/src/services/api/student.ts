import { client } from '@/services/api/client';
import type {
  StudentAttendanceResponse,
  StudentProfileResponse,
  StudentRegistrationsResponse,
} from '@/types/api';

export const studentApi = {
  async getProfile() {
    const response = await client.get<{ success: boolean; data: StudentProfileResponse }>(
      '/student/profile'
    );

    return response.data.data.student;
  },

  async getRegistrations() {
    const response = await client.get<{ success: boolean; data: StudentRegistrationsResponse }>(
      '/student/registrations'
    );

    return response.data.data.registrations;
  },

  async getAttendanceHistory() {
    const response = await client.get<{ success: boolean; data: StudentAttendanceResponse }>(
      '/student/attendance/history'
    );

    return response.data.data.attendanceLogs;
  },
};
