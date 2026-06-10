export type OrgActivityAction =
  | 'created' | 'updated' | 'deleted' | 'submitted'
  | 'approved' | 'rejected' | 'published' | 'assigned'
  | 'completed' | 'cancelled' | 'shared' | 'uploaded'
  | 'voted' | 'joined' | 'resigned';

export type OrgActivityEntity =
  | 'membership' | 'task' | 'meeting' | 'meeting_action_item'
  | 'event' | 'budget' | 'budget_transaction'
  | 'resource_request' | 'vote' | 'partnership'
  | 'file' | 'announcement' | 'news' | 'shared_content';

export type OrgActivityActor = 'admin' | 'student' | 'system';

export type OrganizationActivityRecord = {
  organizationId: string;
  actorType: OrgActivityActor;
  actorId?: string;
  action: OrgActivityAction;
  entityType: OrgActivityEntity;
  entityId: string;
  entityLabel?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
};
