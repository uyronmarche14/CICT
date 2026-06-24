import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter, router } from 'expo-router';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { AdminEventCard } from '@/components/events/AdminEventCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminEvents } from '@/features/events/useAdminEvents';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

const STATUS_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Published', value: 'published' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const;

const TIME_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
] as const;

export default function AdminEventsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: events, isLoading, isError, refetch, isRefetching } = useAdminEvents();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let list = [...events];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      list = list.filter((e) => e.status === statusFilter);
    }

    if (timeFilter) {
      const now = new Date();
      const today = now.toDateString();
      switch (timeFilter) {
        case 'today':
          list = list.filter((e) => new Date(e.startDate).toDateString() === today);
          break;
        case 'upcoming':
          list = list.filter((e) => new Date(e.endDate) >= now);
          break;
        case 'past':
          list = list.filter((e) => new Date(e.endDate) < now);
          break;
      }
    }

    return list;
  }, [events, search, statusFilter, timeFilter]);

  return (
    <AdminModuleScreen
      moduleKey="events"
      title="Events"
      subtitle="Review event activity and prepare attendance operations."
    >
      <AppTextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search events..."
      />

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setStatusFilter(f.value)}>
            <StatusPill
              label={f.label}
              tone={statusFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        {TIME_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setTimeFilter(f.value)}>
            <StatusPill
              label={f.label}
              tone={timeFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingState label="Loading events..." />
      ) : isError ? (
        <ErrorState
          title="Events unavailable"
          description="Could not load admin events."
          onAction={() => refetch()}
        />
      ) : (
        <View style={styles.list}>
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No events found"
              description={search ? 'Try a different search.' : 'No events available yet.'}
            />
          ) : (
            <>
              {filteredEvents.map((event) => (
                <AdminEventCard
                  key={event._id}
                  event={event}
                  actionLabel="View Details"
                  onPress={() => router.navigate(`/(admin)/events/${event._id}` as any)}
                />
              ))}
            </>
          )}
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
});
