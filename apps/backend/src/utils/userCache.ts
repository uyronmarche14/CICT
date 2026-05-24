import { type IAuthenticatedUser } from '../types';

const CACHE_TTL_MS = 60000;

interface CacheEntry {
  user: IAuthenticatedUser;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

let cacheHits = 0;
let cacheMisses = 0;

export const getCachedUser = (key: string): IAuthenticatedUser | undefined => {
  const entry = cache.get(key);

  if (!entry) {
    cacheMisses++;
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    cacheMisses++;
    return undefined;
  }

  cacheHits++;
  return entry.user;
};

export const setCachedUser = (key: string, user: IAuthenticatedUser): void => {
  cache.set(key, {
    user,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
};

export const invalidateCachedUser = (key: string): void => {
  cache.delete(key);
};

export const clearUserCache = (): void => {
  cache.clear();
  cacheHits = 0;
  cacheMisses = 0;
};

export const getCacheStats = (): { size: number; hits: number; misses: number } => ({
  size: cache.size,
  hits: cacheHits,
  misses: cacheMisses,
});
