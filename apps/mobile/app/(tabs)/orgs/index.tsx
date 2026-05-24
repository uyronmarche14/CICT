import { useRouter } from 'expo-router';
import { Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useOrganizations } from '@/features/orgs/useOrganizations';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function OrgsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const orgsQuery = useOrganizations();

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
      />

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
                      {org.members?.length ?? 0} members
                    </Text>
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
});
