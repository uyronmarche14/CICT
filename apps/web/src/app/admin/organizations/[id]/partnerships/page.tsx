'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Handshake, Loader2, Plus, Check, X, Ban } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgPartnershipsAPI } from '@/lib/api/org-partnerships';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { appToast } from '@/lib/app-toast';
import { LookupCombobox } from '@/components/ui/lookup-combobox';
import { ReferenceDataSelect } from '@/components/ui/reference-data-select';

const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', active: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700', terminated: 'bg-gray-100 text-gray-600' };

export default function OrgPartnershipsPage() {
  const params = useParams(); const orgId = params.id as string;
  const { canManageOrgPartnerships } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgPartnerships(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [orgIdB, setOrgIdB] = useState('');
  const [partnershipType, setPartnershipType] = useState('');

  const { data: partnerships = [], isLoading } = useQuery({ queryKey: queryKeys.orgPartnerships.all(orgId), queryFn: () => orgPartnershipsAPI.list(orgId), enabled: !!orgId });

  const acceptMut = useMutation({ mutationFn: (id: string) => orgPartnershipsAPI.accept(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orgPartnerships.all(orgId) }) });
  const declineMut = useMutation({ mutationFn: (id: string) => orgPartnershipsAPI.decline(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orgPartnerships.all(orgId) }) });
  const terminateMut = useMutation({ mutationFn: (id: string) => orgPartnershipsAPI.terminate(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orgPartnerships.all(orgId) }) });
  const createMut = useMutation({
    mutationFn: () => orgPartnershipsAPI.create(orgId, { orgIdB, partnershipType: partnershipType || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.orgPartnerships.all(orgId) }); setOpen(false); setOrgIdB(''); setPartnershipType(''); appToast.success('Partnership created', 'Invitation sent.'); },
    onError: () => appToast.error('Error', 'Failed to create partnership.'),
  });

  if (!shouldRender) return null;

  const partnerName = (p: { orgIdA: string; orgIdB: string }) => p.orgIdA === orgId ? p.orgIdB : p.orgIdA;
  const isIncoming = (p: { orgIdB: string }) => p.orgIdB === orgId;

  return (
    <OrgPageLayout title="Partnerships" icon={Handshake} description="Manage inter-organization partnerships." loading={orgLoading}
      action={<><Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />New Partnership</Button>
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>New Partnership</DialogTitle><DialogDescription>Invite another organization to partner with.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Partner Organization</Label>
              <LookupCombobox
                kind="organizations"
                value={orgIdB}
                onChange={setOrgIdB}
                placeholder="Select organization"
                searchPlaceholder="Search organizations..."
                params={{ excludeOrgId: orgId }}
              />
            </div>
            <div className="space-y-2">
              <Label>Partnership Type</Label>
              <ReferenceDataSelect
                groupKey="partnershipTypes"
                value={partnershipType}
                onChange={setPartnershipType}
                placeholder="Select type"
              />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} disabled={!orgIdB.trim() || createMut.isPending}>Send Invitation</Button></DialogFooter></DialogContent></Dialog></>}>
      {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : partnerships.length === 0 ? <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60"><p className="text-sm text-muted-foreground">No partnerships yet.</p></div>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerships.map((p: { _id: string; orgIdA: string; orgIdB: string; status: string; partnershipType?: string; createdAt: string }) => (
            <Card key={p._id}>
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{partnerName(p)}</CardTitle>
                  <Badge className={`text-[10px] px-1.5 ${statusColors[p.status] || ''}`}>{p.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 px-4 space-y-2">
                {p.partnershipType && <p className="text-xs text-muted-foreground">Type: {p.partnershipType}</p>}
                <p className="text-xs text-muted-foreground">{isIncoming(p) ? 'Invitation received' : 'Initiated by you'}</p>
                <div className="flex items-center gap-2 pt-1">
                  {p.status === 'pending' && isIncoming(p) && (
                    <><Button size="sm" variant="default" className="h-7 text-xs" onClick={() => acceptMut.mutate(p._id)}><Check className="mr-1 h-3 w-3" />Accept</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => declineMut.mutate(p._id)}><X className="mr-1 h-3 w-3" />Decline</Button></>
                  )}
                  {p.status === 'active' && <Button size="sm" variant="outline" className="h-7 text-xs text-red-500" onClick={() => terminateMut.mutate(p._id)}><Ban className="mr-1 h-3 w-3" />Terminate</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>}
    </OrgPageLayout>
  );
}
