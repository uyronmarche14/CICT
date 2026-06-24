import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { OrgCard } from '@/components/organizations/OrgCard';
import { OrgInfoCard } from '@/components/organizations/OrgInfoCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  useOrganizationDetail,
  useOrganizations,
  useOrgTasks,
  useOrgMeetings,
  useOrgVotes,
} from '@/features/organizations/useOrganizations';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

const TYPE_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Academic', value: 'Academic' },
  { label: 'Cultural', value: 'Cultural' },
  { label: 'Sports', value: 'Sports' },
] as const;

type TabKey = 'overview' | 'tasks' | 'meetings' | 'voting' | 'members';

export default function AdminOrganizationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<TabKey>('overview');

  const { data: orgs, isLoading, isError, refetch, isRefetching } = useOrganizations();
  const { data: detail } = useOrganizationDetail(selectedId ?? undefined);
  const { data: tasks } = useOrgTasks(selectedId ?? undefined);
  const { data: meetings } = useOrgMeetings(selectedId ?? undefined);
  const { data: votes } = useOrgVotes(selectedId ?? undefined);

  const filteredOrgs = useMemo(() => {
    if (!orgs) return [];
    if (!typeFilter) return orgs;
    return orgs.filter((o) => o.organizationType === typeFilter);
  }, [orgs, typeFilter]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: `Tasks (${tasks?.length ?? 0})` },
    { key: 'meetings', label: `Meetings (${meetings?.length ?? 0})` },
    { key: 'voting', label: `Votes (${votes?.length ?? 0})` },
    { key: 'members', label: `Members (${detail?.members?.length ?? 0})` },
  ];

  if (selectedId && detail) {
    return (
      <AppScreen>
        <AppButton variant="ghost" onPress={() => { setSelectedId(null); setSubTab('overview'); }}>
          Back
        </AppButton>

        <OrgInfoCard org={detail} />

        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setSubTab(t.key)}
                style={[styles.tab, subTab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              >
                <Text style={[styles.tabLabel, { color: subTab === t.key ? colors.primary : colors.textMuted }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {subTab === 'overview' && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{detail.members?.length ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Members</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.info }]}>{tasks?.length ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tasks</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>{meetings?.length ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Meetings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{votes?.length ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Votes</Text>
            </View>
          </View>
        )}

        {subTab === 'tasks' && (
          <View style={styles.subContent}>
            {tasks?.length ? tasks.map((t: any, i: number) => (
              <AppCard key={i}><Text style={{ color: colors.text }}>{t.title ?? t.name ?? `Task ${i + 1}`}</Text></AppCard>
            )) : <EmptyState title="No tasks" description="" />}
          </View>
        )}

        {subTab === 'meetings' && (
          <View style={styles.subContent}>
            {meetings?.length ? meetings.map((m: any, i: number) => (
              <AppCard key={i}><Text style={{ color: colors.text }}>{m.title ?? m.name ?? `Meeting ${i + 1}`}</Text></AppCard>
            )) : <EmptyState title="No meetings" description="" />}
          </View>
        )}

        {subTab === 'voting' && (
          <View style={styles.subContent}>
            {votes?.length ? votes.map((v: any, i: number) => (
              <AppCard key={i}><Text style={{ color: colors.text }}>{v.title ?? v.name ?? `Vote ${i + 1}`}</Text></AppCard>
            )) : <EmptyState title="No votes" description="" />}
          </View>
        )}

        {subTab === 'members' && (
          <View style={styles.subContent}>
            {detail.members?.length ? detail.members.map((m) => (
              <AppCard key={m.id}>
                <Text style={[styles.memberName, { color: colors.text }]}>{m.name}</Text>
                {m.position ? <Text style={[styles.memberPos, { color: colors.textMuted }]}>{m.position}</Text> : null}
              </AppCard>
            )) : <EmptyState title="No members" description="" />}
          </View>
        )}
      </AppScreen>
    );
  }

  return (
    <AdminModuleScreen
      moduleKey="organizations"
      title="Organizations"
      subtitle="Browse and manage organizations."
    >
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setTypeFilter(f.value)}>
            <StatusPill
              label={f.label}
              tone={typeFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingState label="Loading organizations..." />
      ) : isError ? (
        <ErrorState description="Could not load organizations." />
      ) : filteredOrgs.length === 0 ? (
        <EmptyState
          title="No organizations found"
          description="No organizations available."
        />
      ) : (
        filteredOrgs.map((org) => (
          <OrgCard
            key={org._id}
            org={org}
            onPress={() => setSelectedId(org._id)}
          />
        ))
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
  tabBar: {
    marginTop: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
  },
  tabLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    padding: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  subContent: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  memberName: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  memberPos: {
    fontSize: fontSizes.sm,
  },
});
