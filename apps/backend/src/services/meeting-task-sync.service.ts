import OrgTask from '../models/OrgTask';
import OrgMeeting from '../models/OrgMeeting';

export async function syncActionItemToTask(
  meetingId: string,
  actionItemIndex: number,
  organizationId: string,
  createdBy: string
): Promise<void> {
  const meeting = await OrgMeeting.findById(meetingId);
  if (!meeting) {return;}

  const actionItem = meeting.actionItems[actionItemIndex];
  if (!actionItem) {return;}

  const existingTask = await OrgTask.findOne({
    meetingId,
    actionItemIndex,
    organizationId,
  });

  if (existingTask) {
    existingTask.status = actionItem.status === 'completed' ? 'done' : 'in_progress';
    existingTask.title = actionItem.text;
    if (actionItem.dueDate) {existingTask.dueDate = actionItem.dueDate;}
    await existingTask.save();
  } else {
    await OrgTask.create({
      organizationId,
      title: actionItem.text,
      status: 'todo',
      priority: 'medium',
      dueDate: actionItem.dueDate || undefined,
      assigneeIds: actionItem.assigneeId ? [actionItem.assigneeId] : [],
      meetingId,
      actionItemIndex,
      createdBy,
      tags: [],
      checklist: [],
      statusHistory: [{
        status: 'todo',
        changedBy: createdBy,
        changedAt: new Date(),
      }],
    });
  }
}
