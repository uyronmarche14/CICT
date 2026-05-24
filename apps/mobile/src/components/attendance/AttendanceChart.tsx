import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

type MonthlyData = {
  month: string;
  count: number;
};

type AttendanceChartProps = {
  data: MonthlyData[];
  maxCount: number;
};

export function AttendanceChart({ data, maxCount }: AttendanceChartProps) {
  const { colors } = useTheme();
  const barWidth = Math.max(20, Math.min(36, (300 - data.length * 8) / data.length));

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <View key={item.month} style={styles.barCol}>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(height, 4)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{item.month}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  barTrack: {
    width: '100%',
    maxWidth: 36,
    height: 100,
    borderRadius: radii.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: radii.sm,
    minHeight: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
