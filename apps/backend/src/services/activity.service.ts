import OrganizationActivity from '../models/OrganizationActivity';
import logger from '../utils/logger';
import type { IOrganizationActivity } from '../types';
import { notifyOrgAdmins, createNotification, getTaskAssigneeUserIds } from './notification.service';

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

  try {
    const { organizationId, action, entityType, entityId, entityLabel, actorId } = input;

    if (entityType === 'membership') {
      if (action === 'joined') {
        await notifyOrgAdmins(organizationId, 'membership', 'New Application', `A student applied to join your organization.`);
      } else if (action === 'resigned') {
        await notifyOrgAdmins(organizationId, 'membership', 'Member Resigned', `A member has resigned from your organization.`);
      } else if (action === 'rejected') {
        if (actorId) {await createNotification(actorId, 'membership', 'Application Rejected', 'Your membership application has been rejected.');}
      }
    }

    if (entityType === 'task' && action === 'assigned') {
      const assigneeIds = await getTaskAssigneeUserIds(entityId);
      await Promise.all(assigneeIds.map((uid: string) =>
        createNotification(uid, 'task', 'Task Assigned', `You have been assigned: ${entityLabel || 'a task'}`, { taskId: entityId })
      ));
    }
  } catch (error) {
    logger.error('Failed to trigger notification from activity:', error);
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
