import { useMemo } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStudentRegistrations } from '@/features/registrations/useStudentRegistrations';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDate } from '@/utils/format';
import type { StudentRegistration } from '@/types/models';

const statusConfig: Record<string, { tone: 'info' | 'success' | 'danger'; label: string }> = {
  registered: { tone: 'info', label: 'Registered' },
  checked_in: { tone: 'success', label: 'Checked In' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
};

type Section = {
  title: string;
  data: StudentRegistration[];
  emptyMessage: string;
};

export default function RegistrationsScreen() {
  const { colors } = useTheme();
  const { data: registrations, isPending, isError, refetch, isRefetching } = useStudentRegistrations();

  const sections = useMemo(() => {
    if (!registrations) return [];

    const active = registrations.filter(
      (r) => r.status === 'registered' || r.status === 'checked_in'
    );
    const cancelled = registrations.filter((r) => r.status === 'cancelled');

    const result: Section[] = [];

    if (active.length > 0 || cancelled.length > 0) {
      result.push({
        title: `Active Registrations (${active.length})`,
        data: active,
        emptyMessage: '',
      });
      result.push({
        title: `Cancelled (${cancelled.length})`,
        data: cancelled,
        emptyMessage: '',
      });
    }

    return result;
  }, [registrations]);

  if (isPending && !registrations) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading your registrations..." />
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="Failed to load registrations"
          onAction={() => void refetch()}
        />
      </AppScreen>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <AppScreen scroll={false}>
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No registrations yet"
            description="You haven't registered for any events yet. Browse events to find something to attend."
            actionLabel="Browse Events"
            onAction={() => router.push('/(tabs)/events')}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      }
    >
      <View style={styles.headerRow}>
        <AppButton variant="ghost" onPress={() => router.back()}>
          Back
        </AppButton>
      </View>

      <SectionHeader
        title="My Registrations"
        subtitle="All your event registrations in one place."
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const eventData = typeof item.eventId === 'object' ? item.eventId : null;
          if (!eventData) return null;

          const status = statusConfig[item.status] ?? { tone: 'neutral' as const, label: item.status };

          return (
            <AppCard style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.primary + '20' }]} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                    {eventData.title}
                  </Text>
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                    {formatDate(eventData.startDate)} • {eventData.location}
                  </Text>
                  <View style={styles.cardActions}>
                    <StatusPill label={status.label} tone={status.tone} />
                    {item.status === 'registered' || item.status === 'checked_in' ? (
                      <Pressable
                        onPress={() => router.push(`/(tabs)/events/${eventData._id}/qr`)}
                      >
                        <Text style={[styles.qrLink, { color: colors.primary }]}>
                          View QR
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            </AppCard>
          );
        }}
        ListFooterComponent={<View style={styles.footer} />}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardImagePlaceholder: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardInfo: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    gap: 4,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  cardMeta: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  qrLink: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  footer: {
    height: spacing.xxl,
  },
});
