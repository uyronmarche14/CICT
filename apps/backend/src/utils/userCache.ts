import { type IAuthenticatedUser } from '../types';
import { TypedCache } from './cache';

const userAuthCache = new TypedCache<IAuthenticatedUser>({
  namespace: 'auth:user',
  ttlMs: 5 * 60 * 1000,
});

export const getCachedUser = (key: string): Promise<IAuthenticatedUser | undefined> =>
  userAuthCache.get(key);

export const setCachedUser = (key: string, user: IAuthenticatedUser): Promise<void> =>
  userAuthCache.set(key, user);

export const invalidateCachedUser = (key: string): Promise<void> =>
  userAuthCache.invalidate(key);

export const clearUserCache = (): Promise<void> =>
  userAuthCache.clear();

export const getCacheStats = (): Promise<{ size: number; hits: number; misses: number }> =>
  userAuthCache.stats();
