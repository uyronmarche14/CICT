export const ProcessNodeType = {
  START: 'start',
  TASK: 'task',
  APPROVAL: 'approval',
  DOCUMENT_REQUIREMENT: 'document_requirement',
  COMMENT_REVIEW: 'comment_review',
  END: 'end',
} as const;
export type ProcessNodeType = (typeof ProcessNodeType)[keyof typeof ProcessNodeType];

export const ProcessInstanceStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;
export type ProcessInstanceStatus = (typeof ProcessInstanceStatus)[keyof typeof ProcessInstanceStatus];
