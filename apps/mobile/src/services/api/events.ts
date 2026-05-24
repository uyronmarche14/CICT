import { client } from '@/services/api/client';
import type {
  StudentEventsResponse,
  StudentQrPayload,
  StudentRegistrationResponse,
} from '@/types/api';
import type { StudentEvent, StudentRegistration } from '@/types/models';

type EventDetailResponse = {
  success: boolean;
  data: {
    event: Omit<StudentEvent, 'registration'>;
  };
};

export const eventsApi = {
  async getEligibleEvents() {
    const response = await client.get<{ success: boolean; data: StudentEventsResponse }>(
      '/student/events'
    );

    return response.data.data.events;
  },

  async getPublicEvent(eventId: string) {
    const response = await client.get<EventDetailResponse>(`/events/${eventId}`);
    return response.data.data.event;
  },

  async getRegistration(eventId: string) {
    const response = await client.get<{ success: boolean; data: StudentRegistrationResponse }>(
      `/student/events/${eventId}/registration`
    );

    return response.data.data.registration;
  },

  async register(eventId: string) {
    const response = await client.post<{ success: boolean; data: { registration: StudentRegistration } }>(
      `/student/events/${eventId}/register`
    );

    return response.data.data.registration;
  },

  async cancelRegistration(eventId: string) {
    const response = await client.post<{ success: boolean; data: { registration: StudentRegistration } }>(
      `/student/events/${eventId}/cancel-registration`
    );

    return response.data.data.registration;
  },

  async getQrPayload(eventId: string) {
    const response = await client.get<{ success: boolean; data: StudentQrPayload }>(
      `/student/events/${eventId}/qr`
    );

    return response.data.data;
  },
};
