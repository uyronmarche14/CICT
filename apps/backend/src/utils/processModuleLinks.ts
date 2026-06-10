import Event from '../models/Event';
import News from '../models/News';
import Announcement from '../models/Announcement';
import OrgTask from '../models/OrgTask';
import OrgMeeting from '../models/OrgMeeting';
import OrgBudget from '../models/OrgBudget';
import OrganizationMembership from '../models/OrganizationMembership';

export async function linkModuleToProcess(
  moduleType: string,
  moduleId: string,
  processInstanceId: string
): Promise<void> {
  const update = { processInstanceId };

  switch (moduleType) {
    case 'event':
      await Event.findByIdAndUpdate(moduleId, update);
      break;
    case 'news':
      await News.findByIdAndUpdate(moduleId, update);
      break;
    case 'announcement':
      await Announcement.findByIdAndUpdate(moduleId, update);
      break;
    case 'org_task':
      await OrgTask.findByIdAndUpdate(moduleId, update);
      break;
    case 'org_meeting':
      await OrgMeeting.findByIdAndUpdate(moduleId, update);
      break;
    case 'org_budget':
      await OrgBudget.findByIdAndUpdate(moduleId, update);
      break;
    case 'membership':
      await OrganizationMembership.findByIdAndUpdate(moduleId, update);
      break;
    default:
      throw new Error(`Unknown module type: ${moduleType}`);
  }
}

export async function getLinkedModule(
  processInstanceId: string
): Promise<{ type: string; data: Record<string, unknown> } | null> {
  const links: [string, any][] = [
    ['event', Event],
    ['news', News],
    ['announcement', Announcement],
    ['org_task', OrgTask],
    ['org_meeting', OrgMeeting],
    ['org_budget', OrgBudget],
    ['membership', OrganizationMembership],
  ];

  for (const [type, model] of links) {
    const doc = await model.findOne({ processInstanceId }).lean() as Record<string, unknown> | null;
    if (doc) {return { type, data: doc };}
  }
  return null;
}
