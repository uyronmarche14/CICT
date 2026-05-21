import api from './axios';

export interface AdminRegistration {
  _id: string;
  eventId: string;
  studentId: {
    _id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    status: string;
  };
  status: 'reserved' | 'registered' | 'cancelled' | 'checked_in';
  qrNonce?: string;
  qrIssuedAt?: string;
  registeredAt: string;
  cancelledAt?: string;
  checkedInAt?: string;
  source: 'self' | 'admin' | 'walk_in';
  scanCount?: number;
  createdAt: string;
}

export const adminEventAPI = {
  getRegistrations: async (eventId: string) => {
    const { data } = await api.get(`/admin/events/${eventId}/registrations`);
    return data.data.registrations as AdminRegistration[];
  },
  scanAttendance: async (eventId: string, payload: { qrToken?: string; studentNumber?: string; notes?: string }) => {
    const { data } = await api.post(`/admin/events/${eventId}/attendance/scan`, payload);
    return data.data as { result: string; registration?: AdminRegistration };
  },
  cancelRegistration: async (eventId: string, regId: string) => {
    const { data } = await api.post(`/admin/events/${eventId}/registrations/${regId}/cancel`);
    return data.data.registration as AdminRegistration;
  },
  updateRegistrationStatus: async (eventId: string, regId: string, payload: { status: string }) => {
    const { data } = await api.patch(`/admin/events/${eventId}/registrations/${regId}`, payload);
    return data.data.registration as AdminRegistration;
  },
  adminCreateRegistration: async (eventId: string, payload: { studentNumber: string }) => {
    const { data } = await api.post(`/admin/events/${eventId}/registrations`, payload);
    return data.data.registration as AdminRegistration;
  },
  undoCheckIn: async (eventId: string, regId: string) => {
    const { data } = await api.post(`/admin/events/${eventId}/registrations/${regId}/undo-checkin`);
    return data.data.registration as AdminRegistration;
  },
};
