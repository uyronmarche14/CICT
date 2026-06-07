'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Loader2, Plus, Check, X, Ban } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgResourcesAPI } from '@/lib/api/org-resources';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { appToast } from '@/lib/app-toast';
import { format } from 'date-fns';
import { LookupCombobox } from '@/components/ui/lookup-combobox';
import { ReferenceDataSelect } from '@/components/ui/reference-data-select';

const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', denied: 'bg-red-100 text-red-700', fulfilled: 'bg-blue-100 text-blue-700', cancelled: 'bg-gray-100 text-gray-600' };
const typeColors: Record<string, string> = { venue: 'bg-purple-100 text-purple-700', equipment: 'bg-cyan-100 text-cyan-700', budget: 'bg-emerald-100 text-emerald-700', personnel: 'bg-orange-100 text-orange-700', other: 'bg-gray-100 text-gray-600' };

export default function OrgResourcesPage() {
  const params = useParams(); const orgId = params.id as string;
  const { canManageOrgResources } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgResources(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ resourceType: 'other', description: '', providingOrgId: '' });

  const qk = { inc: queryKeys.orgResources.incoming(orgId), out: queryKeys.orgResources.outgoing(orgId) };
  const { data: outgoing = [], isLoading: outLoading } = useQuery({ queryKey: qk.out, queryFn: () => orgResourcesAPI.outgoing(orgId), enabled: !!orgId });
  const { data: incoming = [], isLoading: incLoading } = useQuery({ queryKey: qk.inc, queryFn: () => orgResourcesAPI.incoming(orgId), enabled: !!orgId });

  const approveMut = useMutation({ mutationFn: (id: string) => orgResourcesAPI.approve(orgId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: qk.inc }); qc.invalidateQueries({ queryKey: qk.out }); } });
  const denyMut = useMutation({ mutationFn: (id: string) => orgResourcesAPI.deny(orgId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: qk.inc }); qc.invalidateQueries({ queryKey: qk.out }); } });
  const cancelMut = useMutation({ mutationFn: (id: string) => orgResourcesAPI.cancel(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: qk.out }) });
  const createMut = useMutation({
    mutationFn: () => orgResourcesAPI.create(orgId, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.out }); setOpen(false); setForm({ resourceType: 'other', description: '', providingOrgId: '' }); appToast.success('Request sent', ''); },
    onError: () => appToast.error('Error', 'Failed to create request.'),
  });

  if (!shouldRender) return null;

  type ReqItem = { _id: string; resourceType: string; status: string; description: string; providingOrgId?: string; dateNeeded?: string };
  const renderList = (items: ReqItem[], empty: string, showActions: 'none' | 'outgoing' | 'incoming') => items.length === 0
    ? <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed"><p className="text-sm text-muted-foreground">{empty}</p></div>
    : <div className="space-y-2">{items.map((r: ReqItem) => (
        <Card key={r._id}><CardContent className="py-3 px-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2"><Badge className={`text-[10px] px-1.5 ${typeColors[r.resourceType] || ''}`}>{r.resourceType}</Badge><Badge className={`text-[10px] px-1.5 ${statusColors[r.status] || ''}`}>{r.status}</Badge></div>
              <p className="text-sm font-medium">{r.description}</p>
              {r.providingOrgId && <p className="text-xs text-muted-foreground">Provider: {r.providingOrgId}</p>}
              {r.dateNeeded && <p className="text-xs text-muted-foreground">Needed: {format(new Date(r.dateNeeded), 'MMM d')}</p>}
            </div>
            <div className="flex items-center gap-1">
              {showActions === 'incoming' && r.status === 'pending' && <><Button size="sm" variant="default" className="h-7 text-xs" onClick={() => approveMut.mutate(r._id)}><Check className="mr-1 h-3 w-3" />Approve</Button><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => denyMut.mutate(r._id)}><X className="mr-1 h-3 w-3" />Deny</Button></>}
              {showActions === 'outgoing' && (r.status === 'pending' || r.status === 'approved') && <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => cancelMut.mutate(r._id)}><Ban className="mr-1 h-3 w-3" />Cancel</Button>}
            </div>
          </div>
        </CardContent></Card>
    ))}</div>;

  return (
    <OrgPageLayout title="Resource Pooling" icon={Package} description="Share and request resources across organizations." loading={orgLoading}
      action={<><Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Request Resource</Button>
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>Request Resource</DialogTitle><DialogDescription>Request a resource from another organization.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Resource Type</Label>
              <ReferenceDataSelect
                groupKey="resourceTypes"
                value={form.resourceType}
                onChange={(value) => setForm({ ...form, resourceType: value })}
                placeholder="Select resource type"
                fallback={[
                    { value: 'venue', label: 'venue' },
                    { value: 'equipment', label: 'equipment' },
                    { value: 'budget', label: 'budget' },
                    { value: 'personnel', label: 'personnel' },
                    { value: 'other', label: 'other' },
                  ]}
              />
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What do you need?" /></div>
            <div><Label>Provider Organization (optional)</Label><LookupCombobox kind="organizations" value={form.providingOrgId} onChange={(value) => setForm({ ...form, providingOrgId: value })} placeholder="Select provider" searchPlaceholder="Search organizations..." params={{ excludeOrgId: orgId }} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} disabled={!form.description.trim() || createMut.isPending}>Send Request</Button></DialogFooter></DialogContent></Dialog></>}>
      <Tabs defaultValue="outgoing">
        <TabsList><TabsTrigger value="outgoing">My Requests</TabsTrigger><TabsTrigger value="incoming">Incoming</TabsTrigger></TabsList>
        <TabsContent value="outgoing" className="mt-4">{outLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : renderList(outgoing, 'No outgoing requests.', 'outgoing')}</TabsContent>
        <TabsContent value="incoming" className="mt-4">{incLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : renderList(incoming, 'No incoming requests.', 'incoming')}</TabsContent>
      </Tabs>
    </OrgPageLayout>
  );
}
