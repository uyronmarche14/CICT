import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { queryKeys } from '@/constants/queryKeys';
import { useOrganizations } from '@/features/orgs/useOrganizations';
import { useMyMemberships, useResignFromOrg } from '@/features/memberships/useMemberships';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@/types/models';

export default function OrgsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const orgsQuery = useOrganizations();
  const membershipsQuery = useMyMemberships();
  const memberships = useMemo(() => membershipsQuery.data ?? [], [membershipsQuery.data]);

  const membershipMap = useMemo(() => {
    const map = new Map<string, { status: string; id: string }>();
    for (const m of memberships) {
      if (m.organizationId) {
        map.set(m.organizationId as string, { status: m.status, id: m._id });
      }
    }
    return map;
  }, [memberships]);

  const queryClient = useQueryClient();
  const resignMutation = useResignFromOrg();

  const orgMap = useMemo(() => {
    const map = new Map<string, Organization>();
    for (const org of orgsQuery.data ?? []) {
      map.set(org.id, org);
    }
    return map;
  }, [orgsQuery.data]);

  const myMemberships = useMemo(() => {
    const active: typeof memberships = [];
    const pending: typeof memberships = [];
    for (const m of memberships) {
      if (m.status === 'active') active.push(m);
      else if (m.status === 'applied' || m.status === 'invited') pending.push(m);
    }
    return [...active, ...pending];
  }, [memberships]);

  const handleResign = (membershipId: string, orgId: string, orgName: string) => {
    Alert.alert(
      'Leave Organization',
      `Are you sure you want to leave ${orgName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () =>
            resignMutation.mutate(
              { membershipId, orgId },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: queryKeys.memberships });
                  queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
                },
              }
            ),
        },
      ]
    );
  };

  const filteredOrgs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orgsQuery.data ?? [];
    return (orgsQuery.data ?? []).filter(
      (org) =>
        org.name.toLowerCase().includes(query) ||
        org.fullName.toLowerCase().includes(query) ||
        org.description.toLowerCase().includes(query)
    );
  }, [orgsQuery.data, search]);

  if (orgsQuery.isPending && !orgsQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading organizations..." />
      </AppScreen>
    );
  }

  if (orgsQuery.isError) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load organizations right now."
          onAction={() => void orgsQuery.refetch()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      refreshControl={
        <RefreshControl
          refreshing={orgsQuery.isRefetching}
          onRefresh={() => void orgsQuery.refetch()}
        />
      }
    >
      <SectionHeader
        title="Organizations"
        subtitle="Discover student organizations in CICT."
        branded
      />

      {myMemberships.length > 0 ? (
        <View style={styles.myOrgsSection}>
          <SectionHeader title={`My Organizations (${myMemberships.length})`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {myMemberships.map((m) => {
              const org = orgMap.get(m.organizationId as string);
              if (!org) return null;
              return (
                <Pressable
                  key={m._id}
                  onPress={() => router.push(`/(tabs)/orgs/${org.id}`)}
                >
                  <AppCard variant="elevated" style={styles.myOrgCard}>
                    {org.logo ? (
                      <Image source={{ uri: org.logo }} style={styles.myOrgLogo} />
                    ) : (
                      <View style={[styles.myOrgLogoPlaceholder, { backgroundColor: org.color?.primary || colors.primary }]}>
                        <Text style={styles.myOrgLogoInitial}>{org.name[0]}</Text>
                      </View>
                    )}
                    <Text style={[styles.myOrgName, { color: colors.text }]} numberOfLines={1}>
                      {org.name}
                    </Text>
                    {m.position ? (
                      <Text style={[styles.myOrgPosition, { color: colors.textMuted }]} numberOfLines={1}>
                        {m.position}
                      </Text>
                    ) : null}
                    <StatusPill
                      label={m.status === 'active' ? 'Member' : m.status}
                      tone={m.status === 'active' ? 'success' : 'warning'}
                    />
                    {m.status === 'active' ? (
                      <AppButton
                        variant="ghost"
                        loading={resignMutation.isPending}
                        onPress={() => handleResign(m._id, org.id, org.name)}
                        style={styles.resignButton}
                      >
                        Resign
                      </AppButton>
                    ) : null}
                  </AppCard>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <AppTextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search organizations..."
      />

      {filteredOrgs.length === 0 ? (
        <EmptyState
          title="No organizations found"
          description={search ? 'Try a different search term.' : 'No organizations available yet.'}
        />
      ) : (
        filteredOrgs.map((org) => (
          <Pressable key={org.id} onPress={() => router.push(`/(tabs)/orgs/${org.id}`)}>
            <AppCard style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.logoSection}>
                  {org.logo ? (
                    <Image source={{ uri: org.logo }} style={styles.logo} />
                  ) : (
                    <View style={[styles.logoPlaceholder, { backgroundColor: org.color?.primary || colors.primary }]}>
                      <Text style={styles.logoInitial}>{org.name[0]}</Text>
                    </View>
                  )}
                  {org.color?.primary ? (
                    <View style={[styles.colorDot, { backgroundColor: org.color.primary }]} />
                  ) : null}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: colors.text }]}>{org.name}</Text>
                  <Text style={[styles.cardFullName, { color: colors.textMuted }]} numberOfLines={1}>
                    {org.fullName}
                  </Text>
                  <Text style={[styles.cardDescription, { color: colors.textMuted }]} numberOfLines={2}>
                    {org.description}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.cardMetaText, { color: colors.textMuted }]}>
                    {org.membershipSize ?? 0} members
                  </Text>
                  {membershipMap.has(org.id) && (
                    <StatusPill
                      label={membershipMap.get(org.id)!.status === 'active' ? 'Member' :
                             membershipMap.get(org.id)!.status === 'applied' ? 'Pending' :
                             membershipMap.get(org.id)!.status}
                      tone={membershipMap.get(org.id)!.status === 'active' ? 'success' :
                            membershipMap.get(org.id)!.status === 'applied' ? 'warning' : 'neutral'}
                    />
                  )}
                </View>
                </View>
              </View>
            </AppCard>
          </Pressable>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  logoSection: {
    alignItems: 'center',
    gap: 4,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  cardFullName: {
    fontSize: fontSizes.xs,
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardMetaText: {
    fontSize: fontSizes.xs,
  },
  myOrgsSection: {
    marginBottom: spacing.md,
  },
  myOrgCard: {
    width: 180,
    marginRight: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  myOrgLogo: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
  },
  myOrgLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myOrgLogoInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  myOrgName: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  myOrgPosition: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  resignButton: {
    paddingHorizontal: 0,
  },
});
