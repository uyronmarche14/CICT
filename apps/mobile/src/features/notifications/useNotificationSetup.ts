import { useEffect } from 'react';
import Constants from 'expo-constants';
import { router } from 'expo-router';

import { registerForPushNotifications } from '@/services/notifications/register';
import { setupNotificationHandler } from '@/services/notifications/notification-handler';

export function useNotificationSetup() {
  useEffect(() => {
    if (Constants.executionEnvironment === 'storeClient') return;

    const subscription = setupNotificationHandler();

    registerForPushNotifications().catch(() => {});

    return () => {
      subscription.remove();
    };
  }, []);
}

export function useNotificationResponse() {
  useEffect(() => {
    if (Constants.executionEnvironment === 'storeClient') return;

    const Notifications = require('expo-notifications');
    const sub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      if (!data?.type) return;

      switch (data.type) {
        case 'news':
          router.push(`/(tabs)/updates/news/${data.newsId}`)
          break
        case 'announcement':
          router.push(`/(tabs)/updates/announcements/${data.announcementId}`)
          break
        case 'event_reminder':
        case 'event':
          router.push(`/(tabs)/events/${data.eventId}`)
          break
        case 'check_in':
          router.push(`/(tabs)/settings`)
          break
      }
    });

    return () => sub.remove();
  }, []);
}
