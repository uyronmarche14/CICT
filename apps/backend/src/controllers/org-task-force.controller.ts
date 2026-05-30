import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as tf from '../services/org-task-force.service';

export const listTaskForces = async (req: AuthRequest, res: Response) => {
  const data = await tf.listTaskForces(req, req.params.orgId);
  res.json({ success: true, data });
};
export const createTaskForce = async (req: AuthRequest, res: Response) => {
  const data = await tf.createTaskForce(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};
export const getTaskForce = async (req: AuthRequest, res: Response) => {
  const data = await tf.getTaskForce(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const updateTaskForce = async (req: AuthRequest, res: Response) => {
  const data = await tf.updateTaskForce(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const deleteTaskForce = async (req: AuthRequest, res: Response) => {
  await tf.deleteTaskForce(req, req.params.orgId, req.params.id);
  res.json({ success: true, message: 'Task force deleted' });
};
