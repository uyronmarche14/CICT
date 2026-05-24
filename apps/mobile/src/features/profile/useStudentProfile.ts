import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { studentApi } from '@/services/api/student';

export function useStudentProfile() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: studentApi.getProfile,
  });
}
