import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentProfileCard } from '@/components/students/StudentProfileCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStudentDetail, useStudentList, useToggleStudentStatus } from '@/features/students/useStudents';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

const STATUS_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;

export default function AdminStudentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useStudentList({
    page,
    search: search || undefined,
    status: statusFilter ?? undefined,
  });

  const { data: selectedStudent } = useStudentDetail(selectedId ?? undefined);
  const toggleMutation = useToggleStudentStatus();

  const students = data?.students ?? [];
  const pagination = data?.pagination;

  if (selectedId && selectedStudent) {
    return (
      <AppScreen>
        <AppButton variant="ghost" onPress={() => setSelectedId(null)}>
          Back
        </AppButton>
        <StudentProfileCard
          student={selectedStudent}
          onToggleStatus={() => {
            if (selectedId) {
              toggleMutation.mutate({
                id: selectedId,
                status: selectedStudent.isActive ? 'inactive' : 'active',
                isActive: !selectedStudent.isActive,
              });
            }
          }}
          togglePending={toggleMutation.isPending}
        />
      </AppScreen>
    );
  }

  return (
    <AdminModuleScreen
      moduleKey="students"
      title="Students"
      subtitle="Search and manage students."
    >
      <AppTextInput
        value={search}
        onChangeText={(t) => { setSearch(t); setPage(1); }}
        placeholder="Search by name or number..."
      />

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => { setStatusFilter(f.value); setPage(1); }}>
            <StatusPill
              label={f.label}
              tone={statusFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingState label="Loading students..." />
      ) : isError ? (
        <ErrorState description="Could not load students." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description={search ? 'Try a different search.' : 'No students available.'}
        />
      ) : (
        <View style={styles.list}>
          {students.map((s) => (
            <StudentCard
              key={s._id}
              student={s}
              onPress={() => setSelectedId(s._id)}
            />
          ))}
          {pagination && pagination.pages > 1 ? (
            <View style={styles.pagination}>
              <AppButton
                variant="ghost"
                disabled={page <= 1}
                onPress={() => setPage(page - 1)}
              >
                Previous
              </AppButton>
              <Text style={[styles.pageText, { color: colors.textMuted }]}>
                Page {page} of {pagination.pages}
              </Text>
              <AppButton
                variant="ghost"
                disabled={page >= pagination.pages}
                onPress={() => setPage(page + 1)}
              >
                Next
              </AppButton>
            </View>
          ) : null}
        </View>
      )}
    </AdminModuleScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pageText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
