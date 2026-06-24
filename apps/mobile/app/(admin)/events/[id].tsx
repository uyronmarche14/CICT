import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminEvent } from '@/features/events/useAdminEvents';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDate } from '@/utils/format';

export default function AdminEventDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event, isLoading, isError, refetch } = useAdminEvent(id);

  if (isLoading) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading event details..." />
      </AppScreen>
    );
  }

  if (isError || !event) {
    return (
      <AppScreen scroll={false}>
        <ErrorState description="Could not load event." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppButton variant="ghost" onPress={() => router.back()}>
        Back
      </AppButton>

      <SectionHeader title={event.title} subtitle={`${formatDate(event.startDate)} • ${event.location}`} />

      <View style={styles.statusRow}>
        <StatusPill label={event.status} tone="info" />
        <StatusPill
          label={event.isRegistrationOpen ? 'Open' : 'Closed'}
          tone={event.isRegistrationOpen ? 'success' : 'danger'}
        />
        {event.allowWalkIns ? (
          <StatusPill label="Walk-ins" tone="warning" />
        ) : null}
      </View>

      <AppCard>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Date</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDate(event.startDate)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Location</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{event.location}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Registered</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {event.registeredCount ?? 0}/{event.maxAttendees ?? '∞'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Checked In</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {event.checkedInCount ?? 0}
            </Text>
          </View>
        </View>
      </AppCard>

      <AppButton
        onPress={() => (router as any).push(`/(admin)/scanner/${id}`)}
        style={styles.scanCta}
      >
        Start Scanning
      </AppButton>

      <AppButton
        variant="secondary"
        onPress={() => (router as any).push(`/(admin)/events/${id}/registrations`)}
      >
        View Registrations
      </AppButton>

      <AppButton
        variant="secondary"
        onPress={() => (router as any).push(`/(admin)/events/${id}/attendance`)}
      >
        View Attendance Log
      </AppButton>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    padding: spacing.md,
    borderRadius: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  scanCta: {
    marginTop: spacing.sm,
  },
});
