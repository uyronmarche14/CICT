import { body } from 'express-validator';

export const studentRegisterValidator = [
  body('studentNumber').trim().notEmpty().withMessage('Student number is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email must be valid'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('middleName').optional({ checkFalsy: true }).trim(),
  body('programId').isMongoId().withMessage('programId must be a valid ID'),
  body('yearLevelId').isMongoId().withMessage('yearLevelId must be a valid ID'),
  body('sectionId').isMongoId().withMessage('sectionId must be a valid ID'),
];

export const studentLoginValidator = [
  body('identifier').trim().notEmpty().withMessage('Identifier is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  body('deviceLabel').optional().trim(),
  body('platform').optional().trim(),
];

export const studentRefreshValidator = [
  body('refreshToken').trim().notEmpty().withMessage('refreshToken is required'),
];
