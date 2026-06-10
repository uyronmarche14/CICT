import OrganizationActivity from '../models/OrganizationActivity';
import logger from '../utils/logger';
import type { IOrganizationActivity } from '../types';

type ActivityInput = {
  organizationId: string;
  actorType: 'admin' | 'student' | 'system';
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
};

export const recordActivity = async (input: ActivityInput): Promise<void> => {
  try {
    await OrganizationActivity.create(input);
  } catch (error) {
    logger.error('Failed to record organization activity:', error);
  }
};

export const getOrgActivity = async (
  organizationId: string,
  options?: { limit?: number; entityType?: string; action?: string }
): Promise<IOrganizationActivity[]> => {
  const query: Record<string, unknown> = { organizationId };
  if (options?.entityType) {query.entityType = options.entityType;}
  if (options?.action) {query.action = options.action;}

  return OrganizationActivity.find(query)
    .sort({ createdAt: -1 })
    .limit(options?.limit ?? 50)
    .lean();
};
