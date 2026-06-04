'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgMentorshipsAPI } from '@/lib/api/org-mentorships';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appToast } from '@/lib/app-toast';
import { LookupCombobox } from '@/components/ui/lookup-combobox';
import { format } from 'date-fns';

const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' };

export default function OrgMentorshipPage() {
  const params = useParams(); const orgId = params.id as string;
  const { canManageOrgMentorship } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgMentorship(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [menteeOrgId, setMenteeOrgId] = useState('');
  const [focusAreas, setFocusAreas] = useState('');

  const { data: mentorships = [], isLoading } = useQuery({ queryKey: queryKeys.orgMentorships.all(orgId), queryFn: () => orgMentorshipsAPI.list(orgId), enabled: !!orgId });
  const delMut = useMutation({ mutationFn: (id: string) => orgMentorshipsAPI.delete(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orgMentorships.all(orgId) }) });
  const createMut = useMutation({
    mutationFn: () => orgMentorshipsAPI.create(orgId, { menteeOrgId, focusAreas: focusAreas.split(',').map((s) => s.trim()).filter(Boolean), startDate: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.orgMentorships.all(orgId) }); setOpen(false); setMenteeOrgId(''); setFocusAreas(''); appToast.success('Mentorship established', ''); },
    onError: () => appToast.error('Error', 'Failed to create mentorship.'),
  });

  if (!shouldRender) return null;

  const role = (m: { mentorOrgId: string }) => m.mentorOrgId === orgId ? 'Mentor' : 'Mentee';
  const partner = (m: { mentorOrgId: string; menteeOrgId: string }) => m.mentorOrgId === orgId ? m.menteeOrgId : m.mentorOrgId;

  return (
    <OrgPageLayout title="Mentorship" icon={GraduationCap} description="Establish and manage mentorship relationships." loading={orgLoading}
      action={<><Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Establish Mentorship</Button>
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>Establish Mentorship</DialogTitle><DialogDescription>Mentor another organization.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Mentee Organization</Label><LookupCombobox kind="organizations" value={menteeOrgId} onChange={setMenteeOrgId} placeholder="Select organization" searchPlaceholder="Search organizations..." params={{ excludeOrgId: orgId }} /></div>
            <div><Label>Focus areas (comma separated)</Label><Input value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} placeholder="e.g. leadership, event planning" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} disabled={!menteeOrgId.trim() || createMut.isPending}>Establish</Button></DialogFooter></DialogContent></Dialog></>}>
      {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : mentorships.length === 0 ? <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed"><p className="text-sm text-muted-foreground">No mentorships yet.</p></div>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentorships.map((m: { _id: string; mentorOrgId: string; menteeOrgId: string; status: string; startDate: string; focusAreas?: string[] }) => (
            <Card key={m._id}>
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{partner(m)}</CardTitle>
                  <div className="flex items-center gap-1"><Badge className={`text-[10px] px-1.5 ${statusColors[m.status] || ''}`}>{m.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => delMut.mutate(m._id)}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" /></Button></div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 px-4 space-y-2">
                <Badge variant="outline" className="text-[10px] px-1.5">{role(m)}</Badge>
                <p className="text-xs text-muted-foreground">Started {format(new Date(m.startDate), 'MMM d, yyyy')}</p>
                {m.focusAreas && m.focusAreas.length > 0 && <div className="flex flex-wrap gap-1">{m.focusAreas.map((f: string, i: number) => <Badge key={i} variant="secondary" className="text-[9px] px-1">{f}</Badge>)}</div>}
              </CardContent>
            </Card>
          ))}
        </div>}
    </OrgPageLayout>
  );
}
