import { MEDIA_CATEGORIES } from '@/lib/constants/media';
import { apiFetch } from '../apiFetch';

export type PresignedUrlResponse = {
  url: string;
  key: string;
};

export async function getPresignedUrl(
  filename: string,
  contentType: string,
  category: MEDIA_CATEGORIES
): Promise<PresignedUrlResponse> {
  return apiFetch<PresignedUrlResponse>('/media/presigned-url', {
    method: 'POST',
    body: JSON.stringify({
      filename,
      contentType,
      category,
    }),
  });
}
