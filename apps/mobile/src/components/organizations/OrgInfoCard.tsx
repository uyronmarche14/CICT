import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import type { AdminOrg } from '@/services/api/admin-organizations';

type Props = {
  org: AdminOrg;
};

export function OrgInfoCard({ org }: Props) {
  const { colors } = useTheme();
  const primaryColor = org.color?.primary ?? colors.primary;

  return (
    <AppCard>
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
          <Text style={[styles.fullName, { color: colors.textMuted }]}>{org.fullName}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {org.organizationType ? (
          <StatusPill label={org.organizationType} tone="neutral" />
        ) : null}
        <StatusPill
          label={org.isActive ? 'Active' : 'Inactive'}
          tone={org.isActive ? 'success' : 'danger'}
        />
      </View>

      {org.description ? (
        <Text style={[styles.desc, { color: colors.textMuted }]}>{org.description}</Text>
      ) : null}

      {org.email || org.phone ? (
        <View style={styles.contact}>
          {org.email ? (
            <Pressable onPress={() => Linking.openURL(`mailto:${org.email}`)}>
              <Text style={[styles.link, { color: colors.primary }]}>{org.email}</Text>
            </Pressable>
          ) : null}
          {org.phone ? (
            <Text style={[styles.contactText, { color: colors.textMuted }]}>{org.phone}</Text>
          ) : null}
        </View>
      ) : null}

      {org.building || org.room ? (
        <Text style={[styles.location, { color: colors.textMuted }]}>
          {[org.building, org.room].filter(Boolean).join(', ')}
        </Text>
      ) : null}

      {org.advisorName ? (
        <Text style={[styles.advisor, { color: colors.textMuted }]}>
          Advisor: {org.advisorName}
        </Text>
      ) : null}

      <Text style={[styles.memberCount, { color: colors.textMuted }]}>
        {org.members?.length ?? 0} members
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  fullName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  desc: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  contact: {
    gap: 2,
  },
  link: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  contactText: {
    fontSize: fontSizes.sm,
  },
  location: {
    fontSize: fontSizes.sm,
  },
  advisor: {
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
  },
  memberCount: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
