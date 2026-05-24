import api from './axios';
import { MediaAsset } from '@/types';

export const uploadsAPI = {
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post<{ success: boolean; data: { images: MediaAsset[] } }>(
      '/uploads/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.images;
  },
};
