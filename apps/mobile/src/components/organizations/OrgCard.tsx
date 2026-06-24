import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import type { AdminOrg } from '@/services/api/admin-organizations';

type Props = {
  org: AdminOrg;
  onPress?: () => void;
};

export function OrgCard({ org, onPress }: Props) {
  const { colors } = useTheme();
  const primaryColor = org.color?.primary ?? colors.primary;

  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        {org.banner ? (
          <Image source={{ uri: org.banner }} style={styles.banner} />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: primaryColor + '30' }]} />
        )}
        <View style={styles.content}>
          <View style={styles.logoRow}>
            {org.logo ? (
              <Image source={{ uri: org.logo }} style={[styles.logo, { borderColor: colors.border }]} />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: primaryColor }]}>
                <Text style={styles.logoText}>{org.name[0]}</Text>
              </View>
            )}
            <View style={styles.titleArea}>
              <Text style={[styles.name, { color: colors.text }]}>{org.name}</Text>
              <Text style={[styles.fullName, { color: colors.textMuted }]} numberOfLines={1}>
                {org.fullName}
              </Text>
            </View>
          </View>
          <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
            {org.description}
          </Text>
          <View style={styles.meta}>
            {org.organizationType ? (
              <StatusPill label={org.organizationType} tone="neutral" />
            ) : null}
            <StatusPill
              label={org.isActive ? 'Active' : 'Inactive'}
              tone={org.isActive ? 'success' : 'danger'}
            />
            <View style={styles.memberIcon}>
              <Ionicons name="people" size={14} color={colors.textMuted} />
              <Text style={[styles.memberCount, { color: colors.textMuted }]}>
                {org.members?.length ?? 0}
              </Text>
            </View>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 100,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 100,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  fullName: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  desc: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
