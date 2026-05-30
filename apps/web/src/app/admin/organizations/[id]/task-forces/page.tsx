'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersRound, Loader2, Plus, Trash2, Pencil, Calendar } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgTaskForcesAPI } from '@/lib/api/org-task-forces';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/DatePicker';
import { appToast } from '@/lib/app-toast';
import { format } from 'date-fns';

const statusColors: Record<string, string> = { planning: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' };

export default function OrgTaskForcesPage() {
  const params = useParams(); const orgId = params.id as string;
  const { canAccessOrganization } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessOrganization(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', startDate: '' });

  const { data: taskForces = [], isLoading } = useQuery({ queryKey: queryKeys.orgTaskForces.all(orgId), queryFn: () => orgTaskForcesAPI.list(orgId), enabled: !!orgId });
  const delMut = useMutation({ mutationFn: (id: string) => orgTaskForcesAPI.delete(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orgTaskForces.all(orgId) }) });
  const createMut = useMutation({
    mutationFn: () => orgTaskForcesAPI.create(orgId, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.orgTaskForces.all(orgId) }); setOpen(false); setForm({ name: '', description: '', startDate: '' }); appToast.success('Task force created', ''); },
    onError: () => appToast.error('Error', 'Failed to create task force.'),
  });

  if (!shouldRender) return null;

  return (
    <OrgPageLayout title="Task Forces" icon={UsersRound} description="Temporary cross-organization teams." loading={orgLoading}
      action={<><Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />New Task Force</Button>
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>New Task Force</DialogTitle><DialogDescription>Create a temporary cross-organization team.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Task force name" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this task force for?" /></div>
            <div><Label>Start Date</Label><DatePicker value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v || '' })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} disabled={!form.name.trim() || !form.startDate || createMut.isPending}>Create</Button></DialogFooter></DialogContent></Dialog></>}>
      {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : taskForces.length === 0 ? <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed"><p className="text-sm text-muted-foreground">No task forces yet.</p></div>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {taskForces.map((tf: { _id: string; name: string; status: string; description?: string; startDate: string; endDate?: string; participantOrgIds?: string[] }) => (
            <Card key={tf._id}>
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{tf.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => delMut.mutate(tf._id)}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 px-4 space-y-2">
                <Badge className={`text-[10px] px-1.5 ${statusColors[tf.status] || ''}`}>{tf.status}</Badge>
                {tf.description && <p className="text-xs text-muted-foreground line-clamp-2">{tf.description}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{format(new Date(tf.startDate), 'MMM d')}{tf.endDate ? ` – ${format(new Date(tf.endDate), 'MMM d')}` : ''}</div>
                {tf.participantOrgIds && tf.participantOrgIds.length > 0 && <p className="text-xs text-muted-foreground">{tf.participantOrgIds.length} org(s)</p>}
              </CardContent>
            </Card>
          ))}
        </div>}
    </OrgPageLayout>
  );
}
