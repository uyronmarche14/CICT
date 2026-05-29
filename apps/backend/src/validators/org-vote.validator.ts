import { body, param } from 'express-validator';

export const createVoteValidator = [
  body('title').trim().notEmpty().withMessage('Vote title is required'),
  body('description').optional().trim(),
  body('positions').isArray({ min: 1 }).withMessage('At least one position is required'),
  body('candidates').isArray({ min: 1 }).withMessage('At least one candidate is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required').toDate(),
  body('endDate').isISO8601().withMessage('Valid end date is required').toDate(),
  body('isAnonymous').optional().isBoolean(),
];

export const updateVoteValidator = [
  param('voteId').isMongoId().withMessage('Invalid vote ID'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('positions').optional().isArray(),
  body('candidates').optional().isArray(),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('isAnonymous').optional().isBoolean(),
];

export const voteIdValidator = [
  param('voteId').isMongoId().withMessage('Invalid vote ID'),
];

export const castBallotValidator = [
  param('voteId').isMongoId().withMessage('Invalid vote ID'),
  body('selections').isArray({ min: 1 }).withMessage('Selections are required'),
  body('voterType').optional().isIn(['student', 'admin']),
];
