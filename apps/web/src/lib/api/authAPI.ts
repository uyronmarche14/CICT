import { apiFetch } from './apiFetch';

const ROUTE_PREFIX = '/auth';

export function logoutUser() {
  return apiFetch(`${ROUTE_PREFIX}/logout`, {
    method: 'POST',
  });
}
