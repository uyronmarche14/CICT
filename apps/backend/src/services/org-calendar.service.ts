import OrgMeeting from '../models/OrgMeeting';
import OrgTask from '../models/OrgTask';
import OrgVote from '../models/OrgVote';
import ResourceRequest from '../models/ResourceRequest';
import Event from '../models/Event';

export async function getOrgCalendar(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  const items: any[] = [];

  const dateFilter: Record<string, unknown> = {};
  if (startDate) {dateFilter.$gte = new Date(startDate);}
  if (endDate) {dateFilter.$lte = new Date(endDate);}

  const meetings = await OrgMeeting.find({ organizationId, date: dateFilter })
    .select('title date').lean();
  for (const m of meetings as any[]) {
    items.push({
      id: `meeting-${m._id}`, sourceType: 'meeting', sourceId: String(m._id),
      title: m.title, startsAt: m.date.toISOString(),
      organizationId, visibility: 'org_admin',
      href: `/admin/organizations/${organizationId}/meetings`,
    });
  }

  const events = await Event.find({ organizationId, startDate: dateFilter, status: 'published' })
    .select('title startDate endDate status organizationId').lean();
  for (const e of events as any[]) {
    items.push({
      id: `event-${e._id}`, sourceType: 'event', sourceId: String(e._id),
      title: e.title, startsAt: new Date(e.startDate).toISOString(),
      endsAt: e.endDate ? new Date(e.endDate).toISOString() : undefined,
      organizationId: e.organizationId || organizationId,
      status: e.status, visibility: 'public',
      href: `/events/${e._id}`,
    });
  }

  const tasks = await OrgTask.find({ organizationId, dueDate: dateFilter })
    .select('title dueDate status').lean();
  for (const t of tasks as any[]) {
    items.push({
      id: `task-${t._id}`, sourceType: 'task', sourceId: String(t._id),
      title: t.title, startsAt: new Date(t.dueDate!).toISOString(),
      organizationId, status: t.status, visibility: 'org_admin',
      href: `/admin/organizations/${organizationId}/tasks`,
    });
  }

  const votes = await OrgVote.find({ organizationId })
    .select('title startDate endDate isActive').lean();
  for (const v of votes as any[]) {
    items.push({
      id: `vote-${v._id}`, sourceType: 'vote', sourceId: String(v._id),
      title: v.title, startsAt: v.startDate.toISOString(),
      endsAt: v.endDate ? v.endDate.toISOString() : undefined,
      organizationId, status: v.isActive ? 'active' : 'closed', visibility: 'org_admin',
      href: `/admin/organizations/${organizationId}/voting`,
    });
  }

  const requests = await ResourceRequest.find({ organizationId, dateNeeded: dateFilter })
    .select('description dateNeeded status').lean();
  for (const r of requests as any[]) {
    items.push({
      id: `resource-${r._id}`, sourceType: 'resource', sourceId: String(r._id),
      title: r.description || 'Resource request', startsAt: new Date(r.dateNeeded!).toISOString(),
      organizationId, status: r.status, visibility: 'org_admin',
      href: `/admin/organizations/${organizationId}/resources`,
    });
  }

  items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return items;
}
