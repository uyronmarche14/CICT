'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, Inbox, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { inquiriesAPI } from '@/lib/api/inquiries';
import { appToast } from '@/lib/app-toast';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import type { Inquiry, InquiryStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type StatusFilter = InquiryStatus | 'all';

const statusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  read: 'Read',
  archived: 'Archived',
};

const statusBadgeVariant: Record<InquiryStatus, 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  read: 'secondary',
  archived: 'outline',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export default function AdminInquiriesPage() {
  const permissions = usePermissions();
  const { shouldRender } = useAdminPageAccess(permissions.canAccessAdmin);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inquiriesAPI.getAll({
        page: 1,
        limit: 100,
        status,
        search: search.trim() || undefined,
      });
      setInquiries(data.inquiries);
      setTotal(data.pagination.total);
    } catch {
      appToast.error('Messages Failed To Load', 'Could not load public contact messages.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const counts = useMemo(
    () => ({
      new: inquiries.filter((inquiry) => inquiry.status === 'new').length,
      read: inquiries.filter((inquiry) => inquiry.status === 'read').length,
      archived: inquiries.filter((inquiry) => inquiry.status === 'archived').length,
    }),
    [inquiries]
  );

  const updateStatus = async (inquiry: Inquiry, nextStatus: InquiryStatus) => {
    setSavingId(inquiry._id);
    try {
      const updated = await inquiriesAPI.updateStatus(inquiry._id, nextStatus);
      setInquiries((items) => items.map((item) => (item._id === updated._id ? updated : item)));
      appToast.success('Message Updated', `Marked as ${statusLabels[nextStatus].toLowerCase()}.`);
    } catch {
      appToast.error('Update Failed', 'Could not update this message.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteInquiry = async (inquiry: Inquiry) => {
    if (!window.confirm(`Delete the message from ${inquiry.fullName}?`)) {
      return;
    }

    setSavingId(inquiry._id);
    try {
      await inquiriesAPI.delete(inquiry._id);
      setInquiries((items) => items.filter((item) => item._id !== inquiry._id));
      setTotal((current) => Math.max(0, current - 1));
      appToast.success('Message Deleted', 'The contact message has been removed.');
    } catch {
      appToast.error('Delete Failed', 'Could not delete this message.');
    } finally {
      setSavingId(null);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Review inquiries submitted from the public contact page.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={loadInquiries} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-2xl">{counts.new}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Read</CardDescription>
            <CardTitle className="text-2xl">{counts.read}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Archived</CardDescription>
            <CardTitle className="text-2xl">{counts.archived}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>{total} total message{total === 1 ? '' : 's'}</CardDescription>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-hairline text-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No messages found</p>
                <p className="text-xs text-muted-foreground">New contact submissions will appear here.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-72">Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry._id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(inquiry.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{inquiry.fullName}</p>
                        <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                        {inquiry.contactNumber ? (
                          <p className="text-xs text-muted-foreground">{inquiry.contactNumber}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{inquiry.inquiryType}</p>
                        <p className="text-xs text-muted-foreground">{inquiry.userType}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-56 whitespace-normal font-medium">
                      {inquiry.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[inquiry.status]}>
                        {statusLabels[inquiry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-96 whitespace-normal text-muted-foreground">
                      {inquiry.message}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {inquiry.status !== 'read' ? (
                          <Button
                            size="icon"
                            variant="outline"
                            title="Mark as read"
                            onClick={() => updateStatus(inquiry, 'read')}
                            disabled={savingId === inquiry._id}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {inquiry.status !== 'archived' ? (
                          <Button
                            size="icon"
                            variant="outline"
                            title="Archive"
                            onClick={() => updateStatus(inquiry, 'archived')}
                            disabled={savingId === inquiry._id}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="outline"
                            title="Restore as new"
                            onClick={() => updateStatus(inquiry, 'new')}
                            disabled={savingId === inquiry._id}
                          >
                            <Inbox className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          title="Delete"
                          onClick={() => deleteInquiry(inquiry)}
                          disabled={savingId === inquiry._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
