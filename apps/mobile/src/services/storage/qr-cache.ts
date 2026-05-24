import * as SecureStore from 'expo-secure-store';

const QR_CACHE_PREFIX = 'cict_qr_';

type CachedQr = {
  token: string;
  cachedAt: string;
};

export const qrCache = {
  async cacheToken(eventId: string, token: string) {
    const payload: CachedQr = { token, cachedAt: new Date().toISOString() };
    try {
      await SecureStore.setItemAsync(`${QR_CACHE_PREFIX}${eventId}`, JSON.stringify(payload));
    } catch {}
  },

  async getCachedToken(eventId: string): Promise<CachedQr | null> {
    try {
      const raw = await SecureStore.getItemAsync(`${QR_CACHE_PREFIX}${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachedQr;

      const cachedDate = new Date(parsed.cachedAt);
      const now = new Date();
      const daysSinceCached = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCached > 7) {
        await this.clearEventCache(eventId);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  async clearEventCache(eventId: string) {
    try {
      await SecureStore.deleteItemAsync(`${QR_CACHE_PREFIX}${eventId}`);
    } catch {}
  },

  async clearAll() {
    try {
      const allKeys = await SecureStore.getItemAsync('qr_cache_keys');
      if (allKeys) {
        const keys = JSON.parse(allKeys) as string[];
        await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
        await SecureStore.deleteItemAsync('qr_cache_keys');
      }
    } catch {}
  },
};
