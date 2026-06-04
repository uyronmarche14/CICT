import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { listTaskForces, createTaskForce, getTaskForce, updateTaskForce, deleteTaskForce } from '../controllers/org-task-force.controller';
import { createTaskForceValidator, updateTaskForceValidator, taskForceIdValidator } from '../validators/org-task-force.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

router.get('/:orgId/task-forces', listTaskForces);
router.post('/:orgId/task-forces', validate(createTaskForceValidator), logActivity('create', 'org_task_force'), createTaskForce);
router.get('/:orgId/task-forces/:id', getTaskForce);
router.put('/:orgId/task-forces/:id', validate(updateTaskForceValidator), logActivity('update', 'org_task_force'), updateTaskForce);
router.delete('/:orgId/task-forces/:id', validate(taskForceIdValidator), logActivity('delete', 'org_task_force'), deleteTaskForce);

export default router;
