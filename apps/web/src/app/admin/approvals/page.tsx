'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { useApprovalQueue, useApprovalStats } from '@/hooks/use-approval-queue';
import type { ApprovalQueueParams } from '@/lib/api/approval';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Newspaper,
  Megaphone,
  Calendar,
  AlertCircle,
  RefreshCw,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { appToast } from '@/lib/app-toast';
import { membershipAPI, OrganizationMembership } from '@/lib/api/organization-membership';
import { Permission } from '@/types';
import { adminContentAPI, type AdminContentKind } from '@/features/admin-content';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'events', label: 'Events' },
  { value: 'news', label: 'News' },
  { value: 'announcements', label: 'Announcements' },
];

const CONTENT_TYPE_CONFIG: Record<string, { icon: typeof Newspaper; label: string; href: string }> = {
  event: { icon: Calendar, label: 'Event', href: '/admin/events' },
  news: { icon: Newspaper, label: 'News', href: '/admin/news' },
  announcement: { icon: Megaphone, label: 'Announcement', href: '/admin/announcements' },
};

const toAdminContentKind = (contentType: string): AdminContentKind =>
  contentType === 'announcement' || contentType === 'announcements'
    ? 'announcement'
    : contentType === 'event' || contentType === 'events'
      ? 'event'
      : 'news';

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient();
  const { hasPermission, hasAnyScopedPermission, hasAnyGlobalOrScopedPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(hasAnyGlobalOrScopedPermission(Permission.APPROVE_CONTENT) || hasAnyGlobalOrScopedPermission(Permission.REJECT_CONTENT));

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; contentType: string; title: string } | null>(null);

  const { data: queueData, isLoading, isError, refetch } = useApprovalQueue({ page, limit: 20, type: typeFilter as ApprovalQueueParams['type'] });
  const { data: statsData } = useApprovalStats();

  const canApprove = hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT);
  const canReject = hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT);

  const [pendingMemberships, setPendingMemberships] = useState<OrganizationMembership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const canManageMemberships = hasPermission(Permission.MANAGE_MEMBER_ROLES) || hasAnyScopedPermission(Permission.MANAGE_MEMBER_ROLES);

  const fetchPendingMemberships = useCallback(async () => {
    setLoadingMemberships(true);
    try {
      const memberships = await membershipAPI.getPending();
      setPendingMemberships(memberships);
    } catch (err) {
      console.error('Failed to load pending memberships:', err);
    } finally {
      setLoadingMemberships(false);
    }
  }, []);

  useEffect(() => {
    if (canManageMemberships) {
      fetchPendingMemberships();
    }
  }, [canManageMemberships, fetchPendingMemberships]);

  const handleApproveMembership = async (orgId: string, membershipId: string) => {
    setApprovingId(membershipId);
    try {
      await membershipAPI.approve(orgId, membershipId);
      appToast.success('Approved', 'Membership application approved.');
      fetchPendingMemberships();
    } catch {
      appToast.error('Failed', 'Could not approve membership.');
    } finally {
      setApprovingId(null);
    }
  };

  const getStudentInfo = (m: OrganizationMembership) => {
    const student = typeof m.studentId === 'object' ? m.studentId : null;
    return {
      name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      initials: student ? student.firstName.charAt(0) : '?',
      number: student?.studentNumber || '—',
    };
  };

  const handleRejectMembership = async (orgId: string, membershipId: string) => {
    setRejectingId(membershipId);
    try {
      await membershipAPI.reject(orgId, membershipId);
      appToast.success('Rejected', 'Membership application rejected.');
      fetchPendingMemberships();
    } catch {
      appToast.error('Failed', 'Could not reject membership.');
    } finally {
      setRejectingId(null);
    }
  };

  const approveMutation = useMutation({
    mutationFn: async ({ id, contentType }: { id: string; contentType: string }) => {
      return adminContentAPI.workflow(toAdminContentKind(contentType), id, 'approve');
    },
    onSuccess: () => {
      appToast.success('Approved', 'Content has been approved.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] });
    },
    onError: () => {
      appToast.error('Approval Failed', 'Could not approve content. Please try again.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, contentType, reason }: { id: string; contentType: string; reason: string }) => {
      return adminContentAPI.workflow(toAdminContentKind(contentType), id, 'reject', reason);
    },
    onSuccess: () => {
      appToast.success('Rejected', 'Content has been rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] });
    },
    onError: () => {
      appToast.error('Rejection Failed', 'Could not reject content. Please try again.');
    },
  });

  const handleApprove = useCallback(async (id: string, contentType: string) => {
    approveMutation.mutate({ id, contentType });
  }, [approveMutation]);

  const handleReject = useCallback(async (reason: string) => {
    if (!rejectTarget) return;
    rejectMutation.mutate({ id: rejectTarget.id, contentType: rejectTarget.contentType, reason });
    setRejectTarget(null);
  }, [rejectTarget, rejectMutation]);

  const items = queueData?.data?.items ?? [];
  const pagination = queueData?.data?.pagination;
  const pendingCount = statsData?.data?.pending;

  if (!shouldRender) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7" />
            Approvals
          </h1>
          <p className="text-muted-foreground">
            {pendingCount != null ? (
              <>{pendingCount} item{pendingCount !== 1 ? 's' : ''} pending review</>
            ) : (
              'Review and manage pending content'
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Approval Queue</CardTitle>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-muted-foreground">Failed to load approval queue.</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <ClipboardCheck className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">No pending approvals.</p>
              <p className="text-xs text-muted-foreground">
                When content is submitted for approval, it will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right w-44">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const config = CONTENT_TYPE_CONFIG[item.contentType];
                      const TypeIcon = config?.icon ?? ClipboardCheck;
                      const detailHref = `${config?.href ?? '/admin'}/${item.contentId}`;

                      return (
                        <TableRow key={item._id}>
                          <TableCell>
                            <Badge variant="outline" className="gap-1 capitalize text-xs">
                              <TypeIcon className="w-3 h-3" />
                              {config?.label ?? item.contentType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            <Link href={detailHref} className="hover:text-primary transition-colors">
                              {item.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.submittedBy?.firstName} {item.submittedBy?.lastName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.organizationName ?? (item.ownerType === 'system' ? 'System' : '—')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {item.submittedAt ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true }) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {canApprove && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(item.contentId, item.contentType)}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              )}
                              {canReject && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setRejectTarget({ id: item.contentId, contentType: item.contentType, title: item.title });
                                    setRejectDialogOpen(true);
                                  }}
                                  disabled={rejectMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              )}
                              {!canApprove && !canReject && (
                                <span className="text-xs text-muted-foreground">View only</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                          className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {getPageNumbers(pagination.page, pagination.pages).map((p, i) =>
                        p === 'ellipsis' ? (
                          <PaginationItem key={`e-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === pagination.page}
                              size="icon"
                              onClick={(e) => { e.preventDefault(); setPage(p); }}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pagination.pages, p + 1)); }}
                          className={page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {canManageMemberships && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membership Applications
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => fetchPendingMemberships()} disabled={loadingMemberships}>
                {loadingMemberships ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending membership applications.</p>
            ) : (
              <div className="space-y-4">
                {pendingMemberships.map((m) => {
                  const info = getStudentInfo(m);
                  return (
                  <div key={m._id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {info.initials}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{info.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {info.number} &middot; {m.organization?.name || m.organizationId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied {m.appliedAt ? formatDistanceToNow(new Date(m.appliedAt), { addSuffix: true }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600"
                        onClick={() => handleApproveMembership(m.organizationId, m._id)}
                        disabled={approvingId === m._id}>
                        {approvingId === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600"
                        onClick={() => handleRejectMembership(m.organizationId, m._id)}
                        disabled={rejectingId === m._id}>
                        {rejectingId === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        Reject
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <RejectionReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleReject}
        itemTitle={rejectTarget?.title}
      />
    </div>
  );
}
