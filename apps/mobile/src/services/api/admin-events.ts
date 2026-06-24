import { client } from '@/services/api/client';

export type AdminEvent = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  isRegistrationOpen?: boolean;
  maxAttendees?: number;
  registeredCount?: number;
  checkedInCount?: number;
  allowWalkIns?: boolean;
};

export type ScanPayload = {
  qrToken?: string;
  studentNumber?: string;
  notes?: string;
};

export type ScanResult =
  | 'success'
  | 'duplicate'
  | 'not_registered'
  | 'not_eligible'
  | 'event_full'
  | 'registration_closed'
  | 'invalid_qr'
  | 'denied';

export type RegistrationInfo = {
  _id: string;
  studentId?: {
    _id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
  };
  eventId?: string;
  status: string;
  checkedInAt?: string;
  registeredAt: string;
  scanCount?: number;
};

export type ScanResponseData = {
  result: ScanResult;
  studentName?: string;
  registration?: RegistrationInfo;
};

export type AttendanceLogEntry = {
  _id: string;
  eventId: string;
  registrationId?: string;
  studentId?: {
    _id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
  };
  result: ScanResult | string;
  scanType: 'entry' | 'manual';
  scannedAt: string;
  notes?: string;
};

export type AttendanceLogsResponse = {
  logs: AttendanceLogEntry[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    byResult: Record<string, number>;
    byScanType: Record<string, number>;
  };
};

export type RegistrationsResponse = {
  registrations: RegistrationInfo[];
};

export const adminEventsApi = {
  async listEvents() {
    const response = await client.get<{ success: boolean; data: { events: AdminEvent[] } }>(
      '/events',
      { params: { limit: 100 } }
    );
    return response.data.data.events;
  },

  async getEvent(eventId: string) {
    const response = await client.get<{ success: boolean; data: { event: AdminEvent } }>(
      `/events/${eventId}`
    );
    return response.data.data.event;
  },

  async scanAttendance(eventId: string, payload: ScanPayload) {
    const response = await client.post<{ success: boolean; data: ScanResponseData }>(
      `/admin/events/${eventId}/attendance/scan`,
      payload
    );
    return response.data.data;
  },

  async undoCheckIn(eventId: string, registrationId: string) {
    const response = await client.post<{
      success: boolean;
      data: { registration: RegistrationInfo };
    }>(`/admin/events/${eventId}/registrations/${registrationId}/undo-checkin`);
    return response.data.data.registration;
  },

  async getRegistrations(eventId: string) {
    const response = await client.get<{ success: boolean; data: RegistrationsResponse }>(
      `/admin/events/${eventId}/registrations`
    );
    return response.data.data;
  },

  async searchRegistrations(eventId: string, q: string) {
    const response = await client.get<{ success: boolean; data: RegistrationsResponse }>(
      `/admin/events/${eventId}/registrations/search`,
      { params: { q } }
    );
    return response.data.data;
  },

  async createRegistration(eventId: string, studentNumber: string) {
    const response = await client.post<{ success: boolean; data: { registration: RegistrationInfo } }>(
      `/admin/events/${eventId}/registrations`,
      { studentNumber }
    );
    return response.data.data.registration;
  },

  async cancelRegistration(eventId: string, regId: string) {
    const response = await client.post<{ success: boolean; data: { registration: RegistrationInfo } }>(
      `/admin/events/${eventId}/registrations/${regId}/cancel`
    );
    return response.data.data.registration;
  },

  async updateRegistrationStatus(eventId: string, regId: string, update: { status: string; reason?: string }) {
    const response = await client.patch<{ success: boolean; data: { registration: RegistrationInfo } }>(
      `/admin/events/${eventId}/registrations/${regId}`,
      update
    );
    return response.data.data.registration;
  },

  async getAttendanceLogs(
    eventId: string,
    params?: { page?: number; limit?: number; result?: string; scanType?: string; q?: string }
  ) {
    const response = await client.get<{ success: boolean; data: AttendanceLogsResponse }>(
      `/admin/events/${eventId}/attendance/logs`,
      { params }
    );
    return response.data.data;
  },
};
