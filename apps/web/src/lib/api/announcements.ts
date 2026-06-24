import api from './axios';
import type { Announcement } from '@/types';

interface SingleAnnouncementResponse {
  success: boolean;
  data: { announcement: Announcement };
}

interface AnnouncementListResponse {
  success: boolean;
  data: { announcements: Announcement[]; pagination: { page: number; limit: number; total: number; pages: number } };
}

export const announcementAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    ownerType?: string;
    organizationId?: string;
    type?: string;
    subtype?: string;
    ctaFilter?: string;
  }) => {
    const response = await api.get<AnnouncementListResponse>('/announcements', { params });
    return response.data;
  },

  getPublic: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    ownerType?: string;
    organizationId?: string;
  }) => {
    const response = await api.get<AnnouncementListResponse>('/public/announcements', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<SingleAnnouncementResponse>(`/announcements/${id}`);
    return response.data;
  },

  getPublicById: async (id: string) => {
    const response = await api.get<SingleAnnouncementResponse>(`/public/announcements/${id}`);
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await api.post<SingleAnnouncementResponse>('/announcements', data);
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put<SingleAnnouncementResponse>(`/announcements/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },

  submit: async (id: string, payload?: { comment?: string }) => {
    const response = await api.patch(`/announcements/${id}/submit`, payload ?? {});
    return response.data;
  },

  approve: async (id: string, payload?: { comment?: string }) => {
    const response = await api.patch(`/announcements/${id}/approve`, payload ?? {});
    return response.data;
  },

  reject: async (id: string, payload: { reason: string; comment?: string }) => {
    const response = await api.patch(`/announcements/${id}/reject`, payload);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.patch(`/announcements/${id}/publish`);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await api.patch(`/announcements/${id}/archive`);
    return response.data;
  },
};
