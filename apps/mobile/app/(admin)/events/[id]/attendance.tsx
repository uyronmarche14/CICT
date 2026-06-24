import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AttendanceLogCard } from '@/components/events/AttendanceLogCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminEvent } from '@/features/events/useAdminEvents';
import { adminEventsApi } from '@/services/api/admin-events';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';

const RESULT_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: '✓ Success', value: 'success' },
  { label: '⟳ Duplicate', value: 'duplicate' },
  { label: '✗ Invalid', value: 'invalid_qr' },
  { label: '! Not Reg', value: 'not_registered' },
] as const;

export default function EventAttendanceScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event } = useAdminEvent(id);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: [...queryKeys.adminAttendanceLogs(id), page, resultFilter, search],
    queryFn: () => adminEventsApi.getAttendanceLogs(id, {
      page,
      limit: 20,
      result: resultFilter ?? undefined,
      q: search || undefined,
    }),
    enabled: Boolean(id),
  });

  const logs = logsData?.logs ?? [];
  const summary = logsData?.summary;
  const totalPages = logsData?.totalPages ?? 1;
  const total = logsData?.total ?? 0;

  const summaryStats = useMemo(() => {
    if (!summary) return null;
    const checkedIn = summary.byResult?.success ?? 0;
    const duplicates = summary.byResult?.duplicate ?? 0;
    const invalid = (summary.byResult?.invalid_qr ?? 0) + (summary.byResult?.not_registered ?? 0);
    const qr = summary.byScanType?.entry ?? 0;
    const manual = summary.byScanType?.manual ?? 0;
    const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { checkedIn, duplicates, invalid, qr, manual, pct, total };
  }, [summary, total]);

  return (
    <AppScreen
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      <AppButton variant="ghost" onPress={() => router.back()}>
        Back
      </AppButton>

      {summaryStats ? (
        <AppCard>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>{summaryStats.pct}%</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rate</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{summaryStats.checkedIn}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {summaryStats.qr} QR • {summaryStats.manual} Manual
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{summaryStats.duplicates}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Duplicates</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.danger }]}>{summaryStats.invalid}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Errors</Text>
            </View>
          </View>
        </AppCard>
      ) : null}

      <AppTextInput
        value={search}
        onChangeText={(t) => { setSearch(t); setPage(1); }}
        placeholder="Search by student name..."
      />

      <View style={styles.filterRow}>
        {RESULT_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => { setResultFilter(f.value); setPage(1); }}>
            <StatusPill
              label={f.label}
              tone={resultFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingState label="Loading attendance logs..." />
      ) : isError ? (
        <ErrorState description="Could not load attendance logs." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No attendance logs"
          description={search ? 'No matching logs found.' : 'No scans recorded yet.'}
        />
      ) : (
        <View style={styles.list}>
          {logs.map((log) => (
            <AttendanceLogCard key={log._id} log={log} />
          ))}

          <View style={styles.pagination}>
            {page > 1 ? (
              <AppButton variant="ghost" onPress={() => setPage(page - 1)}>
                Previous
              </AppButton>
            ) : <View />}
            <Text style={[styles.pageText, { color: colors.textMuted }]}>
              Page {page} of {totalPages}
            </Text>
            {page < totalPages ? (
              <AppButton variant="ghost" onPress={() => setPage(page + 1)}>
                Next
              </AppButton>
            ) : <View />}
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    padding: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
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
