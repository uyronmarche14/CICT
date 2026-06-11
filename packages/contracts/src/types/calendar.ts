export type CalendarSourceType =
  | 'event'
  | 'meeting'
  | 'task'
  | 'vote'
  | 'resource'
  | 'announcement'
  | 'process'
  | 'mentorship'
  | 'task_force';

export type CalendarItem = {
  id: string;
  sourceType: CalendarSourceType;
  sourceId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  allDay?: boolean;
  organizationId?: string;
  organizationName?: string;
  status?: string;
  priority?: string;
  visibility: 'public' | 'student' | 'org_admin' | 'admin';
  href: string;
};
