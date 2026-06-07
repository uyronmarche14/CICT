import { Response } from 'express';
import {
  pushTokenRegistrationRequestSchema,
  pushTokenUnregistrationRequestSchema,
} from '@cict/contracts/schemas';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { AppError } from '../middleware/errorHandler';
import PushToken from '../models/PushToken';

export const registerPushToken = async (req: StudentAuthRequest, res: Response): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const parsed = pushTokenRegistrationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Push token and platform are required', 400);
  }

  const { token, platform } = parsed.data;

  await PushToken.findOneAndUpdate(
    { studentId: req.student.studentId, token },
    { studentId: req.student.studentId, token, platform },
    { upsert: true, new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Push token registered',
  });
};

export const unregisterPushToken = async (req: StudentAuthRequest, res: Response): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const parsed = pushTokenUnregistrationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Push token is required', 400);
  }

  const { token } = parsed.data;

  await PushToken.findOneAndDelete({
    studentId: req.student.studentId,
    token,
  });

  res.status(200).json({
    success: true,
    message: 'Push token unregistered',
  });
};
