import SystemConfig from '../models/SystemConfig';
import { DEFAULT_SETTINGS } from '../config/settings';
import { TypedCache } from './cache';

const featureCache = new TypedCache<Record<string, unknown>>({
  namespace: 'features',
  ttlMs: 10_000,
});

export const getFeatureFlags = async (): Promise<Record<string, unknown>> => {
  const cached = await featureCache.get('flags');
  if (cached) {return cached;}

  try {
    const doc = await SystemConfig.findOne({ group: 'features' }).select('value').lean();
    const flags = { ...DEFAULT_SETTINGS.features, ...((doc?.value as object) || {}) };
    await featureCache.set('flags', flags);
    return flags;
  } catch {
    return { ...DEFAULT_SETTINGS.features };
  }
};

export const isFeatureEnabled = async (key: string): Promise<boolean> => {
  const flags = await getFeatureFlags();
  return (flags as Record<string, unknown>)[key] !== false;
};

export const invalidateFeatureCache = async () => {
  await featureCache.clear();
};
