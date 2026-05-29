import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  listTasks as listTasksService,
  createTask as createTaskService,
  getTask as getTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  updateTaskStatus as updateTaskStatusService,
  toggleChecklistItem as toggleChecklistItemService,
} from '../services/org-task.service';

export const listTasks = async (req: AuthRequest, res: Response) => {
  const data = await listTasksService(req, req.params.orgId);
  res.json({ success: true, data });
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const data = await createTaskService(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};

export const getTask = async (req: AuthRequest, res: Response) => {
  const data = await getTaskService(req, req.params.orgId, req.params.taskId);
  res.json({ success: true, data });
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const data = await updateTaskService(req, req.params.orgId, req.params.taskId);
  res.json({ success: true, data });
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  await deleteTaskService(req, req.params.orgId, req.params.taskId);
  res.json({ success: true, message: 'Task deleted' });
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  const data = await updateTaskStatusService(req, req.params.orgId, req.params.taskId);
  res.json({ success: true, data });
};

export const toggleChecklistItem = async (req: AuthRequest, res: Response) => {
  const data = await toggleChecklistItemService(req, req.params.orgId, req.params.taskId);
  res.json({ success: true, data });
};
