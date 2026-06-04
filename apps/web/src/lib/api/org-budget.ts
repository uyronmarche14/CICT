import api from './axios';

interface Budget {
  _id: string;
  organizationId: string;
  fiscalYear: string;
  totalBudget: number;
  categories?: Array<{ name: string; allocated: number }>;
  notes?: string;
  statusHistory?: Array<{ status: string; changedBy: string; changedAt: string; reason?: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  organizationId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  vendor?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'online';
  referenceNumber?: string;
  receiptUrl?: string;
  budgetId?: string;
  fiscalYear?: string;
  semester?: string;
  createdAt: string;
}

interface BudgetOverview {
  budget: Budget | null;
  summary: { totalIncome: number; totalExpenses: number; balance: number };
}

export const orgBudgetAPI = {
  getOverview: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: BudgetOverview }>(`/organizations/${orgId}/budget`);
    return res.data.data;
  },
  create: async (orgId: string, data: Partial<Budget>) => {
    const res = await api.post<{ success: boolean; data: Budget }>(`/organizations/${orgId}/budget`, data);
    return res.data.data;
  },
  update: async (orgId: string, data: Partial<Budget>) => {
    const res = await api.put<{ success: boolean; data: Budget }>(`/organizations/${orgId}/budget`, data);
    return res.data.data;
  },
  listTransactions: async (orgId: string, params?: Record<string, string>) => {
    const res = await api.get<{ success: boolean; data: Transaction[] }>(`/organizations/${orgId}/budget/transactions`, { params });
    return res.data.data;
  },
  createTransaction: async (orgId: string, data: Partial<Transaction>) => {
    const res = await api.post<{ success: boolean; data: Transaction }>(`/organizations/${orgId}/budget/transactions`, data);
    return res.data.data;
  },
  deleteTransaction: async (orgId: string, txId: string) => {
    await api.delete(`/organizations/${orgId}/budget/transactions/${txId}`);
  },
};
