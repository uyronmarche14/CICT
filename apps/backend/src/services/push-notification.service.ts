import PushToken from '../models/PushToken';
import logger from '../utils/logger';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

let expoClient: {
  send: (messages: { to: string; sound?: string; title: string; body: string; data: Record<string, unknown>; priority: string }[]) => Promise<void>;
  isValidToken: (token: string) => boolean;
} | null | undefined = undefined;

async function getExpoClient() {
  if (expoClient === undefined) {
    try {
      const ExpoSdk = await (import('expo-server-sdk') as any);
      const expo = new ExpoSdk.Expo();
      expoClient = {
        send: async (messages) => {
          const chunks = expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
          }
        },
        isValidToken: (token: string) => ExpoSdk.Expo.isExpoPushToken(token),
      };
    } catch {
      logger.warn('Failed to load expo-server-sdk. Push notifications disabled.');
      expoClient = null;
    }
  }
  return expoClient;
}

async function sendToStudent(studentId: string, payload: PushPayload): Promise<void> {
  try {
    const expo = await getExpoClient();
    if (!expo) {
      return;
    }

    const tokens = await PushToken.find({ studentId }).lean();
    if (tokens.length === 0) {
      return;
    }

    const messages: {
      to: string;
      sound?: string;
      title: string;
      body: string;
      data: Record<string, unknown>;
      priority: string;
    }[] = [];

    for (const { token, platform } of tokens) {
      if (!expo.isValidToken(token)) {
        logger.warn(`Invalid Expo push token for student ${studentId}: ${token}`);
        continue;
      }

      messages.push({
        to: token,
        sound: platform === 'ios' ? 'default' : undefined,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        priority: 'high',
      });
    }

    if (messages.length === 0) {
      return;
    }

    await expo.send(messages);
  } catch (error) {
    logger.error(`Failed to send push notification to student ${studentId}:`, error);
  }
}

async function sendToAll(payload: PushPayload): Promise<void> {
  try {
    const expo = await getExpoClient();
    if (!expo) {
      return;
    }

    const allTokens = await PushToken.find().lean();
    const studentIds = [...new Set(allTokens.map((t) => t.studentId.toString()))];

    await Promise.all(studentIds.map((studentId) => sendToStudent(studentId, payload)));
  } catch (error) {
    logger.error('Failed to send push notification to all students:', error);
  }
}

export const pushNotificationService = {
  sendToStudent,
  sendToAll,
};
