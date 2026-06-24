import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { CalendarItemCard } from '@/components/calendar/CalendarItemCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { useCalendarFeed } from '@/features/calendar/useCalendar';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import type { CalendarItem } from '@/services/api/admin-calendar';

const SOURCE_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Events', value: 'event' },
  { label: 'Meetings', value: 'meeting' },
  { label: 'Tasks', value: 'task' },
  { label: 'Votes', value: 'vote' },
] as const;

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, isLoading, isError } = useCalendarFeed(startDate, endDate);

  const sections = useMemo(() => {
    if (!data?.items) return [];

    let items = data.items;
    if (sourceFilter) {
      items = items.filter((i) => i.sourceType === sourceFilter);
    }

    const grouped = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const date = new Date(item.startsAt);
      const key = date.toDateString();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }

    return Array.from(grouped.entries())
      .map(([date, dateItems]) => ({
        title: date === now.toDateString() ? 'Today' : date,
        data: dateItems,
      }))
      .sort((a, b) => new Date(a.data[0].startsAt).getTime() - new Date(b.data[0].startsAt).getTime());
  }, [data, sourceFilter]);

  return (
    <AppScreen>
      <SectionHeader title="Calendar" subtitle="Upcoming events and activities." />

      <View style={styles.filterRow}>
        {SOURCE_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setSourceFilter(f.value)}>
            <StatusPill
              label={f.label}
              tone={sourceFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingState label="Loading calendar..." />
      ) : isError ? (
        <ErrorState description="Could not load calendar." />
      ) : sections.length === 0 ? (
        <EmptyState title="No upcoming events" description="Nothing scheduled for the next 7 days." />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.dayHeader, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => <CalendarItemCard item={item} />}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dayHeader: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
});
