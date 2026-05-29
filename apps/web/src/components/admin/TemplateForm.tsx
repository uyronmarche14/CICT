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
import { appToast } from '@/lib/app-toast';
import { orgTemplatesAPI } from '@/lib/api/org-templates';

const formSchema = z.object({ name: z.string().min(1, 'Name is required'), description: z.string().optional() });

interface RoleItem { name: string; permissions: string[] }

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { _id: string; name: string; description?: string; defaultRoles?: RoleItem[]; defaultColorScheme?: { primary: string; secondary: string; accent: string }; defaultStructure?: { committees: string[]; programs: string[] } } | null;
  onSuccess: () => void;
}

export function TemplateForm({ open, onOpenChange, item, onSuccess }: TemplateFormProps) {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [colors, setColors] = useState({ primary: '#6e29f6', secondary: '#f629a8', accent: '#29f6d2' });
  const [committees, setCommittees] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { name: '', description: '' } });

  useEffect(() => {
    if (open) {
      form.reset({ name: item?.name ?? '', description: item?.description ?? '' });
      setRoles(item?.defaultRoles ?? []);
      if (item?.defaultColorScheme) setColors(item.defaultColorScheme);
      setCommittees(item?.defaultStructure?.committees ?? []);
      setPrograms(item?.defaultStructure?.programs ?? []);
    }
  }, [form, item, open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const payload = { ...data, defaultRoles: roles, defaultColorScheme: colors, defaultStructure: { committees, programs } };
      if (item) { await orgTemplatesAPI.update(item._id, payload); appToast.success('Updated', 'Template updated.'); }
      else { await orgTemplatesAPI.create(payload); appToast.success('Created', 'Template created.'); }
      onSuccess(); onOpenChange(false); form.reset(); setRoles([]);
      setColors({ primary: '#6e29f6', secondary: '#f629a8', accent: '#29f6d2' }); setCommittees([]); setPrograms([]);
    } catch { appToast.error('Error', 'Failed to save template.'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? 'Edit Template' : 'Create Template'}</DialogTitle>
          <DialogDescription>{item ? 'Update template.' : 'Create a reusable structure template.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Template name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Controller name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Optional description" className="min-h-[60px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Default Roles</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setRoles([...roles, { name: '', permissions: [] }])}><Plus className="h-3 w-3 mr-1" />Add Role</Button>
              </div>
              {roles.map((role, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Role name" value={role.name} onChange={(e) => { const u = [...roles]; u[i] = { ...u[i], name: e.target.value }; setRoles(u); }} className="flex-1" />
                  <Input placeholder="permission1, permission2" value={role.permissions.join(', ')} onChange={(e) => { const u = [...roles]; u[i] = { ...u[i], permissions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }; setRoles(u); }} className="flex-[2]" />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setRoles(roles.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div>
              <FormLabel>Color Scheme</FormLabel>
              <div className="grid grid-cols-3 gap-3 mt-1">
                {(['primary', 'secondary', 'accent'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="color" value={colors[key]} onChange={(e) => setColors({ ...colors, [key]: e.target.value })} className="h-8 w-8 rounded border cursor-pointer" />
                    <span className="text-xs text-muted-foreground capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Committees</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={() => setCommittees([...committees, ''])}><Plus className="h-3 w-3" /></Button>
                </div>
                {committees.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={c} onChange={(e) => { const u = [...committees]; u[i] = e.target.value; setCommittees(u); }} placeholder="Committee name" />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCommittees(committees.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Programs</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPrograms([...programs, ''])}><Plus className="h-3 w-3" /></Button>
                </div>
                {programs.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={p} onChange={(e) => { const u = [...programs]; u[i] = e.target.value; setPrograms(u); }} placeholder="Program name" />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setPrograms(programs.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
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
