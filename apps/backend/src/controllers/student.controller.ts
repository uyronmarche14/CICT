import { Response } from 'express';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { getOwnStudentProfile as getOwnStudentProfileService } from '../services/student.service';

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
