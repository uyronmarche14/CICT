export async function scheduleEventReminder(event: {
  _id: string;
  title: string;
  startDate: string;
  location?: string;
}) {
  const Notifications = require('expo-notifications');

  const eventStart = new Date(event.startDate).getTime();
  const now = Date.now();
  const msUntilStart = eventStart - now;

  if (msUntilStart <= 0) return;

  const reminderTimes = [
    { label: '1 hour before', ms: 60 * 60 * 1000 },
    { label: '15 minutes before', ms: 15 * 60 * 1000 },
  ];

  for (const { label, ms } of reminderTimes) {
    if (msUntilStart > ms) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${event.title}`,
          body: `${label} at ${event.location || 'CICT'}`,
          data: { type: 'event_reminder', eventId: event._id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor((msUntilStart - ms) / 1000),
        },
      });
    }
  }
}

export async function cancelEventReminder(eventId: string) {
  const Notifications = require('expo-notifications');
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n: any) => {
    const data = n.content.data as Record<string, unknown> | undefined;
    return data?.eventId === eventId && data?.type === 'event_reminder';
  });
  await Promise.all(toCancel.map((n: any) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}
