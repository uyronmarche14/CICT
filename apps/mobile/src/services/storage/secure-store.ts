import * as SecureStore from 'expo-secure-store';

import type { AuthTokens, MobileSession } from '@/types/api';

const ACCESS_TOKEN_KEY = 'cict_mobile_access_token';
const REFRESH_TOKEN_KEY = 'cict_mobile_refresh_token';
const SESSION_KEY = 'cict_mobile_session_v1';

function parseSession(value: string | null): MobileSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as MobileSession;
    if (
      parsed &&
      (parsed.actorType === 'student' || parsed.actorType === 'admin') &&
      parsed.accessToken &&
      parsed.refreshToken
    ) {
      return parsed;
    }
  } catch {}

  return null;
}

export const sessionStorage = {
  async getSession(): Promise<MobileSession | null> {
    return parseSession(await SecureStore.getItemAsync(SESSION_KEY));
  },

  async saveSession(session: MobileSession) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },

  async saveTokens(tokens: AuthTokens) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  },

  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(SESSION_KEY),
    ]);
  },
};
