import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import type { AnnouncementPriority, UpdateItem } from '@/types/models';
import { formatDate } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';

type WidgetFeatured = {
  topAnnouncement: UpdateItem | null;
  upcomingEvent: UpdateItem | null;
  latestOfficial: UpdateItem | null;
  activeOrgs: { id: string; name: string; count: number }[];
};

type UpdateWidgetsProps = {
  featured: WidgetFeatured;
  onAnnouncementPress: (item: UpdateItem) => void;
  onEventPress: (item: UpdateItem) => void;
  onOrgPress: (orgId: string) => void;
};

const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
};

function WidgetCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.widgetCard, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function UpdateWidgets({ featured, onAnnouncementPress, onEventPress, onOrgPress }: UpdateWidgetsProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const widgets: { key: string; content: React.ReactNode }[] = [];

  if (featured.topAnnouncement) {
    const a = featured.topAnnouncement;
    const pColor = a.priority ? PRIORITY_COLORS[a.priority] : colors.primary;
    widgets.push({
      key: 'announcement',
      content: (
        <Pressable onPress={() => onAnnouncementPress(a)}>
          <WidgetCard style={expanded ? undefined : { width: 220 }}>
            <View style={[styles.widgetAccent, { backgroundColor: pColor }]} />
            <View style={styles.widgetContent}>
              <View style={styles.widgetHeader}>
                <Ionicons name="megaphone" size={14} color={pColor} />
                <Text style={[styles.widgetLabel, { color: pColor }]}>
                  {a.priority === 'urgent' ? 'URGENT' : 'Announcement'}
                </Text>
              </View>
              <Text style={[styles.widgetTitle, { color: colors.text }]} numberOfLines={2}>
                {a.title}
              </Text>
              <Text style={[styles.widgetDate, { color: colors.textMuted }]}>
                {formatDate(a.publishedAt)}
              </Text>
            </View>
          </WidgetCard>
        </Pressable>
      ),
    });
  }

  if (featured.upcomingEvent) {
    const e = featured.upcomingEvent;
    widgets.push({
      key: 'event',
      content: (
        <Pressable onPress={() => onEventPress(e)}>
          <WidgetCard style={expanded ? undefined : { width: 220 }}>
            <View style={[styles.widgetAccent, { backgroundColor: colors.primary }]} />
            <View style={styles.widgetContent}>
              <View style={styles.widgetHeader}>
                <Ionicons name="calendar" size={14} color={colors.primary} />
                <Text style={[styles.widgetLabel, { color: colors.primary }]}>Upcoming</Text>
              </View>
              <Text style={[styles.widgetTitle, { color: colors.text }]} numberOfLines={2}>
                {e.title}
              </Text>
              <View style={styles.widgetMeta}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.widgetDate, { color: colors.textMuted }]} numberOfLines={1}>
                  {e.eventLocation}
                </Text>
              </View>
            </View>
          </WidgetCard>
        </Pressable>
      ),
    });
  }

  if (featured.latestOfficial) {
    const l = featured.latestOfficial;
    widgets.push({
      key: 'official',
      content: (
        <Pressable onPress={() => {
          if (l.kind === 'news') onAnnouncementPress(l);
          else onAnnouncementPress(l);
        }}>
          <WidgetCard style={expanded ? undefined : { width: 220 }}>
            <View style={[styles.widgetAccent, { backgroundColor: colors.secondary }]} />
            <View style={styles.widgetContent}>
              <View style={styles.widgetHeader}>
                <Ionicons name="newspaper" size={14} color={colors.secondary} />
                <Text style={[styles.widgetLabel, { color: colors.secondary }]}>Latest</Text>
              </View>
              <Text style={[styles.widgetTitle, { color: colors.text }]} numberOfLines={2}>
                {l.title}
              </Text>
              <Text style={[styles.widgetDate, { color: colors.textMuted }]}>
                {formatDate(l.publishedAt)}
              </Text>
            </View>
          </WidgetCard>
        </Pressable>
      ),
    });
  }

  if (featured.activeOrgs.length > 0) {
    widgets.push({
      key: 'orgs',
      content: (
        <WidgetCard style={expanded ? undefined : { width: 220 }}>
          <View style={[styles.widgetAccent, { backgroundColor: colors.accent }]} />
          <View style={styles.widgetContent}>
            <View style={styles.widgetHeader}>
              <Ionicons name="people" size={14} color={colors.accent} />
              <Text style={[styles.widgetLabel, { color: colors.accent }]}>Active Orgs</Text>
            </View>
            {featured.activeOrgs.map((org) => (
              <Pressable key={org.id} onPress={() => onOrgPress(org.id)}>
                <View style={styles.orgRow}>
                  <Text style={[styles.orgName, { color: colors.text }]}>{org.name}</Text>
                  <Text style={[styles.orgCount, { color: colors.textMuted }]}>
                    {org.count} update{org.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </WidgetCard>
      ),
    });
  }

  if (widgets.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {widgets.map((w) => (
          <View key={w.key}>{w.content}</View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },
  scroll: {
    gap: spacing.sm,
  },
  widgetCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  widgetAccent: {
    height: 3,
  },
  widgetContent: {
    padding: spacing.sm,
    gap: 4,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  widgetLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  widgetTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    lineHeight: 18,
  },
  widgetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  widgetDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  orgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  orgName: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  orgCount: {
    fontSize: 11,
  },
});
