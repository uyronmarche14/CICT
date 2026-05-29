import { body, param } from 'express-validator';

export const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('assigneeIds').optional().isArray(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601().toDate(),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('attachments').optional().isArray(),
  body('checklist').optional().isArray(),
];

export const updateTaskValidator = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('assigneeIds').optional().isArray(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional({ values: 'null' }).isISO8601().toDate(),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('attachments').optional().isArray(),
  body('checklist').optional().isArray(),
];

export const taskIdValidator = [param('taskId').isMongoId().withMessage('Invalid task ID')];

export const updateTaskStatusValidator = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('status').isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
];

export const toggleChecklistValidator = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('index').isInt({ min: 0 }).withMessage('Valid index is required'),
  body('completed').isBoolean().withMessage('Completed must be boolean'),
];
