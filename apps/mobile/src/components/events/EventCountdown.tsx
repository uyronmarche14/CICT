import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

function computeRemaining(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, isOver: false };
}

export function EventCountdown({ targetDate }: { targetDate: string }) {
  const { colors, isDark } = useTheme();
  const [remaining, setRemaining] = useState(() => computeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(computeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (remaining.isOver) {
    return (
      <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
        <Text style={[styles.label, { color: colors.success, fontWeight: '900' }]}>
          Event started
        </Text>
      </View>
    );
  }

  const isUrgent = remaining.hours < 1;
  const bgColor = isUrgent
    ? colors.danger + '20'
    : isDark
      ? 'rgba(255,255,255,0.08)'
      : colors.surfaceMuted;

  const textColor = isUrgent ? colors.danger : colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor }]}>
        Starts in {remaining.hours > 0 ? `${remaining.hours}h ` : ''}
        {remaining.minutes}m {remaining.seconds}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
