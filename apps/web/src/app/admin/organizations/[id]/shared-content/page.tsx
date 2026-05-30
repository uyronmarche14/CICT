'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Share2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgSharedContentAPI } from '@/lib/api/org-shared-content';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { appToast } from '@/lib/app-toast';
import { format } from 'date-fns';

export default function OrgSharedContentPage() {
  const params = useParams(); const orgId = params.id as string;
  const { canAccessOrganization } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessOrganization(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ contentType: 'news', contentId: '', targetOrgIds: '' });

  const qkInc = queryKeys.orgSharedContent.incoming(orgId);
  const qkOut = queryKeys.orgSharedContent.outgoing(orgId);
  const { data: incoming = [], isLoading: incLoading } = useQuery({ queryKey: qkInc, queryFn: () => orgSharedContentAPI.incoming(orgId), enabled: !!orgId });
  const { data: outgoing = [], isLoading: outLoading } = useQuery({ queryKey: qkOut, queryFn: () => orgSharedContentAPI.outgoing(orgId), enabled: !!orgId });

  const removeMut = useMutation({ mutationFn: (id: string) => orgSharedContentAPI.remove(orgId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: qkInc }); qc.invalidateQueries({ queryKey: qkOut }); } });
  const shareMut = useMutation({
    mutationFn: () => orgSharedContentAPI.share(orgId, { ...form, targetOrgIds: form.targetOrgIds.split(',').map((s) => s.trim()).filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qkOut }); setOpen(false); setForm({ contentType: 'news', contentId: '', targetOrgIds: '' }); appToast.success('Content shared', ''); },
    onError: () => appToast.error('Error', 'Failed to share content.'),
  });

  if (!shouldRender) return null;

  type ShareItem = { _id: string; contentType: string; contentId: string; sourceOrgId: string; createdAt: string };
  const renderList = (items: ShareItem[], emptyMsg: string) => items.length === 0
    ? <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed"><p className="text-sm text-muted-foreground">{emptyMsg}</p></div>
    : <div className="space-y-2">{items.map((item: ShareItem) => (
        <Card key={item._id}><CardContent className="flex items-center justify-between py-3 px-4">
          <div>
            <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px] px-1.5">{item.contentType}</Badge><span className="text-sm font-medium truncate max-w-[200px]">{item.contentId}</span></div>
            <p className="text-[10px] text-muted-foreground mt-1">From: {item.sourceOrgId} · {format(new Date(item.createdAt), 'MMM d, yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMut.mutate(item._id)}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" /></Button>
        </CardContent></Card>
    ))}</div>;

  return (
    <OrgPageLayout title="Shared Content" icon={Share2} description="Content shared between organizations." loading={orgLoading}
      action={<><Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Share Content</Button>
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>Share Content</DialogTitle><DialogDescription>Share a news, announcement, or event with other organizations.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Content Type</Label>
              <Select value={form.contentType} onValueChange={(v) => setForm({ ...form, contentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="news">News</SelectItem><SelectItem value="announcement">Announcement</SelectItem><SelectItem value="event">Event</SelectItem></SelectContent>
              </Select></div>
            <div><Label>Content ID</Label><Input value={form.contentId} onChange={(e) => setForm({ ...form, contentId: e.target.value })} placeholder="Content _id" /></div>
            <div><Label>Target organizations (comma separated slugs)</Label><Input value={form.targetOrgIds} onChange={(e) => setForm({ ...form, targetOrgIds: e.target.value })} placeholder="e.g. css, iss" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => shareMut.mutate()} disabled={!form.contentId.trim() || !form.targetOrgIds.trim() || shareMut.isPending}>Share</Button></DialogFooter></DialogContent></Dialog></>}>
      <Tabs defaultValue="incoming"><TabsList><TabsTrigger value="incoming">Incoming</TabsTrigger><TabsTrigger value="outgoing">Outgoing</TabsTrigger></TabsList>
        <TabsContent value="incoming" className="mt-4">{incLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : renderList(incoming, 'No incoming shared content.')}</TabsContent>
        <TabsContent value="outgoing" className="mt-4">{outLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : renderList(outgoing, 'No outgoing shared content.')}</TabsContent>
      </Tabs>
    </OrgPageLayout>
  );
}
