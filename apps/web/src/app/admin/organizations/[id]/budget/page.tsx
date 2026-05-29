'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, Loader2, TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgBudgetAPI } from '@/lib/api/org-budget';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetForm, TransactionForm } from '@/components/admin/BudgetForm';
import { format } from 'date-fns';

export default function OrgBudgetPage() {
  const params = useParams();
  const orgId = params.id as string;
  const { canManageOrgBudget } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgBudget(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const queryClient = useQueryClient();

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTxForm, setShowTxForm] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orgBudget.overview(orgId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.orgBudget.transactions(orgId) });
  };

  const { data: overview, isLoading } = useQuery({
    queryKey: queryKeys.orgBudget.overview(orgId),
    queryFn: () => orgBudgetAPI.getOverview(orgId),
    enabled: !!orgId,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: queryKeys.orgBudget.transactions(orgId),
    queryFn: () => orgBudgetAPI.listTransactions(orgId),
    enabled: !!orgId,
  });

  if (!shouldRender) return null;

  const summary = overview?.summary;

  return (
    <OrgPageLayout
      title="Budget & Finance"
      icon={Wallet}
      description="Track organization budget allocations, expenses, and financial reports."
      loading={orgLoading}
      action={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowTxForm(true)}>
            <Plus className="mr-2 h-4 w-4" />Add Transaction
          </Button>
          <Button size="sm" onClick={() => setShowBudgetForm(true)}>
            <PiggyBank className="mr-2 h-4 w-4" />Set Budget
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">₱{summary?.totalIncome?.toLocaleString() ?? '0'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">₱{summary?.totalExpenses?.toLocaleString() ?? '0'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${(summary?.balance ?? 0) >= 0 ? 'text-primary' : 'text-red-600'}`}>
                  ₱{summary?.balance?.toLocaleString() ?? '0'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₱{overview?.budget?.totalBudget?.toLocaleString() ?? 'Not set'}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Transactions</h3>
            {txLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border/60">
                <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Vendor</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Ref #</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b last:border-0">
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                        <td className="p-3 font-medium">
                          <div className="truncate max-w-[200px]">{tx.description}</div>
                          {tx.paymentMethod && <span className="text-[10px] text-muted-foreground">{tx.paymentMethod.replace('_', ' ')}</span>}
                        </td>
                        <td className="p-3"><span className="text-xs bg-muted px-2 py-0.5 rounded">{tx.category}</span></td>
                        <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{tx.vendor || '—'}</td>
                        <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{tx.referenceNumber || '—'}</td>
                        <td className={`p-3 text-right font-medium whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}₱{tx.amount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => {
                            try {
                              await orgBudgetAPI.deleteTransaction(orgId, tx._id);
                              invalidate();
                            } catch { /* ignore */ }
                          }}>
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <BudgetForm orgId={orgId} open={showBudgetForm} onOpenChange={setShowBudgetForm} onSuccess={invalidate} />
      <TransactionForm orgId={orgId} open={showTxForm} onOpenChange={setShowTxForm} onSuccess={invalidate} />
    </OrgPageLayout>
  );
}
