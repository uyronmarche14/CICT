import type { ContentOwnerType, NewsStatus, Permission } from '@/types';
import { Permission as PermissionValue } from '@/types';
import type { AdminContentKind, ContentWorkflowAction } from './types';

type WorkflowItem = {
  ownerType?: ContentOwnerType;
  organizationId?: string | null;
  status?: NewsStatus;
};

type PermissionReader = {
  hasPermission: (permission: Permission) => boolean;
  hasScopedPermission: (organizationId: string, permission: Permission) => boolean;
};

export const contentWorkflowPermissions: Record<
  AdminContentKind,
  Partial<Record<ContentWorkflowAction, Permission>>
> = {
  news: {
    submit: PermissionValue.SUBMIT_CONTENT_FOR_APPROVAL,
    approve: PermissionValue.APPROVE_CONTENT,
    reject: PermissionValue.REJECT_CONTENT,
    publish: PermissionValue.PUBLISH_NEWS,
    archive: PermissionValue.ARCHIVE_NEWS,
    delete: PermissionValue.DELETE_NEWS,
  },
  announcement: {
    submit: PermissionValue.SUBMIT_CONTENT_FOR_APPROVAL,
    approve: PermissionValue.APPROVE_CONTENT,
    reject: PermissionValue.REJECT_CONTENT,
    publish: PermissionValue.PUBLISH_ANNOUNCEMENT,
    archive: PermissionValue.ARCHIVE_ANNOUNCEMENT,
    delete: PermissionValue.DELETE_ANNOUNCEMENT,
  },
  event: {
    submit: PermissionValue.SUBMIT_CONTENT_FOR_APPROVAL,
    approve: PermissionValue.APPROVE_CONTENT,
    reject: PermissionValue.REJECT_CONTENT,
    publish: PermissionValue.PUBLISH_EVENT,
    archive: PermissionValue.CANCEL_EVENT,
    delete: PermissionValue.DELETE_EVENT,
  },
};

export const canActOnContent = (
  item: WorkflowItem,
  permission: Permission,
  reader: PermissionReader
) =>
  reader.hasPermission(permission) ||
  (!!item.organizationId && reader.hasScopedPermission(item.organizationId, permission));

export const getVisibleWorkflowActions = (
  kind: AdminContentKind,
  item: WorkflowItem,
  reader: PermissionReader
): ContentWorkflowAction[] => {
  const permissions = contentWorkflowPermissions[kind];
  const can = (action: ContentWorkflowAction) => {
    const permission = permissions[action];
    return !!permission && canActOnContent(item, permission, reader);
  };

  const actions: ContentWorkflowAction[] = [];
  if (item.status === 'draft' && can('submit')) {
    actions.push('submit');
  }
  if (item.status === 'pending_approval') {
    if (can('approve')) {
      actions.push('approve');
    }
    if (can('reject')) {
      actions.push('reject');
    }
  }
  if (item.status === 'approved' && can('publish')) {
    actions.push('publish');
  }
  if (item.status === 'published' && can('archive')) {
    actions.push('archive');
  }
  if (can('delete')) {
    actions.push('delete');
  }
  return actions;
};

export const getWorkflowActionLabel = (action: ContentWorkflowAction) => {
  if (action === 'submit') {
    return 'Submit for approval';
  }
  return action.charAt(0).toUpperCase() + action.slice(1);
};
