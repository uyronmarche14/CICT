import OrgMeeting from '../models/OrgMeeting';
import OrgTask from '../models/OrgTask';
import OrgVote from '../models/OrgVote';
import ResourceRequest from '../models/ResourceRequest';
import Event from '../models/Event';

interface CalendarItem {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'event' | 'task' | 'vote' | 'resource';
  status?: string;
}

export async function getOrgCalendar(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<CalendarItem[]> {
  const items: CalendarItem[] = [];

  const dateFilter: Record<string, unknown> = {};
  if (startDate) {dateFilter.$gte = new Date(startDate);}
  if (endDate) {dateFilter.$lte = new Date(endDate);}

  const meetings = await OrgMeeting.find({ organizationId, date: dateFilter })
    .select('title date')
    .lean();
  for (const m of meetings) {
    items.push({ id: String(m._id), title: m.title, date: m.date.toISOString(), type: 'meeting' });
  }

  const events = await Event.find({ organizationId, startDate: dateFilter, status: 'published' })
    .select('title startDate status')
    .lean();
  for (const e of events) {
    items.push({ id: String(e._id), title: e.title, date: new Date(e.startDate).toISOString(), type: 'event', status: e.status });
  }

  const tasks = await OrgTask.find({ organizationId, dueDate: dateFilter })
    .select('title dueDate status')
    .lean();
  for (const t of tasks) {
    items.push({ id: String(t._id), title: t.title, date: new Date(t.dueDate!).toISOString(), type: 'task', status: t.status });
  }

  const votes = await OrgVote.find({ organizationId })
    .select('title startDate endDate')
    .lean();
  for (const v of votes) {
    items.push({ id: String(v._id), title: v.title, date: v.startDate.toISOString(), type: 'vote' });
  }

  const requests = await ResourceRequest.find({ organizationId, dateNeeded: dateFilter })
    .select('description dateNeeded status')
    .lean();
  for (const r of requests) {
    items.push({ id: String(r._id), title: r.description || 'Resource request', date: new Date(r.dateNeeded!).toISOString(), type: 'resource', status: r.status });
  }

  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return items;
}
