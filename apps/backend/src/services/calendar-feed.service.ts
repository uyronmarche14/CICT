import Event from '../models/Event';
import OrgMeeting from '../models/OrgMeeting';
import OrgTask from '../models/OrgTask';
import OrgVote from '../models/OrgVote';
import ResourceRequest from '../models/ResourceRequest';
import type { CalendarItem } from '@cict/contracts/types';
import type { IAuthenticatedUser } from '../types';

interface FeedParams {
  startDate?: string;
  endDate?: string;
  sourceTypes?: string[];
  orgId?: string;
  limit: number;
  offset: number;
}

interface FeedResult {
  items: CalendarItem[];
  total: number;
}

function buildDateFilter(startDate?: string, endDate?: string) {
  const filter: Record<string, unknown> = {};
  if (startDate) {filter.$gte = new Date(startDate);}
  if (endDate) {filter.$lte = new Date(endDate);}
  return Object.keys(filter).length > 0 ? filter : undefined;
}

function getOrgIds(user?: IAuthenticatedUser, orgId?: string): string[] | null {
  if (orgId) {return [orgId];}
  if (!user) {return null;}
  if (user.canAccessAdmin) {return null;} // global admin = all orgs
  if (user.scopedAdminModulesByOrganization) {
    return Object.keys(user.scopedAdminModulesByOrganization);
  }
  return null;
}

export async function getCalendarFeed(
  user: any,
  params: FeedParams
): Promise<FeedResult> {
  const dateFilter = buildDateFilter(params.startDate, params.endDate);
  const sourceTypes = params.sourceTypes;
  const orgIds = getOrgIds(user, params.orgId);
  const orgFilter = orgIds && orgIds.length > 0 ? { $in: orgIds } : undefined;

  const items: CalendarItem[] = [];
  const shouldFetch = (type: string) => !sourceTypes || sourceTypes.includes(type);

  if (shouldFetch('event')) {
    const filter: Record<string, unknown> = { status: 'published' };
    if (dateFilter) {filter.startDate = dateFilter;}
    if (orgFilter) {filter.organizationId = orgFilter;}
    const docs = await Event.find(filter)
      .select('title startDate endDate status organizationId').lean();
    for (const d of docs as any[]) {
      items.push({
        id: String(d._id), sourceType: 'event', sourceId: String(d._id),
        title: d.title,
        startsAt: new Date(d.startDate).toISOString(),
        endsAt: d.endDate ? new Date(d.endDate).toISOString() : undefined,
        organizationId: d.organizationId, status: d.status,
        visibility: 'public', href: `/events/${d._id}`,
      });
    }
  }

  if (shouldFetch('meeting') && user) {
    const filter: Record<string, unknown> = {};
    if (dateFilter) {filter.date = dateFilter;}
    if (orgFilter) {filter.organizationId = orgFilter;}
    const docs = await OrgMeeting.find(filter)
      .select('title date organizationId').lean();
    for (const d of docs as any[]) {
      items.push({
        id: String(d._id), sourceType: 'meeting', sourceId: String(d._id),
        title: d.title,
        startsAt: new Date(d.date).toISOString(),
        organizationId: d.organizationId,
        visibility: 'org_admin', href: `/admin/organizations/${d.organizationId}`,
      });
    }
  }

  if (shouldFetch('task') && user) {
    const filter: Record<string, unknown> = { dueDate: { $exists: true } };
    if (dateFilter) {filter.dueDate = dateFilter;}
    if (orgFilter) {filter.organizationId = orgFilter;}
    const docs = await OrgTask.find(filter)
      .select('title dueDate status priority organizationId').lean();
    for (const d of docs as any[]) {
      items.push({
        id: String(d._id), sourceType: 'task', sourceId: String(d._id),
        title: d.title,
        startsAt: new Date(d.dueDate).toISOString(),
        organizationId: d.organizationId, status: d.status, priority: d.priority,
        visibility: 'org_admin', href: `/admin/organizations/${d.organizationId}/tasks`,
      });
    }
  }

  if (shouldFetch('vote') && user) {
    const filter: Record<string, unknown> = {};
    if (orgFilter) {filter.organizationId = orgFilter;}
    const docs = await OrgVote.find(filter)
      .select('title startDate endDate isActive organizationId').lean();
    for (const d of docs as any[]) {
      items.push({
        id: String(d._id), sourceType: 'vote', sourceId: String(d._id),
        title: d.title,
        startsAt: new Date(d.startDate).toISOString(),
        endsAt: d.endDate ? new Date(d.endDate).toISOString() : undefined,
        organizationId: d.organizationId,
        status: d.isActive ? 'active' : 'closed',
        visibility: 'org_admin', href: `/admin/organizations/${d.organizationId}/voting`,
      });
    }
  }

  if (shouldFetch('resource') && user) {
    const filter: Record<string, unknown> = { dateNeeded: { $exists: true } };
    if (dateFilter) {filter.dateNeeded = dateFilter;}
    if (orgFilter) {filter.organizationId = orgFilter;}
    const docs = await ResourceRequest.find(filter)
      .select('description dateNeeded status organizationId').lean();
    for (const d of docs as any[]) {
      items.push({
        id: String(d._id), sourceType: 'resource', sourceId: String(d._id),
        title: d.description || 'Resource request',
        startsAt: new Date(d.dateNeeded!).toISOString(),
        organizationId: d.organizationId, status: d.status,
        visibility: 'org_admin', href: `/admin/organizations/${d.organizationId}/resources`,
      });
    }
  }

  items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const total = items.length;
  const paged = items.slice(params.offset, params.offset + params.limit);

  return { items: paged, total };
}
