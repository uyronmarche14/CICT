import api from './axios';
import type { FAQContent } from '@/types';

interface FAQResponse {
  success: boolean;
  data: FAQContent;
}

export const faqAPI = {
  get: async () => {
    const response = await api.get<FAQResponse>('/faqs');
    return response.data.data;
  },

  update: async (data: FAQContent) => {
    const response = await api.put<FAQResponse>('/faqs', data);
    return response.data.data;
  },
};
