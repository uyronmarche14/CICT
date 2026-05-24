import { Paths, File, Directory } from 'expo-file-system';

const CACHE_DIR = 'cict_cache';
const DEFAULT_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

function cacheFile(key: string): File {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return new File(Paths.cache, `${CACHE_DIR}/${safe}.json`);
}

export const cache = {
  async set<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
    try {
      const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
      const file = cacheFile(key);
      const dir = new Directory(Paths.cache, CACHE_DIR);
      if (!dir.exists) {
        dir.create({ idempotent: true, intermediates: true });
      }
      file.write(JSON.stringify(entry));
    } catch {
      // cache write errors are non-critical — data already fetched
    }
  },

  async get<T>(key: string): Promise<{ data: T; stale: boolean } | null> {
    try {
      const file = cacheFile(key);
      if (!file.exists) return null;
      const raw = await file.text();
      const entry: CacheEntry<T> = JSON.parse(raw);
      return { data: entry.data, stale: Date.now() > entry.expiresAt };
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    const file = cacheFile(key);
    if (file.exists) file.delete();
  },

  async clear(): Promise<void> {
    const dir = new Directory(Paths.cache, CACHE_DIR);
    if (dir.exists) {
      for (const file of dir.list()) {
        file.delete();
      }
    }
  },
};

export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  try {
    const data = await fetcher();
    await cache.set(cacheKey, data, ttlMs);
    return data;
  } catch (error) {
    const cached = await cache.get<T>(cacheKey);
    if (cached) return cached.data;
    throw error;
  }
}
