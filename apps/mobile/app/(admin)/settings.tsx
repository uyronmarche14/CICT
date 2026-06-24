import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLogout } from '@/features/settings/useLogout';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

function SettingRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.settingValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={styles.toggleInfo}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary + '60' }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

export default function AdminSettingsScreen() {
  const { colors, isDark, toggleDark } = useTheme();
  const profile = useAuthStore((s) => s.adminProfile);
  const logoutMutation = useLogout();
  const [showAllPermissions, setShowAllPermissions] = useState(false);

  const permissions = profile?.user.effectivePermissions ?? [];
  const displayedPermissions = showAllPermissions ? permissions : permissions.slice(0, 8);

  const formatPermission = (p: string) =>
    p
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSettled: () => router.replace('/(auth)/login'),
          });
        },
      },
    ]);
  };

  return (
    <AdminModuleScreen
      moduleKey="settings"
      title="Settings"
      subtitle="Admin account and session controls."
    >
      <AppCard variant="elevated">
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {(profile?.user.firstName?.[0] ?? '?').toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {profile?.user.firstName} {profile?.user.lastName}
            </Text>
            <Text style={[styles.profileSubtext, { color: colors.textMuted }]}>
              {profile?.user.email}
            </Text>
          </View>
        </View>
        {profile?.user.effectiveRoleLabel ? (
          <SettingRow label="Role" value={profile.user.effectiveRoleLabel} />
        ) : null}
      </AppCard>

      {permissions.length > 0 ? (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Permissions</Text>
          {displayedPermissions.map((p) => (
            <View key={p} style={styles.permissionRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.permissionText, { color: colors.text }]}>
                {formatPermission(p)}
              </Text>
            </View>
          ))}
          {permissions.length > 8 ? (
            <AppButton variant="ghost" onPress={() => setShowAllPermissions(!showAllPermissions)}>
              {showAllPermissions ? 'Show less' : `Show all (${permissions.length})`}
            </AppButton>
          ) : null}
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <ToggleRow
          icon="moon-outline"
          label="Dark Mode"
          description="Use dark theme throughout the app."
          value={isDark}
          onValueChange={toggleDark}
        />
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <AppButton variant="danger" loading={logoutMutation.isPending} onPress={handleLogout}>
          Sign Out
        </AppButton>
      </AppCard>
    </AdminModuleScreen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  profileSubtext: {
    fontSize: fontSizes.sm,
  },
  settingRow: {
    gap: 4,
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  settingValue: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 3,
  },
  permissionText: {
    fontSize: fontSizes.sm,
  },
});
