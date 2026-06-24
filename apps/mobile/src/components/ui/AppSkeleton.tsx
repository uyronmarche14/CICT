import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/tokens';

type Props = {
  lines?: number;
  card?: boolean;
};

export function AppSkeleton({ lines = 3, card = true }: Props) {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonLine = (width: string, key: number) => (
    <Animated.View
      key={key}
      style={[styles.line, { width: width as any, backgroundColor: isDark ? '#2D2D2D' : '#E5E5E5', opacity }]}
    />
  );

  const content = (
    <View style={styles.container}>
      {skeletonLine('60%', 0)}
      {Array.from({ length: lines }).map((_, i) =>
        skeletonLine(i === lines - 1 ? '40%' : '100%', i + 1)
      )}
    </View>
  );

  if (!card) return content;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  line: {
    height: 12,
    borderRadius: 6,
  },
});
