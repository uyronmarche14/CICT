import { Response } from 'express';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { getOwnStudentProfile as getOwnStudentProfileService } from '../services/student.service';
import { getNotifications, markAsRead } from '../services/notification.service';

export const getOwnStudentProfile = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    res.status(401).json({ success: false, message: 'Student not authenticated' });
    return;
  }

  const student = await getOwnStudentProfileService(req.student.studentId);

  res.status(200).json({
    success: true,
    data: { student },
  });
};

export const getStudentNotifications = async (req: StudentAuthRequest, res: Response) => {
  const { limit: limitStr, skip: skipStr, unreadOnly } = req.query as Record<string, string | undefined>;
  const result = await getNotifications(req.student!.studentId, {
    limit: limitStr ? parseInt(limitStr, 10) : undefined,
    skip: skipStr ? parseInt(skipStr, 10) : undefined,
    unreadOnly: unreadOnly === 'true',
  });
  res.json({ success: true, data: result });
};

export const markNotificationRead = async (req: StudentAuthRequest, res: Response) => {
  await markAsRead(req.params.id, req.student!.studentId);
  res.json({ success: true, message: 'Notification marked as read' });
};
