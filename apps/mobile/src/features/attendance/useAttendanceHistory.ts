import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { studentApi } from '@/services/api/student';

export function useAttendanceHistory() {
  return useQuery({
    queryKey: queryKeys.attendance,
    queryFn: studentApi.getAttendanceHistory,
  });
}
