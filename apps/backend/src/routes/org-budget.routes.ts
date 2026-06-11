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
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
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

router.use(protect, requireAdminAccess);

const canManageBudget = authorizeOrganizationScope(Permission.MANAGE_ORG_BUDGET);

router.get('/:orgId/budget', canManageBudget, getBudget);
router.post('/:orgId/budget', canManageBudget, validate(createBudgetValidator), logActivity('create', 'org_budget'), createBudget);
router.put('/:orgId/budget', canManageBudget, validate(updateBudgetValidator), logActivity('update', 'org_budget'), updateBudget);
router.get('/:orgId/budget/transactions', canManageBudget, listTransactions);
router.post('/:orgId/budget/transactions', canManageBudget, validate(createTransactionValidator), logActivity('create', 'org_transaction'), createTransaction);
router.delete('/:orgId/budget/transactions/:txId', canManageBudget, validate(transactionIdValidator), logActivity('delete', 'org_transaction'), deleteTransaction);

export default router;
