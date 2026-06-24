import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AdminMetricCard, AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAdminEvents } from '@/features/events/useAdminEvents';
import { useApprovalStats } from '@/features/approvals/useApprovals';
import { useDashboardSummary } from '@/features/dashboard/useDashboard';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import type { MobileAdminTabKey } from '@/utils/admin-access';
import { canUseAdminTab } from '@/utils/admin-access';

const TOOL_ROUTES = {
  scanner: '/(admin)/scanner',
  events: '/(admin)/events',
  approvals: '/(admin)/approvals',
  students: '/(admin)/students',
  organizations: '/(admin)/organizations',
} as const;

interface ToolEntry {
  key: MobileAdminTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  subtitle: string;
}

const METRIC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  events: 'calendar',
  students: 'school',
  organizations: 'business',
  users: 'people',
  news: 'newspaper',
  announcements: 'megaphone',
  roles: 'shield-checkmark',
};

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.adminProfile);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: approvalStats } = useApprovalStats();
  const { data: events } = useAdminEvents();

  const todayEvents = useMemo(() => {
    const today = new Date().toDateString();
    return (events ?? []).filter((e) => new Date(e.startDate).toDateString() === today);
  }, [events]);

  const tools: ToolEntry[] = [
    { key: 'scanner', label: 'Scanner', icon: 'camera', route: TOOL_ROUTES.scanner, subtitle: todayEvents.length > 0 ? `${todayEvents.length} event${todayEvents.length === 1 ? '' : 's'} today` : 'Attendance check-in' },
    { key: 'events', label: 'Events', icon: 'calendar', route: TOOL_ROUTES.events, subtitle: `${events?.length ?? 0} total event${events?.length === 1 ? '' : 's'}` },
    { key: 'approvals', label: 'Approval Requests', icon: 'checkbox', route: TOOL_ROUTES.approvals, subtitle: approvalStats ? `${approvalStats.pending} pending` : 'Review content' },
    { key: 'students', label: 'Students', icon: 'school', route: TOOL_ROUTES.students, subtitle: 'View student profiles' },
    { key: 'organizations', label: 'Organizations', icon: 'business', route: TOOL_ROUTES.organizations, subtitle: 'Browse and manage' },
  ];

  const calendarRoute = '/(admin)/calendar';

  const visibleTools = tools.filter((tool) => canUseAdminTab(profile, tool.key));

  const visibleMetrics = useMemo(() => {
    if (!summary?.cards) return [];
    const cards = summary.cards;
    const visible = summary.visibleModules ?? [];
    return Object.entries(cards)
      .filter(([key]) => visible.includes(key) || key === 'events' || key === 'students' || key === 'organizations')
      .map(([key, value]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value),
        icon: METRIC_ICONS[key] ?? 'analytics',
      }));
  }, [summary]);

  return (
    <AdminModuleScreen
      moduleKey="dashboard"
      title="Dashboard"
      subtitle="Tools and activity overview."
    >
      {summaryLoading ? (
        <LoadingState label="Loading summary..." />
      ) : (
        <View style={styles.metricsGrid}>
          {visibleMetrics.map((m) => (
            <View key={m.key} style={[styles.metricCard, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name={m.icon} size={18} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{m.label}</Text>
            </View>
          ))}
        </View>
      )}

      {approvalStats && approvalStats.pending > 0 ? (
        <Pressable
          onPress={() => (router as any).push('/(admin)/approvals')}
          style={[styles.pendingBanner, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
        >
          <Ionicons name="alert-circle" size={20} color={colors.warning} />
          <Text style={[styles.pendingText, { color: colors.warning }]}>
            {approvalStats.pending} item{approvalStats.pending === 1 ? '' : 's'} pending approval
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => (router as any).push(calendarRoute)}
        style={[styles.toolCard, { backgroundColor: colors.surface }]}
      >
        <Ionicons name="calendar" size={20} color={colors.primary} />
        <View style={styles.toolInfo}>
          <Text style={[styles.toolLabel, { color: colors.text }]}>Calendar</Text>
          <Text style={[styles.toolSubtitle, { color: colors.textMuted }]}>Upcoming 7 days</Text>
        </View>
      </Pressable>

      {visibleTools.map((tool) => (
        <Pressable
          key={tool.key}
          onPress={() => (router as any).push(tool.route)}
          style={[styles.toolCard, { backgroundColor: colors.surface }]}
        >
          <Ionicons name={tool.icon} size={20} color={colors.primary} />
          <View style={styles.toolInfo}>
            <Text style={[styles.toolLabel, { color: colors.text }]}>{tool.label}</Text>
            <Text style={[styles.toolSubtitle, { color: colors.textMuted }]}>{tool.subtitle}</Text>
          </View>
        </Pressable>
      ))}

      {todayEvents.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Events</Text>
          {todayEvents.map((event) => (
            <Pressable
              key={event._id}
              onPress={() => (router as any).push(`/(admin)/events/${event._id}`)}
              style={[styles.eventCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.eventInfo}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                <Text style={[styles.eventMeta, { color: colors.textMuted }]}>
                  {event.location}
                </Text>
              </View>
              <Text style={[styles.eventCount, { color: colors.primary }]}>
                {event.registeredCount ?? 0}/{event.maxAttendees ?? '∞'}
              </Text>
            </Pressable>
          ))}
        </>
      ) : null}
    </AdminModuleScreen>
  );
}

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: 80,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  pendingText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    flex: 1,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  toolInfo: {
    flex: 1,
    gap: 2,
  },
  toolLabel: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  toolSubtitle: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  eventMeta: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  eventCount: {
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
});
