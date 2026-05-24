import { useAuthStore } from '@/store/auth-store';

export function useAuthenticatedStudent() {
  return useAuthStore((state) => state.student);
}
