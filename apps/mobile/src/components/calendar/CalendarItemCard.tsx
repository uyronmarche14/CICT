import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime } from '@/utils/format';
import type { CalendarItem } from '@/services/api/admin-calendar';

type Props = {
  item: CalendarItem;
};

const TYPE_COLORS: Record<string, string> = {
  event: '#6366F1',
  meeting: '#10B981',
  task: '#F59E0B',
  vote: '#8B5CF6',
  resource: '#F43F5E',
};

const TYPE_LABELS: Record<string, string> = {
  event: 'Event',
  meeting: 'Meeting',
  task: 'Task',
  vote: 'Vote',
  resource: 'Resource',
};

export function CalendarItemCard({ item }: Props) {
  const { colors } = useTheme();
  const dotColor = TYPE_COLORS[item.sourceType] ?? colors.primary;
  const typeLabel = TYPE_LABELS[item.sourceType] ?? item.sourceType;

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.typeLabel, { color: dotColor }]}>{typeLabel}</Text>
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {item.allDay ? 'All Day' : formatDateTime(item.startsAt)}
            {item.allDay ? '' : ''}
          </Text>
          {item.organizationName ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {item.organizationName}
            </Text>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  typeLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  meta: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
