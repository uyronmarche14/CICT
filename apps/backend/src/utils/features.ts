import SystemConfig from '../models/SystemConfig';
import { DEFAULT_SETTINGS } from '../config/settings';

const cache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_TTL = 10_000;

export const getFeatureFlags = async (): Promise<Record<string, unknown>> => {
  const cached = cache.get('features');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const doc = await SystemConfig.findOne({ group: 'features' }).select('value').lean();
    const flags = { ...DEFAULT_SETTINGS.features, ...((doc?.value as object) || {}) };
    cache.set('features', { data: flags, timestamp: Date.now() });
    return flags;
  } catch {
    return { ...DEFAULT_SETTINGS.features };
  }
};

export const isFeatureEnabled = async (key: string): Promise<boolean> => {
  const flags = await getFeatureFlags();
  return (flags as Record<string, unknown>)[key] !== false;
};

export const invalidateFeatureCache = () => {
  cache.delete('features');
};
