import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import type { UpdateItem } from '@/types/models';
import { formatDate } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';

type UpdateCardProps = {
  item: UpdateItem;
  onPress: () => void;
};

const KIND_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; tone: 'info' | 'warning' | 'success'; label: string }> = {
  news: { icon: 'newspaper-outline', tone: 'info', label: 'News' },
  announcement: { icon: 'megaphone-outline', tone: 'warning', label: 'Announcement' },
  event: { icon: 'calendar-outline', tone: 'success', label: 'Event' },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
};

export function UpdateCard({ item, onPress }: UpdateCardProps) {
  const { colors } = useTheme();
  const meta = KIND_META[item.kind] ?? KIND_META.news;
  const priorityColor = item.priority ? PRIORITY_COLORS[item.priority] : undefined;

  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        {item.priority && priorityColor ? (
          <View style={[styles.priorityStrip, { backgroundColor: priorityColor }]} />
        ) : null}
        <View style={styles.cardRow}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name={meta.icon} size={14} color={colors.textMuted} />
              <StatusPill label={meta.label} tone={meta.tone} />
              {item.priority && item.priority !== 'low' ? (
                <Text style={[styles.priorityLabel, { color: priorityColor }]}>
                  {item.priority}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.cardSummary, { color: colors.textMuted }]} numberOfLines={2}>
              {item.summary}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {formatDate(item.publishedAt)}
              </Text>
              {item.eventLocation ? (
                <View style={styles.footerMeta}>
                  <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.date, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.eventLocation}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : null}
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
    overflow: 'hidden',
  },
  priorityStrip: {
    height: 4,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    lineHeight: 22,
  },
  cardSummary: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  date: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
  },
});
