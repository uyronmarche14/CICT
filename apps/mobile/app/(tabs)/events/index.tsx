import { useMemo, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { RefreshControl, StyleSheet, Text } from 'react-native';

import { ConnectivityNotice } from '@/components/feedback/ConnectivityNotice';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EventCard } from '@/components/events/EventCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useStudentEvents } from '@/features/events/useStudentEvents';
import { useTheme } from '@/theme/ThemeContext';

export default function EventsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const netInfo = useNetInfo();
  const [search, setSearch] = useState('');
  const eventsQuery = useStudentEvents();

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return eventsQuery.data ?? [];
    }

    return (eventsQuery.data ?? []).filter((event) =>
      `${event.title} ${event.location} ${event.excerpt}`.toLowerCase().includes(query)
    );
  }, [eventsQuery.data, search]);

  if (eventsQuery.isPending && !eventsQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading events..." />
      </AppScreen>
    );
  }

  if (eventsQuery.isError) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load eligible student events."
          onAction={() => {
            void eventsQuery.refetch();
          }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
        refreshControl={
          <RefreshControl
            refreshing={eventsQuery.isRefetching}
            onRefresh={() => {
              void eventsQuery.refetch();
            }}
          />
        }
      >
        {!netInfo.isConnected ? <ConnectivityNotice /> : null}

        <SectionHeader
          title="Eligible Events"
          subtitle="Find events you can register for with your student account."
          branded
        />

        <AppTextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title or location"
        />

        <Text style={[styles.helper, { color: colors.textMuted }]}>
          {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'} available
        </Text>

        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No matching events"
            description="Try another search or check again later for new published events."
          />
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onPress={() => router.push(`/(tabs)/events/${event._id}`)}
            />
          ))
        )}
      </AppScreen>
  );
}

const styles = StyleSheet.create({
  helper: {
    fontWeight: '600',
  },
});
