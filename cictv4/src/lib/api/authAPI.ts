import type { User } from '@/types';
import { apiFetch } from './apiFetch';

const ROUTE_PREFIX = '/auth';

export function loginUser(data: { email: string; password: string }) {
  return apiFetch<{ success: boolean; data: { user: User } }>(
    `${ROUTE_PREFIX}/login`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export function logoutUser() {
  return apiFetch(`${ROUTE_PREFIX}/logout`, {
    method: 'POST',
  });
}
