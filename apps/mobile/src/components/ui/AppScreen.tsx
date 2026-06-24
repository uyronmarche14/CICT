import { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

type AppScreenProps = PropsWithChildren<
  {
    scroll?: boolean;
  } & ScrollViewProps
>;

const TAB_BAR_HEIGHT = 72;

export function AppScreen({ children, scroll = true, contentContainerStyle, ...props }: AppScreenProps) {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const bottomInset = TAB_BAR_HEIGHT + (bottom > 0 ? bottom : 16);

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
        <ScrollView
          {...props}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomInset + spacing.lg },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <View style={[styles.fixedContent, { paddingBottom: bottomInset + spacing.lg }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  fixedContent: {
    flex: 1,
    padding: spacing.lg,
  },
});
