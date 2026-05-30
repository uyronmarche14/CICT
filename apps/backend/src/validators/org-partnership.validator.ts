import { body, param } from 'express-validator';

export const createPartnershipValidator = [
  body('orgIdB').trim().notEmpty().withMessage('Target organization ID is required'),
  body('partnershipType').optional().trim(),
  body('terms').optional().trim(),
];

export const partnershipActionValidator = [
  param('id').isMongoId().withMessage('Invalid partnership ID'),
];
