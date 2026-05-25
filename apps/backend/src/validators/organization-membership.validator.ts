import { body, param } from 'express-validator';

export const createMembershipValidator = [
  param('orgId').notEmpty().withMessage('Organization ID is required'),
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('position').optional().trim().notEmpty().withMessage('Position cannot be empty'),
  body('memberType')
    .optional()
    .isIn(['officer', 'general', 'alumni', 'honorary', 'advisor'])
    .withMessage('Invalid member type'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid'),
  body('academicYear').optional().trim(),
  body('semester').optional().trim(),
  body('notes').optional().trim(),
];

export const updateMembershipValidator = [
  param('orgId').notEmpty().withMessage('Organization ID is required'),
  param('id').isMongoId().withMessage('Valid membership ID is required'),
  body('position').optional().trim(),
  body('memberType')
    .optional()
    .isIn(['officer', 'general', 'alumni', 'honorary', 'advisor'])
    .withMessage('Invalid member type'),
  body('status')
    .optional()
    .isIn(['applied', 'invited', 'active', 'inactive', 'alumni', 'rejected', 'resigned'])
    .withMessage('Invalid status'),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('academicYear').optional().trim(),
  body('semester').optional().trim(),
  body('notes').optional().trim(),
];

export const applyToOrgValidator = [
  param('orgId').notEmpty().withMessage('Organization ID is required'),
  body('message').optional().trim(),
];

export const membershipIdValidator = [
  param('id').isMongoId().withMessage('Valid membership ID is required'),
];
