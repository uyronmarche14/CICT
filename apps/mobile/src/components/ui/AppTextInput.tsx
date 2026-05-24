import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, error, style, onFocus, onBlur, ...props }, ref) => {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: focused ? colors.primary : colors.border,
              color: colors.text,
            },
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </View>
    );
  }
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
  },
  error: {
    fontSize: fontSizes.xs,
  },
});
