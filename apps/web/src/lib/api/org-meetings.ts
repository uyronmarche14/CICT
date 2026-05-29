import api from './axios';

interface Meeting {
  _id: string;
  organizationId: string;
  title: string;
  description?: string;
  agenda?: Array<{ topic: string; duration?: number; presenter?: string }>;
  date: string;
  duration: number;
  location?: string;
  meetingUrl?: string;
  attendees?: Array<{ memberId?: string; name: string; email?: string; rsvp: 'pending' | 'accepted' | 'declined' }>;
  minutes?: string;
  actionItems?: Array<{ text: string; assigneeId?: string; dueDate?: string; status: 'open' | 'in_progress' | 'completed' }>;
  createdAt: string;
  updatedAt: string;
}

export const orgMeetingsAPI = {
  list: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: Meeting[] }>(`/organizations/${orgId}/meetings`);
    return res.data.data;
  },
  get: async (orgId: string, meetingId: string) => {
    const res = await api.get<{ success: boolean; data: Meeting }>(`/organizations/${orgId}/meetings/${meetingId}`);
    return res.data.data;
  },
  create: async (orgId: string, data: Partial<Meeting>) => {
    const res = await api.post<{ success: boolean; data: Meeting }>(`/organizations/${orgId}/meetings`, data);
    return res.data.data;
  },
  update: async (orgId: string, meetingId: string, data: Partial<Meeting>) => {
    const res = await api.put<{ success: boolean; data: Meeting }>(`/organizations/${orgId}/meetings/${meetingId}`, data);
    return res.data.data;
  },
  delete: async (orgId: string, meetingId: string) => {
    await api.delete(`/organizations/${orgId}/meetings/${meetingId}`);
  },
};
