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
import { requireAdminAccess } from '../middleware/permissions';
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

router.get('/:orgId/tasks', listTasks);
router.post('/:orgId/tasks', validate(createTaskValidator), logActivity('create', 'org_task'), createTask);
router.get('/:orgId/tasks/:taskId', validate(taskIdValidator), getTask);
router.put('/:orgId/tasks/:taskId', validate(updateTaskValidator), logActivity('update', 'org_task'), updateTask);
router.delete('/:orgId/tasks/:taskId', validate(taskIdValidator), logActivity('delete', 'org_task'), deleteTask);
router.patch('/:orgId/tasks/:taskId/status', validate(updateTaskStatusValidator), logActivity('update', 'org_task_status'), updateTaskStatus);
router.patch('/:orgId/tasks/:taskId/checklist', validate(toggleChecklistValidator), logActivity('update', 'org_task_checklist'), toggleChecklistItem);

export default router;
