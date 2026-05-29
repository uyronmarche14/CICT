import Organization from '../models/Organization';
import OrgBudget from '../models/OrgBudget';
import OrgTransaction from '../models/OrgTransaction';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';

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
  const budget = await OrgBudget.findOne({ organizationId: oid }).lean();
  const transactions = await OrgTransaction.find({ organizationId: oid }).lean();
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { budget, summary: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses } };
};

export const createBudget = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  return OrgBudget.create({ ...req.body, organizationId: oid, createdBy });
};

export const updateBudget = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const budget = await OrgBudget.findOneAndUpdate(
    { organizationId: oid },
    { $set: req.body },
    { new: true, runValidators: true, upsert: true }
  );
  return budget;
};

export const listTransactions = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  return OrgTransaction.find({ organizationId: oid }).sort({ date: -1 }).lean();
};

export const createTransaction = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  return OrgTransaction.create({ ...req.body, organizationId: oid, createdBy });
};

export const deleteTransaction = async (req: AuthRequest, orgId: string, txId: string) => {
  const oid = await resolveOrg(req, orgId);
  const tx = await OrgTransaction.findOneAndDelete({ _id: txId, organizationId: oid });
  if (!tx) {throw new AppError('Transaction not found', 404);}
};
