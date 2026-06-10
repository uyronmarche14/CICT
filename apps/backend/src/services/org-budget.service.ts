import Organization from '../models/Organization';
import OrgBudget from '../models/OrgBudget';
import OrgTransaction from '../models/OrgTransaction';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { ensureReferenceValuesAllowed } from './lookup.service';
import { pickAllowedFields } from '../utils/allowedFields';

const BUDGET_ALLOWED = ['fiscalYear', 'totalBudget', 'categories', 'notes'];
const TRANSACTION_ALLOWED = ['type', 'category', 'amount', 'description', 'date', 'vendor', 'paymentMethod', 'referenceNumber', 'receiptUrl', 'fiscalYear', 'semester'];

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_BUDGET)) {
    throw new AppError('You do not have access to manage budget for this organization', 403);
  }
  const organization = await Organization.findOne({ id: orgId }).select('_id');
  if (!organization) {throw new AppError('Organization not found', 404);}
  return organization._id;
};

export const getBudget = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const budget = await OrgBudget.findOne({ organizationId: String(oid) }).lean();
  const transactions = await OrgTransaction.find({ organizationId: String(oid) }).lean();
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { budget, summary: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses } };
};

export const createBudget = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  return OrgBudget.create({
    ...pickAllowedFields(req.body, BUDGET_ALLOWED),
    organizationId: String(oid),
    createdBy,
    statusHistory: [{ status: 'created', changedBy: createdBy, changedAt: new Date() }],
  });
};

export const updateBudget = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  let budget = await OrgBudget.findOne({ organizationId: String(oid) });
  if (!budget) {
    const createdBy = req.user?.userId;
    if (!createdBy) {throw new AppError('User not authenticated', 401);}
    budget = await OrgBudget.create({ ...pickAllowedFields(req.body, BUDGET_ALLOWED), organizationId: String(oid), createdBy });
    return budget;
  }
  if (req.body.totalBudget && budget.totalBudget !== req.body.totalBudget) {
    budget.statusHistory.push({
      status: `totalBudget: ${budget.totalBudget} → ${req.body.totalBudget}`,
      changedBy: req.user!.userId,
      changedAt: new Date(),
      reason: req.body.reason,
    });
  }
  const allowed = pickAllowedFields(req.body, BUDGET_ALLOWED);
  for (const [key, value] of Object.entries(allowed)) {
    (budget as any)[key] = value;
  }
  await budget.save();
  return budget;
};

export const listTransactions = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const filter: Record<string, unknown> = { organizationId: oid };
  if (req.query.fiscalYear) {filter.fiscalYear = req.query.fiscalYear;}
  if (req.query.semester) {filter.semester = req.query.semester;}
  return OrgTransaction.find(filter).sort({ date: -1 }).lean();
};

export const createTransaction = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  await ensureReferenceValuesAllowed('budgetCategories', [req.body.category], 'Invalid budget category');
  return OrgTransaction.create({ ...pickAllowedFields(req.body, TRANSACTION_ALLOWED), organizationId: String(oid), createdBy });
};

export const deleteTransaction = async (req: AuthRequest, orgId: string, txId: string) => {
  const oid = await resolveOrg(req, orgId);
  const tx = await OrgTransaction.findOneAndDelete({ _id: txId, organizationId: String(oid) });
  if (!tx) {throw new AppError('Transaction not found', 404);}
};
