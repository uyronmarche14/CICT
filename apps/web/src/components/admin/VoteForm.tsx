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
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appToast } from '@/lib/app-toast';
import { orgVotesAPI } from '@/lib/api/org-votes';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isAnonymous: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface Position { title: string; maxSelections: number }
interface Candidate { name: string; position: string }

interface VoteFormProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { _id: string; title: string; description?: string; startDate: string; endDate: string; isAnonymous: boolean; positions?: Position[]; candidates?: Candidate[] } | null;
  onSuccess: () => void;
}

export function VoteForm({ orgId, open, onOpenChange, item, onSuccess }: VoteFormProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', startDate: '', endDate: '', isAnonymous: true },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: item?.title ?? '',
        description: item?.description ?? '',
        startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        isAnonymous: item?.isAnonymous ?? true,
      });
      setPositions(item?.positions ?? []);
      setCandidates(item?.candidates ?? []);
    }
  }, [form, item, open]);

  const onSubmit = async (data: FormValues) => {
    if (positions.length === 0) { appToast.error('Error', 'At least one position is required.'); return; }
    if (candidates.length === 0) { appToast.error('Error', 'At least one candidate is required.'); return; }
    try {
      const payload = { ...data, positions, candidates };
      if (item) {
        await orgVotesAPI.update(orgId, item._id, payload);
        appToast.success('Updated', 'Election has been updated.');
      } else {
        await orgVotesAPI.create(orgId, payload);
        appToast.success('Created', 'Election has been created.');
      }
      onSuccess(); onOpenChange(false); form.reset(); setPositions([]); setCandidates([]);
    } catch { appToast.error('Error', 'Failed to save election.'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Election' : 'Create Election'}</DialogTitle>
          <DialogDescription>{item ? 'Update election details.' : 'Set up positions, candidates, and voting period.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Election title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Controller control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Optional description" className="min-h-[60px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>Start Date</FormLabel><FormControl><DatePicker value={field.value ?? ''} onChange={(v) => field.onChange(v || '')} /></FormControl><FormMessage /></FormItem>
              )} />
              <Controller control={form.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>End Date</FormLabel><FormControl><DatePicker value={field.value ?? ''} onChange={(v) => field.onChange(v || '')} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Controller control={form.control} name="isAnonymous" render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl><Checkbox checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
                <FormLabel className="!mt-0">Anonymous voting</FormLabel>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Positions</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setPositions([...positions, { title: '', maxSelections: 1 }])}>
                  <Plus className="h-3 w-3 mr-1" />Add Position
                </Button>
              </div>
              {positions.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Position title" value={p.title} onChange={(e) => { const u = [...positions]; u[i] = { ...u[i], title: e.target.value }; setPositions(u); }} className="flex-1" />
                  <Input type="number" min={1} placeholder="Max" value={p.maxSelections} onChange={(e) => { const u = [...positions]; u[i] = { ...u[i], maxSelections: parseInt(e.target.value) || 1 }; setPositions(u); }} className="w-20" />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setPositions(positions.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Candidates</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setCandidates([...candidates, { name: '', position: '' }])}>
                  <Plus className="h-3 w-3 mr-1" />Add Candidate
                </Button>
              </div>
              {candidates.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Name" value={c.name} onChange={(e) => { const u = [...candidates]; u[i] = { ...u[i], name: e.target.value }; setCandidates(u); }} className="flex-1" />
                  <Select value={c.position} onValueChange={(v) => { const u = [...candidates]; u[i] = { ...u[i], position: v }; setCandidates(u); }}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Position" /></SelectTrigger>
                    <SelectContent>
                      {positions.filter((p) => p.title).map((p) => (<SelectItem key={p.title} value={p.title}>{p.title}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setCandidates(candidates.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
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
