import { body, param } from 'express-validator';
import { Permission } from '../types';

const VALID_PERMISSIONS = Object.values(Permission);

export const createRoleValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Role name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Role name must be 3–50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  body('permissions')
    .optional()
    .isArray({ min: 0 }).withMessage('Permissions must be an array'),
  body('permissions.*')
    .isIn(VALID_PERMISSIONS).withMessage('Invalid permission value'),
];

export const updateRoleValidator = [
  param('id').isMongoId().withMessage('Invalid role ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Role name cannot be empty')
    .isLength({ min: 3, max: 50 }).withMessage('Role name must be 3–50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  body('permissions')
    .optional()
    .isArray({ min: 0 }).withMessage('Permissions must be an array'),
  body('permissions.*')
    .isIn(VALID_PERMISSIONS).withMessage('Invalid permission value'),
];
