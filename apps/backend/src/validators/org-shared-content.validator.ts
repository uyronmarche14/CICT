import { body, param } from 'express-validator';

export const shareContentValidator = [
  body('contentType').isIn(['news', 'announcement', 'event']).withMessage('Invalid content type'),
  body('contentId').trim().notEmpty().withMessage('Content ID is required'),
  body('targetOrgIds').isArray({ min: 1 }).withMessage('At least one target org is required'),
];

export const shareIdValidator = [param('id').isMongoId().withMessage('Invalid share ID')];
