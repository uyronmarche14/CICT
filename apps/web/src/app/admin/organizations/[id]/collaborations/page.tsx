'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Loader2, Plus, Trash2, Send, ArrowLeft } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgCollaborationsAPI } from '@/lib/api/org-collaborations';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { appToast } from '@/lib/app-toast';
import { format } from 'date-fns';
import { LookupMultiCombobox } from '@/components/ui/lookup-combobox';

export default function OrgCollaborationsPage() {
  const params = useParams(); const orgId = params.id as string;
  const { canManageOrgCollaborations } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgCollaborations(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const qc = useQueryClient();
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', participantOrgIds: [] as string[] });

  const qkAll = queryKeys.orgCollaborations.all(orgId);
  const { data: spaces = [], isLoading } = useQuery({ queryKey: qkAll, queryFn: () => orgCollaborationsAPI.list(orgId), enabled: !!orgId });
  const { data: messages = [] } = useQuery({ queryKey: queryKeys.orgCollaborations.messages(orgId, activeSpace!), queryFn: () => orgCollaborationsAPI.listMessages(orgId, activeSpace!), enabled: !!activeSpace });

  const delMut = useMutation({ mutationFn: (id: string) => orgCollaborationsAPI.delete(orgId, id), onSuccess: () => qc.invalidateQueries({ queryKey: qkAll }) });
  const sendMut = useMutation({ mutationFn: (content: string) => orgCollaborationsAPI.sendMessage(orgId, activeSpace!, content), onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.orgCollaborations.messages(orgId, activeSpace!) }); setNewMsg(''); } });
  const createMut = useMutation({
    mutationFn: () => orgCollaborationsAPI.create(orgId, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qkAll }); setOpen(false); setForm({ name: '', description: '', participantOrgIds: [] }); appToast.success('Space created', ''); },
    onError: () => appToast.error('Error', 'Failed to create space.'),
  });

  if (!shouldRender) return null;

  if (activeSpace) {
    const space = spaces.find((s: { _id: string }) => s._id === activeSpace);
    return (
      <OrgPageLayout title={space?.name || 'Collaboration Space'} icon={MessageSquare} description="View and send messages."
        action={<Button size="sm" variant="outline" onClick={() => setActiveSpace(null)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}>
        <Card className="mb-4"><CardContent className="pt-4 space-y-3 max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
          : messages.map((m: { _id: string; authorName: string; content: string; createdAt: string }) => (
              <div key={m._id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{m.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(m.createdAt), 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-sm">{m.content}</p>
              </div>
            ))}
        </CardContent></Card>
        <form onSubmit={(e) => { e.preventDefault(); if (newMsg.trim()) sendMut.mutate(newMsg); }} className="flex items-center gap-2">
          <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." className="flex-1" />
          <Button type="submit" size="icon" disabled={!newMsg.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </OrgPageLayout>
    );
  }

  return (
    <OrgPageLayout title="Collaboration Spaces" icon={MessageSquare} description="Shared workspaces for cross-organization collaboration." loading={orgLoading}
      action={<><Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />New Space</Button>
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>New Collaboration Space</DialogTitle><DialogDescription>Create a shared workspace for cross-org collaboration.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Space name" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this space for?" /></div>
            <div><Label>Participant Organizations</Label><LookupMultiCombobox kind="organizations" value={form.participantOrgIds} onChange={(value) => setForm({ ...form, participantOrgIds: value })} placeholder="Select organizations" searchPlaceholder="Search organizations..." params={{ excludeOrgId: orgId }} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} disabled={!form.name.trim() || createMut.isPending}>Create</Button></DialogFooter></DialogContent></Dialog></>}>
      {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      : spaces.length === 0 ? <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed"><p className="text-sm text-muted-foreground">No collaboration spaces yet.</p></div>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((s: { _id: string; name: string; description?: string; participantOrgIds?: string[] }) => (
            <Card key={s._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSpace(s._id)}>
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); delMut.mutate(s._id); }}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" /></Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3 px-4">
                {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                <Badge variant="outline" className="text-[10px] mt-2 px-1.5">{s.participantOrgIds?.length || 0} orgs</Badge>
              </CardContent>
            </Card>
          ))}
        </div>}
    </OrgPageLayout>
  );
}
