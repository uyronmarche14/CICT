import api from './axios';
import type { Inquiry, InquiryStatus } from '@/types';

export interface CreateInquiryPayload {
  fullName: string;
  email: string;
  contactNumber?: string;
  userType: string;
  subject: string;
  inquiryType: string;
  message: string;
}

interface InquiryListParams {
  page?: number;
  limit?: number;
  status?: InquiryStatus | 'all';
  search?: string;
}

interface InquiryListResponse {
  success: boolean;
  data: {
    inquiries: Inquiry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface InquiryResponse {
  success: boolean;
  data: {
    inquiry: Inquiry;
  };
}

export const inquiriesAPI = {
  create: async (payload: CreateInquiryPayload) => {
    const response = await api.post<InquiryResponse>('/inquiries', payload);
    return response.data.data.inquiry;
  },

  getAll: async (params: InquiryListParams = {}) => {
    const { status, ...rest } = params;
    const response = await api.get<InquiryListResponse>('/inquiries', {
      params: {
        ...rest,
        ...(status && status !== 'all' ? { status } : {}),
      },
    });
    return response.data.data;
  },

  updateStatus: async (id: string, status: InquiryStatus) => {
    const response = await api.patch<InquiryResponse>(`/inquiries/${id}/status`, { status });
    return response.data.data.inquiry;
  },

  delete: async (id: string) => {
    await api.delete(`/inquiries/${id}`);
  },
};
