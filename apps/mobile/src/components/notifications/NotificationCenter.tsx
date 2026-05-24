import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { useNotificationStore } from '@/store/notification-store';

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  news: 'newspaper',
  announcement: 'megaphone',
  check_in: 'checkmark-circle',
  event_reminder: 'alarm',
};

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <AppButton variant="ghost" onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </AppButton>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        {notifications.length > 0 ? (
          <AppButton variant="ghost" onPress={markAllAsRead}>
            Mark all read
          </AppButton>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Updates and alerts will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => markAsRead(item.id)}
            style={[
              styles.item,
              {
                backgroundColor: item.read ? 'transparent' : colors.primary + '08',
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={typeIcons[item.type] || 'notifications'}
              size={22}
              color={item.read ? colors.textMuted : colors.primary}
            />
            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemTitle,
                  { color: colors.text, fontWeight: item.read ? '600' : '800' },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[styles.itemBody, { color: colors.textMuted }]} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
            {!item.read ? (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  spacer: {
    width: 100,
  },
  listContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: fontSizes.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: fontSizes.md,
  },
  itemBody: {
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
