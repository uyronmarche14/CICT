import { useEffect, useRef, PropsWithChildren } from 'react';
import { Animated, ViewStyle } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';

type Props = PropsWithChildren<{
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glass';
  index?: number;
}>;

export function AnimatedCard({ children, style, variant, index = 0 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AppCard variant={variant} style={style}>
        {children}
      </AppCard>
    </Animated.View>
  );
}
