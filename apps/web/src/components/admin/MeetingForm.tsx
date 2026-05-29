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
import { DatePicker } from '@/components/ui/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appToast } from '@/lib/app-toast';
import { orgMeetingsAPI } from '@/lib/api/org-meetings';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  description: z.string().optional(),
  minutes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Meeting = Awaited<ReturnType<typeof orgMeetingsAPI.list>>[number];
type MeetingFormItem = Pick<Meeting, '_id'> & Partial<Meeting>;

interface MeetingFormProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MeetingFormItem | null;
  onSuccess: () => void;
}

export function MeetingForm({ orgId, open, onOpenChange, item, onSuccess }: MeetingFormProps) {
  const [agenda, setAgenda] = useState<Array<{ topic: string; duration?: number; presenter?: string }>>([]);
  const [actionItems, setActionItems] = useState<Array<{ text: string; assigneeId?: string; dueDate?: string; status: 'open' | 'in_progress' | 'completed' }>>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', date: '', duration: 60, location: '', meetingUrl: '', description: '', minutes: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: item?.title ?? '', date: item?.date ? new Date(item.date).toISOString().split('T')[0] : '',
        duration: item?.duration ?? 60, location: item?.location ?? '', meetingUrl: item?.meetingUrl ?? '',
        description: item?.description ?? '', minutes: item?.minutes ?? '',
      });
      setAgenda(item?.agenda ?? []);
      setActionItems(item?.actionItems ?? []);
    }
  }, [form, item, open]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = { ...data, agenda, actionItems };
      if (item) { await orgMeetingsAPI.update(orgId, item._id, payload); appToast.success('Updated', 'Meeting updated.'); }
      else { await orgMeetingsAPI.create(orgId, payload); appToast.success('Created', 'Meeting scheduled.'); }
      onSuccess(); onOpenChange(false); form.reset(); setAgenda([]); setActionItems([]);
    } catch { appToast.error('Error', 'Failed to save meeting.'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Meeting' : 'Schedule Meeting'}</DialogTitle>
          <DialogDescription>{item ? 'Update meeting details.' : 'Schedule a new organization meeting.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Meeting title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller control={form.control} name="duration" render={({ field }) => (
                <FormItem><FormLabel>Duration (min)</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Room or venue" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller control={form.control} name="meetingUrl" render={({ field }) => (
                <FormItem><FormLabel>Meeting URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Controller control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Optional description" className="min-h-[60px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Agenda */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Agenda</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setAgenda([...agenda, { topic: '', duration: undefined, presenter: '' }])}>
                  <Plus className="h-3 w-3 mr-1" />Add Topic
                </Button>
              </div>
              {agenda.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Topic" value={a.topic} onChange={(e) => { const u = [...agenda]; u[i] = { ...u[i], topic: e.target.value }; setAgenda(u); }} className="flex-[2]" />
                  <Input type="number" placeholder="min" value={a.duration ?? ''} onChange={(e) => { const u = [...agenda]; u[i] = { ...u[i], duration: parseInt(e.target.value) || 0 }; setAgenda(u); }} className="w-20" />
                  <Input placeholder="Presenter" value={a.presenter ?? ''} onChange={(e) => { const u = [...agenda]; u[i] = { ...u[i], presenter: e.target.value }; setAgenda(u); }} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setAgenda(agenda.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Minutes */}
            <Controller control={form.control} name="minutes" render={({ field }) => (
              <FormItem><FormLabel>Minutes of Meeting</FormLabel><FormControl><Textarea placeholder="Record meeting minutes, decisions, and key points..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Action Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Action Items</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => setActionItems([...actionItems, { text: '', assigneeId: '', dueDate: '', status: 'open' as const }])}>
                  <Plus className="h-3 w-3 mr-1" />Add Action
                </Button>
              </div>
              {actionItems.map((ai, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Action item" value={ai.text} onChange={(e) => {
                    const u = [...actionItems]; u[i] = { ...u[i], text: e.target.value }; setActionItems(u);
                  }} className="flex-[2]" />
                  <Select value={ai.status} onValueChange={(v: 'open' | 'in_progress' | 'completed') => {
                    const u = [...actionItems]; u[i] = { ...u[i], status: v }; setActionItems(u);
                  }}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setActionItems(actionItems.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{item ? 'Update' : 'Schedule'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
