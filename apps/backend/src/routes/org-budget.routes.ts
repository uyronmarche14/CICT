import express from 'express';
import {
  getBudget,
  createBudget,
  updateBudget,
  listTransactions,
  createTransaction,
  deleteTransaction,
} from '../controllers/org-budget.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createBudgetValidator,
  updateBudgetValidator,
  createTransactionValidator,
  transactionIdValidator,
} from '../validators/org-budget.validator';

const router = express.Router();

router.use(protect, requireAdminAccess, authorize(Permission.MANAGE_ORG_BUDGET));

router.get('/:orgId/budget', getBudget);
router.post('/:orgId/budget', validate(createBudgetValidator), logActivity('create', 'org_budget'), createBudget);
router.put('/:orgId/budget', validate(updateBudgetValidator), logActivity('update', 'org_budget'), updateBudget);
router.get('/:orgId/budget/transactions', listTransactions);
router.post('/:orgId/budget/transactions', validate(createTransactionValidator), logActivity('create', 'org_transaction'), createTransaction);
router.delete('/:orgId/budget/transactions/:txId', validate(transactionIdValidator), logActivity('delete', 'org_transaction'), deleteTransaction);

export default router;
