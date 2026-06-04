import { body, param } from 'express-validator';

export const createBudgetValidator = [
  body('fiscalYear').trim().notEmpty().withMessage('Fiscal year is required'),
  body('totalBudget').isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('categories').optional().isArray(),
  body('notes').optional().trim(),
];

export const updateBudgetValidator = [
  body('fiscalYear').optional().trim().notEmpty(),
  body('totalBudget').optional().isFloat({ min: 0 }),
  body('categories').optional().isArray(),
  body('notes').optional().trim(),
];

export const createTransactionValidator = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').optional().isISO8601().toDate(),
  body('vendor').optional().trim(),
  body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'check', 'online']),
  body('referenceNumber').optional().trim(),
  body('receiptUrl').optional().trim(),
  body('budgetId').optional().isMongoId(),
  body('fiscalYear').optional().trim(),
  body('semester').optional().trim(),
];

export const transactionIdValidator = [param('txId').isMongoId().withMessage('Invalid transaction ID')];
