import { useMemo, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

import { ConnectivityNotice } from '@/components/feedback/ConnectivityNotice';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { UpdateCard } from '@/components/updates/UpdateCard';
import { UpdateWidgets } from '@/components/updates/UpdateWidgets';
import { useUpdatesHub } from '@/features/updates/useUpdatesHub';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import type { UpdateItem, UpdateItemKind } from '@/types/models';

type FilterTab = UpdateItemKind | 'all';

const CATEGORY_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'news', label: 'News' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'event', label: 'Events' },
];

const SCOPE_TABS: { key: 'all' | 'official' | 'community'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'official', label: 'Official' },
  { key: 'community', label: 'Community' },
];

export default function UpdatesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const netInfo = useNetInfo();
  const [category, setCategory] = useState<FilterTab>('all');
  const [scope, setScope] = useState<'all' | 'official' | 'community'>('all');
  const [search, setSearch] = useState('');

  const filters = useMemo(() => ({ category, search, scope }), [category, search, scope]);
  const { items, featured, isLoading, isError, refetch, isRefetching } = useUpdatesHub(filters);

  const handleItemPress = (item: UpdateItem) => {
    if (item.kind === 'news') {
      router.push(`/(tabs)/updates/news/${item.id}`);
    } else if (item.kind === 'announcement') {
      router.push(`/(tabs)/updates/announcements/${item.id}`);
    } else if (item.kind === 'event') {
      router.push(`/(tabs)/events/${item.id}`);
    }
  };

  const handleOrgPress = (orgId: string) => {
    router.push(`/(tabs)/orgs/${orgId}`);
  };

  if (isLoading) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading updates..." />
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load updates right now."
          onAction={() => refetch()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      {!netInfo.isConnected ? <ConnectivityNotice /> : null}

      <SectionHeader
        title="Announcements"
        subtitle="News, announcements, and events from across CICT."
          branded
        />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = category === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setCategory(tab.key)}
              style={[
                styles.filterChip,
                isActive
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surfaceElevated, borderColor: colors.hairline },
              ]}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  { color: isActive ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {SCOPE_TABS.map((tab) => {
          const isActive = scope === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setScope(tab.key)}
              style={[
                styles.filterChip,
                isActive
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surfaceElevated, borderColor: colors.hairline },
              ]}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  { color: isActive ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <AppTextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search updates..."
      />

      <UpdateWidgets
        featured={featured}
        onAnnouncementPress={handleItemPress}
        onEventPress={handleItemPress}
        onOrgPress={handleOrgPress}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No updates found"
          description={
            search
              ? 'Try a different search term.'
              : 'No updates available yet in this category.'
          }
        />
      ) : (
        items.map((item) => (
          <UpdateCard key={`${item.kind}-${item.id}`} item={item} onPress={() => handleItemPress(item)} />
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  filterRow: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  filterChipLabel: {
    fontWeight: '700',
    fontSize: fontSizes.sm,
  },
});
