import api from './axios';
import type { News } from '@/types';

interface SingleNewsResponse {
  success: boolean;
  data: { news: News };
}

interface NewsListResponse {
  success: boolean;
  data: { news: News[]; pagination: { page: number; limit: number; total: number; pages: number } };
}

export const newsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    ownerType?: string;
    organizationId?: string;
  }) => {
    const response = await api.get<NewsListResponse>('/news', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<SingleNewsResponse>(`/news/${id}`);
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await api.post<SingleNewsResponse>('/news', data);
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put<SingleNewsResponse>(`/news/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },

  submit: async (id: string, payload?: { comment?: string }) => {
    const response = await api.patch(`/news/${id}/submit`, payload ?? {});
    return response.data;
  },

  approve: async (id: string, payload?: { comment?: string }) => {
    const response = await api.patch(`/news/${id}/approve`, payload ?? {});
    return response.data;
  },

  reject: async (id: string, payload: { reason: string; comment?: string }) => {
    const response = await api.patch(`/news/${id}/reject`, payload);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.patch(`/news/${id}/publish`);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await api.patch(`/news/${id}/archive`);
    return response.data;
  },
};
