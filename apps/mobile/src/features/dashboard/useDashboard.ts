import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminDashboardApi } from '@/services/api/admin-dashboard';

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => adminDashboardApi.getDashboardSummary(),
  });
}
