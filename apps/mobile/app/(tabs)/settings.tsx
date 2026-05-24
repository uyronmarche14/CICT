import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { AttendanceChart } from '@/components/attendance/AttendanceChart';
import { AttendanceLogCard } from '@/components/attendance/AttendanceLogCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAttendanceStats } from '@/features/attendance/useAttendanceStats';
import { useAttendanceHistory } from '@/features/attendance/useAttendanceHistory';
import { useLogout } from '@/features/settings/useLogout';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatName } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';

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
  label,
  icon,
  description,
  value,
  onValueChange,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
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

export default function SettingsScreen() {
  const logoutMutation = useLogout();
  const student = useAuthStore((state) => state.student);
  const { stats, isPending: statsPending, isError: statsError } = useAttendanceStats();
  const { colors, isDark, toggleDark } = useTheme();
  const logs = useAttendanceHistory();
  const allLogs = logs.data ?? [];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      Alert.alert('Logged out', 'Your local session has been cleared.');
    }
  };

  return (
    <AppScreen>
      <SectionHeader
        title="Settings"
        subtitle="Your account and preferences."
      />

      <AppCard variant="elevated">
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {student ? formatName(student.firstName, student.lastName)[0] : '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {student ? formatName(student.firstName, student.lastName) : 'Student'}
            </Text>
            <Text style={[styles.profileSubtext, { color: colors.textMuted }]}>
              {student?.studentNumber || 'Not signed in'}
            </Text>
          </View>
        </View>
        {student?.email ? <SettingRow label="Email" value={student.email} /> : null}
        {student?.programId && typeof student.programId === 'object' ? (
          <SettingRow label="Program" value={student.programId.name ?? student.programId.code ?? ''} />
        ) : null}
        {student?.yearLevelId && typeof student.yearLevelId === 'object' ? (
          <SettingRow label="Year Level" value={student.yearLevelId.label ?? student.yearLevelId.code ?? ''} />
        ) : null}
        {student?.sectionId && typeof student.sectionId === 'object' ? (
          <SettingRow label="Section" value={student.sectionId.displayName ?? student.sectionId.name ?? ''} />
        ) : null}
      </AppCard>

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

      <SectionHeader title="Attendance" subtitle={`${stats.totalCheckIns} total check-ins`} />
      {statsPending && !stats.totalCheckIns ? (
        <LoadingState label="Loading attendance stats..." />
      ) : statsError ? null : (
        <AppCard>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {stats.currentStreak === 1 ? 'day streak' : 'day streak'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={20} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.longestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>best streak</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={20} color={colors.secondary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.thisSemesterCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>this semester</Text>
            </View>
          </View>
          {stats.monthly.length > 1 ? (
            <AttendanceChart data={stats.monthly} maxCount={stats.maxMonthly} />
          ) : null}
        </AppCard>
      )}

      {allLogs.length === 0 ? (
        <EmptyState
          title="No check-ins yet"
          description="Once you check in to events, your attendance history will appear here."
        />
      ) : (
        allLogs.map((log, index) => (
          <AttendanceLogCard
            key={log._id}
            log={log}
            isLast={index === allLogs.length - 1}
          />
        ))
      )}

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sign out</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Use this when you want to clear your local mobile session on the current device.
        </Text>
        <AppButton variant="danger" loading={logoutMutation.isPending} onPress={handleLogout}>
          Sign out
        </AppButton>
      </AppCard>
    </AppScreen>
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
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
