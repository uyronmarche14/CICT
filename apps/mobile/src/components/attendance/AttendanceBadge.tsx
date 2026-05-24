import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { hapticHeavy } from '@/utils/haptics';

type BadgeTier = {
  key: string;
  emoji: string;
  label: string;
  threshold: number;
};

const BADGE_TIERS: BadgeTier[] = [
  { key: 'bronze', emoji: '🥉', label: 'Bronze', threshold: 5 },
  { key: 'silver', emoji: '🥈', label: 'Silver', threshold: 10 },
  { key: 'gold', emoji: '🥇', label: 'Gold', threshold: 25 },
  { key: 'diamond', emoji: '💎', label: 'Diamond', threshold: 50 },
];

function getCurrentBadge(totalCheckIns: number): BadgeTier | null {
  let earned: BadgeTier | null = null;
  for (const tier of BADGE_TIERS) {
    if (totalCheckIns >= tier.threshold) {
      earned = tier;
    }
  }
  return earned;
}

function getNextBadge(totalCheckIns: number): BadgeTier | null {
  for (const tier of BADGE_TIERS) {
    if (totalCheckIns < tier.threshold) {
      return tier;
    }
  }
  return null;
}

export function AttendanceBadge({ totalCheckIns }: { totalCheckIns: number }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const prevTotal = useRef(totalCheckIns);

  const currentBadge = getCurrentBadge(totalCheckIns);
  const nextBadge = getNextBadge(totalCheckIns);
  const progress = nextBadge
    ? Math.min(1, (totalCheckIns - (BADGE_TIERS.find((t) => t.key === nextBadge.key) === BADGE_TIERS[0] ? 0 : (BADGE_TIERS[BADGE_TIERS.indexOf(nextBadge) - 1]?.threshold ?? 0))) / (nextBadge.threshold - (BADGE_TIERS.find((t) => t.key === nextBadge.key) === BADGE_TIERS[0] ? 0 : (BADGE_TIERS[BADGE_TIERS.indexOf(nextBadge) - 1]?.threshold ?? 0))))
    : 1;

  useEffect(() => {
    if (totalCheckIns > prevTotal.current) {
      hapticHeavy();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
    prevTotal.current = totalCheckIns;
  }, [totalCheckIns, scale]);

  if (!currentBadge && !nextBadge) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {currentBadge ? (
        <Animated.View style={[styles.badgeRow, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>{currentBadge.emoji}</Text>
          <View style={styles.badgeInfo}>
            <Text style={[styles.badgeLabel, { color: colors.text }]}>
              {currentBadge.label}
            </Text>
            <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>
              {totalCheckIns} check-ins
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {nextBadge ? (
        <View style={styles.nextRow}>
          <Text style={[styles.nextLabel, { color: colors.textMuted }]}>
            Next: {nextBadge.emoji} {nextBadge.label}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            {totalCheckIns} / {nextBadge.threshold}
          </Text>
        </View>
      ) : (
        <Text style={[styles.maxedLabel, { color: colors.primary }]}>
          💎 Max tier achieved!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 36,
  },
  badgeInfo: {
    gap: 2,
  },
  badgeLabel: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  badgeDesc: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  nextRow: {
    gap: 6,
  },
  nextLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textAlign: 'right',
  },
  maxedLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
});
