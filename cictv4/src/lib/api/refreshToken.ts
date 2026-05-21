import type { User } from '@/types';

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');
export async function refreshToken(
  currentRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string; user: User } | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: currentRefreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to refresh access token', error);
    return null;
  }
}
