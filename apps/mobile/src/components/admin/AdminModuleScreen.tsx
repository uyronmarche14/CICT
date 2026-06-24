import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import type { MobileAdminTabKey } from '@/utils/admin-access';
import { canUseAdminTab } from '@/utils/admin-access';

type AdminModuleScreenProps = PropsWithChildren<{
  moduleKey: MobileAdminTabKey;
  title: string;
  subtitle: string;
}>;

export function AdminModuleScreen({
  children,
  moduleKey,
  title,
  subtitle,
}: AdminModuleScreenProps) {
  const { colors } = useTheme();
  const adminProfile = useAuthStore((state) => state.adminProfile);
  const canUseModule = canUseAdminTab(adminProfile, moduleKey);

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Admin</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>

      {canUseModule ? (
        children
      ) : (
        <AppCard>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Access unavailable</Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            Your account does not include this admin module.
          </Text>
        </AppCard>
      )}
    </AppScreen>
  );
}

export function AdminMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <AppCard style={styles.metricCard}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  cardText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  metricCard: {
    minHeight: 92,
  },
  metricValue: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
