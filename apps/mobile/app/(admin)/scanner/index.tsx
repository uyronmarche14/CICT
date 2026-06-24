import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminEvents, type AdminEvent } from '@/features/events/useAdminEvents';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDate } from '@/utils/format';

type EventSection = {
  title: string;
  data: AdminEvent[];
};

export default function ScannerIndexScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const eventsQuery = useAdminEvents();
  const [search, setSearch] = useState('');

  const today = new Date().toDateString();
  const sections = useMemo<EventSection[]>(() => {
    const events = eventsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    const filtered = query
      ? events.filter(
          (event) =>
            event.title.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query)
        )
      : events;

    const current = filtered.filter((event) => new Date(event.startDate).toDateString() === today);
    const other = filtered.filter((event) => new Date(event.startDate).toDateString() !== today);
    return [
      ...(current.length > 0 ? [{ title: "Today's Events", data: current }] : []),
      ...(other.length > 0 ? [{ title: 'All Events', data: other }] : []),
    ];
  }, [eventsQuery.data, search, today]);

  const renderEventCard = (event: AdminEvent) => {
    const fillPercent = event.maxAttendees
      ? Math.round(((event.registeredCount ?? 0) / event.maxAttendees) * 100)
      : 0;
    const barColor =
      fillPercent >= 100 ? colors.danger : fillPercent >= 90 ? colors.warning : colors.success;
    const canScan = event.status !== 'cancelled' && event.status !== 'completed';

    return (
      <AppCard style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          <StatusPill label={event.status} tone={event.status === 'published' ? 'info' : 'neutral'} />
        </View>
        <Text style={[styles.eventMeta, { color: colors.textMuted }]}>
          {formatDate(event.startDate)} | {event.location}
        </Text>

        {event.maxAttendees ? (
          <View style={styles.capacityRow}>
            <View style={[styles.capacityBar, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.capacityFill,
                  { width: `${Math.min(fillPercent, 100)}%`, backgroundColor: barColor },
                ]}
              />
            </View>
            <Text style={[styles.capacityText, { color: colors.textMuted }]}>
              {event.registeredCount ?? 0}/{event.maxAttendees}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => router.push(`/(admin)/scanner/${event._id}` as never)}
          disabled={!canScan}
          style={({ pressed }) => [styles.action, { opacity: !canScan ? 0.48 : pressed ? 0.78 : 1 }]}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {canScan ? 'Start Scan' : 'View unavailable'}
          </Text>
        </Pressable>
      </AppCard>
    );
  };

  return (
    <AdminModuleScreen
        moduleKey="scanner"
        title="Scanner"
        subtitle="Select an event, scan QR passes, enter student numbers, and undo recent check-ins."
      >
      {eventsQuery.isPending ? <LoadingState label="Loading events..." /> : null}
      {eventsQuery.isError ? (
        <ErrorState title="Events unavailable" description="Could not load admin events." />
      ) : null}
      {!eventsQuery.isPending && !eventsQuery.isError ? (
        <>
          <AppTextInput value={search} onChangeText={setSearch} placeholder="Search events" />
          {sections.length === 0 ? (
            <EmptyState
              title="No events found"
              description={search ? 'Try a different search.' : 'No events are available yet.'}
            />
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              refreshControl={
                <RefreshControl
                  refreshing={eventsQuery.isRefetching}
                  onRefresh={() => eventsQuery.refetch()}
                />
              }
              renderSectionHeader={({ section }) => (
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              )}
              renderItem={({ item }) => renderEventCard(item)}
            />
          )}
        </>
      ) : null}
    </AdminModuleScreen>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    gap: spacing.sm,
  },
  eventHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  eventTitle: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  eventMeta: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  capacityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  capacityBar: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityText: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    minWidth: 52,
    textAlign: 'right',
  },
  action: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: fontSizes.sm,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
});

