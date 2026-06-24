import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminStudentsApi, type StudentListParams } from '@/services/api/admin-students';

export function useStudentList(params?: StudentListParams) {
  return useQuery({
    queryKey: [...queryKeys.adminStudents, params],
    queryFn: () => adminStudentsApi.list(params),
  });
}

export function useStudentDetail(id?: string) {
  return useQuery({
    queryKey: [...queryKeys.adminStudents, id],
    queryFn: () => adminStudentsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useToggleStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: string; isActive: boolean }) =>
      adminStudentsApi.toggleStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStudents });
    },
  });
}
