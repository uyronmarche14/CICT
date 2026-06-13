import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/queryKeys'
import { studentApi } from '@/services/api/student'

export function useStudentRegistrations() {
  return useQuery({
    queryKey: queryKeys.registrations,
    queryFn: () => studentApi.getRegistrations(),
  })
}
