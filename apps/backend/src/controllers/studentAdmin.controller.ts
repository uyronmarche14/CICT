import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getStudents as getStudentsService,
  getStudentById as getStudentByIdService,
  createStudent as createStudentService,
  updateStudent as updateStudentService,
  updateStudentStatus as updateStudentStatusService,
} from '../services/student.service';

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await getStudentsService(req);
  res.status(200).json({ success: true, data: result });
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await getStudentByIdService(req.params.id as string);
  res.status(200).json({ success: true, data: { student } });
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await createStudentService(req);
  res.status(201).json({ success: true, data: { student } });
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await updateStudentService(req.params.id as string, req);
  res.status(200).json({ success: true, data: { student } });
};

export const updateStudentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await updateStudentStatusService(req.params.id as string, req);
  res.status(200).json({ success: true, data: { student } });
};
