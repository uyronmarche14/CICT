import Notification from '../models/Notification';
import OrganizationAssignment from '../models/OrganizationAssignment';
import OrgTask from '../models/OrgTask';
import { pushNotificationService } from './push-notification.service';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  await Notification.create({ userId, type: type as any, title, body, data });

  try {
    await pushNotificationService.sendToStudent(userId, { title, body, data });
  } catch {
    // Push failure doesn't block notification creation
  }
}

export async function getNotifications(
  userId: string,
  options?: { limit?: number; skip?: number; unreadOnly?: boolean }
) {
  const query: Record<string, unknown> = { userId };
  if (options?.unreadOnly) {query.read = false;}

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(options?.skip ?? 0)
      .limit(options?.limit ?? 50)
      .lean(),
    Notification.countDocuments(query),
  ]);

  return { notifications, total };
}

export async function markAsRead(notificationId: string, userId: string) {
  await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true, readAt: new Date() } }
  );
}

export async function getOrgAdminUserIds(organizationId: string): Promise<string[]> {
  const assignments = await OrganizationAssignment.find({ organizationId })
    .populate('user', '_id')
    .lean();
  return assignments
    .map((a: any) => a.user?._id?.toString())
    .filter(Boolean);
}

export async function getTaskAssigneeUserIds(taskId: string): Promise<string[]> {
  const task = await OrgTask.findById(taskId).select('assigneeIds').lean();
  if (!task) {return [];}
  return task.assigneeIds.map((id: any) => id.toString());
}

export async function notifyOrgAdmins(
  organizationId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const adminIds = await getOrgAdminUserIds(organizationId);
  await Promise.all(adminIds.map((uid) => createNotification(uid, type, title, body, data)));
}
