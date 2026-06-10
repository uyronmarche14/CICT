import OrgTask from '../models/OrgTask';
import logger from '../utils/logger';
import type { IProcessInstance } from '../types';

type AutomationAction = {
  type: 'create_task' | 'send_notification' | 'update_linked_status';
  params: Record<string, unknown>;
};

export async function executeAutomationActions(
  instance: IProcessInstance,
  completedNodeId: string
): Promise<void> {
  const node = instance.nodesSnapshot.find((n) => n.id === completedNodeId);
  if (!node?.data) {return;}

  const actions = (node.data as any).automation as AutomationAction[] | undefined;
  if (!actions?.length) {return;}

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'create_task':
          await handleCreateTask(instance, action.params);
          break;
        case 'send_notification':
          logger.info(`Notification action not yet implemented for instance ${instance._id}`);
          break;
        case 'update_linked_status':
          logger.info(`Status update action not yet implemented for instance ${instance._id}`);
          break;
      }
    } catch (error) {
      logger.error(`Failed to execute automation action ${action.type}:`, error);
    }
  }
}

async function handleCreateTask(
  instance: IProcessInstance,
  params: Record<string, unknown>
): Promise<void> {
  const organizationId = instance.organizationId;
  if (!organizationId) {
    logger.warn('Cannot create task: no organizationId on process instance');
    return;
  }

  await OrgTask.create({
    organizationId,
    title: (params.title as string) || 'Untitled Task',
    description: params.description as string | undefined,
    status: 'todo',
    assigneeIds: [],
    processInstanceId: String(instance._id),
    createdBy: String(instance.createdBy),
  });
}
