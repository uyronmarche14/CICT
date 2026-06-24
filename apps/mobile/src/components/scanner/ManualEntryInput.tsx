import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

type ManualEntryInputProps = {
  onSubmit: (studentNumber: string) => void;
  loading: boolean;
};

const STUDENT_NUMBER_PATTERN = /^[A-Z]{2}-\d{4}$/;

export function ManualEntryInput({ onSubmit, loading }: ManualEntryInputProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const formatted = value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 7);

  const handleSubmit = () => {
    if (!STUDENT_NUMBER_PATTERN.test(formatted)) {
      setError('Use the format XX-1111.');
      return;
    }

    setError('');
    onSubmit(formatted);
    setValue('');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.dividerLabel, { color: colors.textMuted }]}>Manual entry</Text>
      <AppTextInput
        value={formatted}
        onChangeText={(nextValue) => {
          setValue(nextValue);
          setError('');
        }}
        placeholder="Student number: XX-1111"
        autoCapitalize="characters"
        autoCorrect={false}
        error={error}
      />
      <AppButton
        variant="secondary"
        onPress={handleSubmit}
        loading={loading}
        disabled={formatted.length < 7}
      >
        Check In
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  dividerLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

