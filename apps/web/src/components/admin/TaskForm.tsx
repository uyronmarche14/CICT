'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { appToast } from '@/lib/app-toast';
import { orgTasksAPI } from '@/lib/api/org-tasks';
import { LookupMultiCombobox } from '@/components/ui/lookup-combobox';
import { useReferenceData } from '@/hooks/use-reference-data';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  committee: z.string().optional(),
  officerPosition: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormItem {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  category?: string;
  tags?: string[];
  checklist?: Array<{ text: string; completed: boolean }>;
  assigneeIds?: string[];
  committee?: string;
  officerPosition?: string;
  meetingId?: string;
  actionItemIndex?: number;
}

interface TaskFormProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TaskFormItem | null;
  onSuccess: () => void;
}

export function TaskForm({ orgId, open, onOpenChange, item, onSuccess }: TaskFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [checklist, setChecklist] = useState<Array<{ text: string; completed: boolean }>>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const { items: taskCategories } = useReferenceData('taskCategories');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', priority: 'medium', dueDate: '', category: '', committee: '', officerPosition: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: item?.title ?? '',
        description: item?.description ?? '',
        priority: (item?.priority as FormValues['priority']) ?? 'medium',
        dueDate: item?.dueDate ?? '',
        category: item?.category ?? '',
        committee: item?.committee ?? '',
        officerPosition: item?.officerPosition ?? '',
      });
      setTags(item?.tags ?? []);
      setChecklist(item?.checklist ?? []);
      setAssigneeIds(item?.assigneeIds ?? []);
    }
  }, [form, item, open]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: Record<string, unknown> = { ...data, tags, checklist, assigneeIds };
      if (item?.meetingId) { payload.meetingId = item.meetingId; }
      if (item?.actionItemIndex !== undefined) { payload.actionItemIndex = item.actionItemIndex; }
      if (item) {
        await orgTasksAPI.update(orgId, item._id, payload);
        appToast.success('Updated', 'Task has been updated.');
      } else {
        await orgTasksAPI.create(orgId, payload);
        appToast.success('Created', 'Task has been created.');
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
      setTags([]);
      setChecklist([]);
      setAssigneeIds([]);
    } catch {
      appToast.error('Error', 'Failed to save task.');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(''); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>{item ? 'Update task details.' : 'Add a new task for this organization.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Task title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
              <Controller control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Controller control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="General" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(taskCategories.length > 0 ? taskCategories : [
                        { value: 'General', label: 'General' },
                        { value: 'Event', label: 'Event' },
                        { value: 'Academic', label: 'Academic' },
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Other', label: 'Other' },
                      ]).map((category) => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Controller control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due Date</FormLabel><FormControl><DatePicker value={field.value ?? ''} onChange={(v) => field.onChange(v || '')} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center gap-2">
                <Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-3 w-3" /></Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel>Assignees</FormLabel>
              <LookupMultiCombobox
                kind="users"
                value={assigneeIds}
                onChange={setAssigneeIds}
                placeholder="Assign users"
                searchPlaceholder="Search users..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="committee" render={({ field }) => (
                <FormItem><FormLabel>Committee</FormLabel><FormControl><Input placeholder="e.g. Finance, Events" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller control={form.control} name="officerPosition" render={({ field }) => (
                <FormItem><FormLabel>Officer Position</FormLabel><FormControl><Input placeholder="e.g. Treasurer" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Controller control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Optional description" className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Checklist</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setChecklist([...checklist, { text: '', completed: false }])}>
                  <Plus className="h-3 w-3 mr-1" />Add Item
                </Button>
              </div>
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox checked={item.completed} onCheckedChange={(c) => {
                    const u = [...checklist]; u[i] = { ...u[i], completed: !!c }; setChecklist(u);
                  }} />
                  <Input value={item.text} onChange={(e) => {
                    const u = [...checklist]; u[i] = { ...u[i], text: e.target.value }; setChecklist(u);
                  }} placeholder="Checklist item" className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setChecklist(checklist.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{item ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
