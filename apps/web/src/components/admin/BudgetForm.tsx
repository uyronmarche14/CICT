'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { appToast } from '@/lib/app-toast';
import { orgBudgetAPI } from '@/lib/api/org-budget';
import { useReferenceData } from '@/hooks/use-reference-data';

const categoryItemSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  allocated: z.coerce.number().min(0, 'Allocation must be positive'),
});

const budgetSchema = z.object({
  fiscalYear: z.string().min(1, 'Fiscal year is required'),
  totalBudget: z.coerce.number().min(0, 'Budget must be positive'),
  notes: z.string().optional(),
  categories: z.array(categoryItemSchema).optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  vendor: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'online']).optional(),
  referenceNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  budgetId: z.string().optional(),
  fiscalYear: z.string().optional(),
  semester: z.string().optional(),
});

const TRANSACTION_CATEGORIES = [
  'Supplies', 'Equipment', 'Events', 'Food', 'Transportation',
  'Marketing', 'Venue', 'Utilities', 'Miscellaneous', 'Donations', 'Dues', 'Other',
];

export function BudgetForm({ orgId, open, onOpenChange, onSuccess, item }: {
  orgId: string; open: boolean; onOpenChange: (o: boolean) => void; onSuccess: () => void; item?: BudgetFormValues | null;
}) {
  const isEdit = !!item;
  const [categories, setCategories] = useState<Array<{ name: string; allocated: number }>>([]);
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { fiscalYear: '', totalBudget: 0, notes: '', categories: [] },
  });
  useEffect(() => {
    if (open) {
      const data = item || { fiscalYear: '', totalBudget: 0, notes: '', categories: [] };
      form.reset(data);
      setCategories(data.categories ?? []);
    }
  }, [form, open, item]);

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      const payload = { ...data, categories };
      if (isEdit) {
        await orgBudgetAPI.update(orgId, payload);
        appToast.success('Budget Updated', 'Budget has been updated.');
      } else {
        await orgBudgetAPI.create(orgId, payload);
        appToast.success('Budget Set', 'Budget has been created.');
      }
      onSuccess(); onOpenChange(false); form.reset(); setCategories([]);
    } catch { appToast.error('Error', 'Failed to save budget.'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Budget' : 'Set Budget'}</DialogTitle><DialogDescription>{isEdit ? 'Update the annual budget.' : 'Set the annual budget.'}</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller name="fiscalYear" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Fiscal Year</FormLabel><FormControl><Input placeholder="2025-2026" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Controller name="totalBudget" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Total Budget</FormLabel><FormControl><Input type="number" min={0} step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Controller name="notes" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Input placeholder="Optional notes" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Budget Categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Budget Categories</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setCategories([...categories, { name: '', allocated: 0 }])}>
                  <Plus className="h-3 w-3 mr-1" />Add Category
                </Button>
              </div>
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Category name" value={cat.name} onChange={(e) => {
                    const u = [...categories]; u[i] = { ...u[i], name: e.target.value }; setCategories(u);
                  }} className="flex-1" />
                  <Input type="number" min={0} step="0.01" placeholder="Amount" value={cat.allocated || ''} onChange={(e) => {
                    const u = [...categories]; u[i] = { ...u[i], allocated: parseFloat(e.target.value) || 0 }; setCategories(u);
                  }} className="w-32" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCategories(categories.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {categories.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total allocated: ₱{categories.reduce((s, c) => s + c.allocated, 0).toLocaleString()} / ₱{form.watch('totalBudget')?.toLocaleString() || '0'}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{isEdit ? 'Update Budget' : 'Save Budget'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function TransactionForm({ orgId, open, onOpenChange, onSuccess, budgetId }: {
  orgId: string; open: boolean; onOpenChange: (o: boolean) => void; onSuccess: () => void; budgetId?: string;
}) {
  const { items: budgetCategories } = useReferenceData('budgetCategories');
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'expense', category: '', amount: 0, description: '', date: '', vendor: '', paymentMethod: undefined, referenceNumber: '', receiptUrl: '', budgetId: budgetId ?? '', fiscalYear: '', semester: '' },
  });
  useEffect(() => { if (open) form.reset({ type: 'expense', category: '', amount: 0, description: '', date: '', vendor: '', paymentMethod: undefined, referenceNumber: '', receiptUrl: '', budgetId: budgetId ?? '', fiscalYear: '', semester: '' }); }, [form, open, budgetId]);

  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    try {
      await orgBudgetAPI.createTransaction(orgId, data);
      appToast.success('Added', 'Transaction recorded.');
      onSuccess(); onOpenChange(false); form.reset();
    } catch { appToast.error('Error', 'Failed to record transaction.'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Transaction</DialogTitle><DialogDescription>Record income or expense with details.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller name="type" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Controller name="category" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(budgetCategories.length > 0 ? budgetCategories : TRANSACTION_CATEGORIES.map((category) => ({ value: category, label: category }))).map((category) => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller name="amount" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" min={0.01} step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller name="date" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Controller name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="What was this for?" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <Controller name="vendor" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Vendor / Payee</FormLabel><FormControl><Input placeholder="Name of vendor or payee" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller name="paymentMethod" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller name="referenceNumber" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Reference #</FormLabel><FormControl><Input placeholder="Invoice or OR number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller name="receiptUrl" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Receipt URL</FormLabel><FormControl><Input placeholder="Link to receipt image" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller name="fiscalYear" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Fiscal Year</FormLabel><FormControl><Input placeholder="2025-2026" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller name="semester" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Semester</FormLabel><FormControl><Input placeholder="1st, 2nd, Summer" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
