import { Response } from 'express';
import SystemConfig from '../models/SystemConfig';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  DEFAULT_SETTINGS,
  SETTINGS_GROUPS,
  SettingsGroup,
} from '../config/settings';
import { invalidateFeatureCache } from '../utils/features';

const loadSettings = async (group: SettingsGroup): Promise<Record<string, unknown>> => {
  try {
    const doc = await SystemConfig.findOne({ group }).select('value').lean();
    const defaults = (DEFAULT_SETTINGS[group] as Record<string, unknown>) || {};
    if (!doc?.value) {return { ...defaults };}
    return { ...defaults, ...(doc.value as Record<string, unknown>) };
  } catch {
    return { ...(DEFAULT_SETTINGS[group] as Record<string, unknown>) };
  }
};

const sanitizeValue = (value: unknown, group: SettingsGroup): Record<string, unknown> => {
  if (!value || typeof value !== 'object') {return {};}
  const input = value as Record<string, unknown>;
  const defaults = DEFAULT_SETTINGS[group] as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const key of Object.keys(defaults)) {
    if (input[key] === undefined) {
      sanitized[key] = defaults[key];
    } else if (typeof defaults[key] === 'boolean') {
      sanitized[key] = Boolean(input[key]);
    } else if (typeof defaults[key] === 'number') {
      sanitized[key] = typeof input[key] === 'number' ? input[key] : Number(input[key]) || defaults[key];
    } else if (Array.isArray(defaults[key])) {
      sanitized[key] = Array.isArray(input[key]) ? input[key] : defaults[key];
    } else {
      sanitized[key] = String(input[key]);
    }
  }

  return sanitized;
};

export const getAllSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const docs = await SystemConfig.find({}).select('group value').lean();
  const dbMap = new Map(docs.map((d) => [d.group, d.value as Record<string, unknown>]));
  const result: Record<string, Record<string, unknown>> = {};

  for (const group of SETTINGS_GROUPS) {
    const defaults = DEFAULT_SETTINGS[group] as Record<string, unknown>;
    result[group] = { ...defaults, ...(dbMap.get(group) ?? {}) };
  }

  res.json({ success: true, data: result });
};

export const getSettingsGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { group } = req.params;

  if (!SETTINGS_GROUPS.includes(group as SettingsGroup)) {
    throw new AppError(`Invalid settings group: ${group}`, 400);
  }

  const settings = await loadSettings(group as SettingsGroup);
  res.json({ success: true, data: settings });
};

export const updateSettingsGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { group } = req.params;

  if (!SETTINGS_GROUPS.includes(group as SettingsGroup)) {
    throw new AppError(`Invalid settings group: ${group}`, 400);
  }

  const sanitized = sanitizeValue(req.body, group as SettingsGroup);

  await SystemConfig.findOneAndUpdate(
    { group },
    { $set: { value: sanitized } },
    { upsert: true, new: true, runValidators: true }
  );

  if (group === 'features') {
    await invalidateFeatureCache();
  }

  res.json({ success: true, data: sanitized, message: `${group} settings updated` });
};
