import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getBudget as getBudgetService,
  createBudget as createBudgetService,
  updateBudget as updateBudgetService,
  listTransactions as listTransactionsService,
  createTransaction as createTransactionService,
  deleteTransaction as deleteTransactionService,
} from '../services/org-budget.service';

export const getBudget = async (req: AuthRequest, res: Response) => {
  const data = await getBudgetService(req, req.params.orgId);
  res.json({ success: true, data });
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  const data = await createBudgetService(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
  const data = await updateBudgetService(req, req.params.orgId);
  res.json({ success: true, data });
};

export const listTransactions = async (req: AuthRequest, res: Response) => {
  const data = await listTransactionsService(req, req.params.orgId);
  res.json({ success: true, data });
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const data = await createTransactionService(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  await deleteTransactionService(req, req.params.orgId, req.params.txId);
  res.json({ success: true, message: 'Transaction deleted' });
};
