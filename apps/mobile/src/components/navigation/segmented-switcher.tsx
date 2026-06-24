import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { hapticLight } from '@/utils/haptics';

type SegmentOption = {
  key: string;
  label: string;
};

type SegmentedSwitcherProps = {
  options: SegmentOption[];
  activeKey: string;
  onChange: (key: string) => void;
};

export function SegmentedSwitcher({
  options,
  activeKey,
  onChange,
}: SegmentedSwitcherProps) {
  const { colors } = useTheme();
  const activeIndex = options.findIndex((o) => o.key === activeKey);
  const translateX = useRef(new Animated.Value(0)).current;
  const prevIndex = useRef(activeIndex);

  if (prevIndex.current !== activeIndex) {
    Animated.spring(translateX, {
      toValue: activeIndex * 100 / options.length,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    prevIndex.current = activeIndex;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSoft }]}>
      {options.map((option) => {
        const isActive = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => {
              hapticLight();
              onChange(option.key);
            }}
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={styles.segment}
          >
            <View
              style={[
                styles.segmentInner,
                isActive && [
                  styles.segmentActive,
                  {
                    backgroundColor: colors.surface,
                    shadowColor: colors.shadow,
                  },
                ],
              ]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                  },
                  isActive && styles.labelActive,
                ]}
              >
                {option.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: 4,
    gap: 2,
  },
  segment: {
    flex: 1,
  },
  segmentInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  segmentActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  labelActive: {
    fontWeight: '800',
  },
});
