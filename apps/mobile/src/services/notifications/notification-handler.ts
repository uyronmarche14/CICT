import { useNotificationStore } from '@/store/notification-store';
import type { AppNotification } from '@/store/notification-store';

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function inferNotificationType(
  data?: Record<string, unknown>
): AppNotification['type'] {
  if (data?.type === 'news') return 'news';
  if (data?.type === 'announcement') return 'announcement';
  if (data?.type === 'event_reminder') return 'event_reminder';
  if (data?.type === 'check_in') return 'check_in';
  return 'announcement';
}

export function setupNotificationHandler() {
  const Notifications = require('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const subscription = Notifications.addNotificationReceivedListener((event: any) => {
    const { title, body, data } = event.request.content;
    const notification: AppNotification = {
      id: generateId(),
      type: inferNotificationType((data ?? {}) as Record<string, unknown>),
      title: title || 'Notification',
      body: body || '',
      data: (data ?? {}) as Record<string, unknown>,
      receivedAt: new Date().toISOString(),
      read: false,
    };
    useNotificationStore.getState().addNotification(notification);
  });

  return subscription;
}
