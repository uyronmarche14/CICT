import express from 'express';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  toggleChecklistItem,
} from '../controllers/org-task.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  updateTaskStatusValidator,
  toggleChecklistValidator,
} from '../validators/org-task.validator';

const router = express.Router();

router.use(protect, requireAdminAccess);

const canManageTasks = authorizeOrganizationScope(
  Permission.MANAGE_ORG_TASKS,
  'orgId',
  'You do not have access to manage tasks for this organization'
);

router.get('/:orgId/tasks', canManageTasks, listTasks);
router.post('/:orgId/tasks', canManageTasks, validate(createTaskValidator), logActivity('create', 'org_task'), createTask);
router.get('/:orgId/tasks/:taskId', canManageTasks, validate(taskIdValidator), getTask);
router.put('/:orgId/tasks/:taskId', canManageTasks, validate(updateTaskValidator), logActivity('update', 'org_task'), updateTask);
router.delete('/:orgId/tasks/:taskId', canManageTasks, validate(taskIdValidator), logActivity('delete', 'org_task'), deleteTask);
router.patch('/:orgId/tasks/:taskId/status', canManageTasks, validate(updateTaskStatusValidator), logActivity('update', 'org_task_status'), updateTaskStatus);
router.patch('/:orgId/tasks/:taskId/checklist', canManageTasks, validate(toggleChecklistValidator), logActivity('update', 'org_task_checklist'), toggleChecklistItem);

export default router;
