'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { eventAPI } from '@/lib/api/event';
import { adminEventAPI } from '@/lib/api/admin-events';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  MapPin,
  Users,
  Loader2,
  ArrowLeft,
  Clock,
  QrCode,
  Search,
  X,
  UserPlus,
  Download,
  CheckCheck,
  Ban,
  MoreHorizontal,
  BarChart3,
  Camera,
  UserCheck,
  ListX,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Permission } from '@/types';

type Tab = 'details' | 'registrations' | 'attendance';

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'registered', label: 'Registered' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'reserved', label: 'Reserved' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'registered': return <Badge className="bg-green-600">Registered</Badge>;
    case 'checked_in': return <Badge className="bg-blue-600">Checked In</Badge>;
    case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
    case 'reserved': return <Badge variant="outline">Reserved</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

const SCAN_RESULT_OPTIONS = [
  { value: 'all', label: 'All Results' },
  { value: 'success', label: 'Success' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'not_registered', label: 'Not Registered' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'invalid_qr', label: 'Invalid QR' },
  { value: 'event_full', label: 'Event Full' },
  { value: 'registration_closed', label: 'Registration Closed' },
];

const SCAN_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'entry', label: 'QR Scan' },
  { value: 'manual', label: 'Manual' },
];

const getScanResultBadge = (result: string) => {
  switch (result) {
    case 'success': return <Badge className="bg-green-600">Success</Badge>;
    case 'duplicate': return <Badge className="bg-blue-600">Duplicate</Badge>;
    case 'not_registered': return <Badge variant="secondary">Not Registered</Badge>;
    case 'not_eligible': return <Badge className="bg-orange-600">Not Eligible</Badge>;
    case 'invalid_qr': return <Badge className="bg-red-600">Invalid QR</Badge>;
    case 'event_full': return <Badge className="bg-red-600">Event Full</Badge>;
    case 'registration_closed': return <Badge className="bg-red-600">Closed</Badge>;
    default: return <Badge variant="outline">{result}</Badge>;
  }
};

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id as string;
  const { canAccessEventsModule, hasAnyGlobalOrScopedPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessEventsModule());
  const [tab, setTab] = useState<Tab>('details');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addRegOpen, setAddRegOpen] = useState(false);
  const [addRegStudentNo, setAddRegStudentNo] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [logPage, setLogPage] = useState(1);
  const [logResultFilter, setLogResultFilter] = useState('all');
  const [logScanType, setLogScanType] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  const canViewRegistrations = hasAnyGlobalOrScopedPermission(Permission.VIEW_EVENT_REGISTRATIONS);
  const canManageRegistrations = hasAnyGlobalOrScopedPermission(Permission.MANAGE_EVENT_REGISTRATIONS);

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => eventAPI.getById(eventId),
    enabled: !!eventId,
  });

  const { data: registrations, isLoading: regLoading } = useQuery({
    queryKey: ['admin', 'event', eventId, 'registrations'],
    queryFn: () => adminEventAPI.getRegistrations(eventId),
    enabled: !!eventId && tab === 'registrations' && canViewRegistrations,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ regId }: { regId: string }) => adminEventAPI.cancelRegistration(eventId, regId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      toast.success('Registration cancelled');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to cancel');
    },
  });

  const undoCheckInMutation = useMutation({
    mutationFn: ({ regId }: { regId: string }) => adminEventAPI.undoCheckIn(eventId, regId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      toast.success('Check-in undone');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to undo check-in');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ regId, status }: { regId: string; status: string }) =>
      adminEventAPI.updateRegistrationStatus(eventId, regId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      toast.success('Status updated');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });

  const addRegistrationMutation = useMutation({
    mutationFn: (studentNumber: string) => adminEventAPI.adminCreateRegistration(eventId, { studentNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      setAddRegOpen(false);
      setAddRegStudentNo('');
      toast.success('Registration created');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to create registration');
    },
  });

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    let result = registrations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          `${r.studentId.firstName} ${r.studentId.lastName}`.toLowerCase().includes(q) ||
          r.studentId.studentNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [registrations, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRegistrations = filteredRegistrations.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(paginatedRegistrations.map((r) => r._id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [paginatedRegistrations]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleBulkCancel = useCallback(() => {
    const ids = Array.from(selectedIds);
    Promise.all(ids.map((regId) => cancelMutation.mutateAsync({ regId })))
      .then(() => setSelectedIds(new Set()))
      .catch(() => {});
  }, [selectedIds, cancelMutation]);

  const handleBulkCheckIn = useCallback(() => {
    const ids = Array.from(selectedIds);
    Promise.all(
      ids.map((regId) => updateStatusMutation.mutateAsync({ regId, status: 'checked_in' }))
    )
      .then(() => setSelectedIds(new Set()))
      .catch(() => {});
  }, [selectedIds, updateStatusMutation]);

  const handleExportCsv = useCallback(() => {
    if (!filteredRegistrations.length) return;
    const headers = ['Student', 'Student No.', 'Status', 'Source', 'Registered At', 'Checked In'];
    const rows = filteredRegistrations.map((r) => [
      `${r.studentId.firstName} ${r.studentId.lastName}`,
      r.studentId.studentNumber,
      r.status,
      r.source,
      format(new Date(r.registeredAt), 'yyyy-MM-dd HH:mm'),
      r.checkedInAt ? format(new Date(r.checkedInAt), 'yyyy-MM-dd HH:mm') : '',
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Registrations exported');
  }, [filteredRegistrations, eventId]);

  const handleExportAttendanceCsv = useCallback(async () => {
    try {
      const logs = await adminEventAPI.exportAttendanceLogs(eventId, {
        result: logResultFilter !== 'all' ? logResultFilter : undefined,
        scanType: logScanType !== 'all' ? logScanType : undefined,
        q: logSearch || undefined,
      });
      if (!logs.length) {
        toast.error('No records to export');
        return;
      }
      const headers = ['Student', 'Student No.', 'Type', 'Result', 'Scanned By', 'Scanned At', 'Notes'];
      const rows = logs.map((log) => [
        `${log.studentId?.firstName ?? ''} ${log.studentId?.lastName ?? ''}`,
        log.studentId?.studentNumber ?? '',
        log.scanType === 'entry' ? 'QR Scan' : 'Manual',
        log.result,
        log.scannedByAdminId ? `${log.scannedByAdminId.firstName} ${log.scannedByAdminId.lastName}` : '',
        format(new Date(log.scannedAt), 'yyyy-MM-dd HH:mm'),
        log.notes ?? '',
      ]);
      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `attendance-logs-${eventId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Attendance logs exported');
    } catch {
      toast.error('Failed to export attendance logs');
    }
  }, [eventId, logResultFilter, logScanType, logSearch]);

  const handleAddRegistration = useCallback(() => {
    if (!addRegStudentNo.trim()) return;
    addRegistrationMutation.mutate(addRegStudentNo.trim().toUpperCase());
  }, [addRegStudentNo, addRegistrationMutation]);

  const event = eventData?.data?.event;

  const handleDownloadQr = useCallback(() => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${event?.title ?? 'event'}-qr.png`;
    a.click();
    toast.success('QR code downloaded');
  }, [event?.title]);

  const attendanceStats = useMemo(() => {
    if (!registrations) return null;
    const total = registrations.length;
    const checkedIn = registrations.filter((r) => r.status === 'checked_in').length;
    const cancelled = registrations.filter((r) => r.status === 'cancelled').length;
    const registered = registrations.filter((r) => r.status === 'registered').length;
    const reserved = registrations.filter((r) => r.status === 'reserved').length;
    const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    const walkIns = registrations.filter((r) => r.source === 'walk_in').length;

    const hourlyBuckets: Record<string, number> = {};
    for (const reg of registrations) {
      if (reg.checkedInAt) {
        const hour = format(new Date(reg.checkedInAt), 'HH:00');
        hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
      }
    }
    const hourly = Object.entries(hourlyBuckets)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return { total, checkedIn, cancelled, registered, reserved, rate, walkIns, hourly };
  }, [registrations]);

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${eventId}`
    : '';

  const { data: attendanceLogsData } = useQuery({
    queryKey: ['admin', 'event', eventId, 'attendance-logs', logPage, logResultFilter, logScanType, logSearch],
    queryFn: () => adminEventAPI.getAttendanceLogs(eventId, {
      page: logPage,
      limit: 20,
      result: logResultFilter !== 'all' ? logResultFilter : undefined,
      scanType: logScanType !== 'all' ? logScanType : undefined,
      q: logSearch || undefined,
    }),
    enabled: !!eventId && tab === 'attendance' && canViewRegistrations,
  });

  if (!shouldRender) return null;

  if (eventLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'registrations', label: `Registrations (${event.registeredCount ?? 0})` },
    { key: 'attendance', label: `Attendance (${event.checkedInCount ?? 0})` },
  ];

  const allSelectedOnPage =
    paginatedRegistrations.length > 0 &&
    paginatedRegistrations.every((r) => selectedIds.has(r._id));

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground mt-1">{event.excerpt}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(event.startDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p className="font-medium">
                    {event.registeredCount ?? 0}{event.maxAttendees > 0 ? ` / ${event.maxAttendees}` : ''} registered
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge>{event.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Registration: </span>
                <Badge variant={event.isRegistrationOpen ? 'default' : 'secondary'}>
                  {event.isRegistrationOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Allow Walk-ins: </span>
                <Badge variant="outline">{event.allowWalkIns ? 'Yes' : 'No'}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Checked in: </span>
                <span className="font-medium">{event.checkedInCount ?? 0}</span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button variant="default" asChild>
                <Link href={`/admin/events/${eventId}/scan`}>
                  <QrCode className="w-4 h-4 mr-2" /> Scan Attendance
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setQrDialogOpen(true)}>
                <Download className="w-4 h-4 mr-2" /> Event QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'registrations' && (
        <div className="space-y-4">
          {!canViewRegistrations ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                You do not have permission to view event registrations.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or student no..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="pl-8 h-9"
                    />
                    {search && (
                      <button
                        onClick={() => { setSearch(''); setPage(1); }}
                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
                  >
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!filteredRegistrations.length}>
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </Button>
                  {canManageRegistrations && (
                    <Dialog open={addRegOpen} onOpenChange={setAddRegOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="w-4 h-4 mr-1" /> Add Registration
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Registration</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Student Number</label>
                            <Input
                              placeholder="Enter student number"
                              value={addRegStudentNo}
                              onChange={(e) => setAddRegStudentNo(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddRegistration()}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAddRegOpen(false)}>Cancel</Button>
                          <Button
                            onClick={handleAddRegistration}
                            disabled={addRegistrationMutation.isPending || !addRegStudentNo.trim()}
                          >
                            {addRegistrationMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : null}
                            Register
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {selectedIds.size > 0 && canManageRegistrations && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
                  <span className="text-muted-foreground">{selectedIds.size} selected</span>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkCancel}
                      disabled={cancelMutation.isPending}
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" /> Cancel Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkCheckIn}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Check In Selected
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                    className="ml-auto"
                  >
                    Clear
                  </Button>
                </div>
              )}

              <Card>
                <CardContent className="p-0">
                  {regLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : !filteredRegistrations.length ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {search || statusFilter !== 'all'
                        ? 'No registrations match your search or filters.'
                        : 'No registrations yet.'}
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            {canManageRegistrations && (
                              <TableHead className="w-10">
                                <input
                                  type="checkbox"
                                  checked={allSelectedOnPage}
                                  onChange={(e) => handleSelectAll(e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                              </TableHead>
                            )}
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Student</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Student No.</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Source</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Registered At</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Checked In</TableHead>
                            {canManageRegistrations && (
                              <TableHead className="w-16 text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedRegistrations.map((reg) => (
                            <TableRow key={reg._id} className={selectedIds.has(reg._id) ? 'bg-muted/50' : ''}>
                              {canManageRegistrations && (
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.has(reg._id)}
                                    onChange={(e) => handleSelectOne(reg._id, e.target.checked)}
                                    className="rounded border-gray-300"
                                  />
                                </TableCell>
                              )}
                              <TableCell className="font-medium">
                                {reg.studentId.firstName} {reg.studentId.lastName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{reg.studentId.studentNumber}</TableCell>
                              <TableCell>{getStatusBadge(reg.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground capitalize">{reg.source}</TableCell>
                              <TableCell className="text-sm">{format(new Date(reg.registeredAt), 'MMM dd, h:mm a')}</TableCell>
                              <TableCell className="text-sm">
                                {reg.checkedInAt ? format(new Date(reg.checkedInAt), 'MMM dd, h:mm a') : '—'}
                              </TableCell>
                              {canManageRegistrations && (
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                      {reg.status === 'registered' && (
                                        <DropdownMenuItem
                                          onClick={() => updateStatusMutation.mutate({ regId: reg._id, status: 'checked_in' })}
                                        >
                                          <CheckCheck className="w-4 h-4 mr-2" /> Mark Checked In
                                        </DropdownMenuItem>
                                      )}
                                      {reg.status === 'checked_in' && (
                                        <DropdownMenuItem
                                          onClick={() => undoCheckInMutation.mutate({ regId: reg._id })}
                                        >
                                          <Clock className="w-4 h-4 mr-2" /> Undo Check-in
                                        </DropdownMenuItem>
                                      )}
                                      {reg.status !== 'cancelled' && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => cancelMutation.mutate({ regId: reg._id })}
                                          >
                                            <Ban className="w-4 h-4 mr-2" /> Cancel Registration
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {reg.status === 'cancelled' && (
                                        <DropdownMenuItem
                                          onClick={() => updateStatusMutation.mutate({ regId: reg._id, status: 'registered' })}
                                        >
                                          <Users className="w-4 h-4 mr-2" /> Restore Registration
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Showing {(safePage - 1) * PAGE_SIZE + 1}–
                            {Math.min(safePage * PAGE_SIZE, filteredRegistrations.length)} of {filteredRegistrations.length}
                          </p>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                                  className={safePage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {getPageNumbers(safePage, totalPages).map((p, i) =>
                                p === 'ellipsis' ? (
                                  <PaginationItem key={`e-${i}`}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                ) : (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      isActive={p === safePage}
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
                                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                                  className={safePage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
            </>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-6">
          {!canViewRegistrations ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                You do not have permission to view attendance data.
              </CardContent>
            </Card>
          ) : !attendanceStats ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-in Rate</p>
                      <p className="text-2xl font-bold">{attendanceStats.rate}%</p>
                      <p className="text-xs text-muted-foreground">{attendanceStats.checkedIn} / {attendanceStats.total} registered</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Checked In</p>
                      <p className="text-2xl font-bold">{attendanceStats.checkedIn}</p>
                      <p className="text-xs text-muted-foreground">
                        {attendanceStats.walkIns > 0 && `${attendanceStats.walkIns} walk-ins`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Registered</p>
                      <p className="text-2xl font-bold">{attendanceStats.registered}</p>
                      <p className="text-xs text-muted-foreground">
                        {attendanceStats.reserved > 0 && `${attendanceStats.reserved} reserved`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <ListX className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Cancelled</p>
                      <p className="text-2xl font-bold">{attendanceStats.cancelled}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {attendanceStats.hourly.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Check-in Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-32">
                      {attendanceStats.hourly.map(({ hour, count }) => {
                        const maxCount = Math.max(...attendanceStats.hourly.map((h) => h.count));
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground font-medium">{count}</span>
                            <div
                              className="w-full rounded bg-primary/80 transition-all hover:bg-primary"
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">{hour}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/events/${eventId}/scan`}>
                    <Camera className="w-4 h-4 mr-2" /> Open Scanner
                  </Link>
                </Button>
              </div>

              {attendanceLogsData?.summary && (
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 text-green-700 dark:text-green-400">
                    <span className="font-semibold">{attendanceLogsData.summary.byResult.success ?? 0}</span>
                    <span className="text-muted-foreground">success</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    <span className="font-semibold">{attendanceLogsData.summary.byResult.duplicate ?? 0}</span>
                    <span className="text-muted-foreground">duplicate</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-400">
                    <span className="font-semibold">{attendanceLogsData.summary.byResult.not_registered ?? 0}</span>
                    <span className="text-muted-foreground">not registered</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-400">
                    <span className="font-semibold">{attendanceLogsData.summary.byResult.invalid_qr ?? 0}</span>
                    <span className="text-muted-foreground">invalid QR</span>
                  </div>
                  <div className="w-px h-6 bg-border self-center" />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary">
                    <span className="font-semibold">{attendanceLogsData.summary.byScanType.entry ?? 0}</span>
                    <span className="text-muted-foreground">QR</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary">
                    <span className="font-semibold">{attendanceLogsData.summary.byScanType.manual ?? 0}</span>
                    <span className="text-muted-foreground">manual</span>
                  </div>
                </div>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListChecks className="w-4 h-4" />
                      Scan Log
                    </CardTitle>
                    {attendanceLogsData && attendanceLogsData.total > 0 && (
                      <Button variant="outline" size="sm" onClick={handleExportAttendanceCsv}>
                        <Download className="w-4 h-4 mr-1" /> Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name..."
                        value={logSearch}
                        onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                        className="pl-8 h-9"
                      />
                      {logSearch && (
                        <button
                          onClick={() => { setLogSearch(''); setLogPage(1); }}
                          className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Select
                      value={logResultFilter}
                      onValueChange={(v) => { setLogResultFilter(v); setLogPage(1); }}
                    >
                      <SelectTrigger className="w-[150px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCAN_RESULT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={logScanType}
                      onValueChange={(v) => { setLogScanType(v); setLogPage(1); }}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCAN_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!attendanceLogsData ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : attendanceLogsData.logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {logSearch || logResultFilter !== 'all' || logScanType !== 'all'
                        ? 'No scan records match your filters.'
                        : 'No scan records yet. Check in students to see their scan history here.'}
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Student</TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Student No.</TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Type</TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Result</TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Scanned By</TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Scanned At</TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attendanceLogsData.logs.map((log) => (
                              <TableRow key={log._id}>
                                <TableCell className="font-medium">
                                  {log.studentId?.firstName} {log.studentId?.lastName}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {log.studentId?.studentNumber ?? '—'}
                                </TableCell>
                                <TableCell className="text-sm capitalize">
                                  {log.scanType === 'entry' ? 'QR Scan' : 'Manual'}
                                </TableCell>
                                <TableCell>{getScanResultBadge(log.result)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {log.scannedByAdminId
                                    ? `${log.scannedByAdminId.firstName} ${log.scannedByAdminId.lastName}`
                                    : '—'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                  {format(new Date(log.scannedAt), 'MMM dd, h:mm a')}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                                  {log.notes ?? '—'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {attendanceLogsData.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Page {attendanceLogsData.page} of {attendanceLogsData.totalPages} ({attendanceLogsData.total} records)
                          </p>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={(e) => { e.preventDefault(); setLogPage((p) => Math.max(1, p - 1)); }}
                                  className={attendanceLogsData.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {getPageNumbers(attendanceLogsData.page, attendanceLogsData.totalPages).map((p, i) =>
                                p === 'ellipsis' ? (
                                  <PaginationItem key={`e-${i}`}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                ) : (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      isActive={p === attendanceLogsData.page}
                                      size="icon"
                                      onClick={(e) => { e.preventDefault(); setLogPage(p); }}
                                      className="cursor-pointer"
                                    >
                                      {p}
                                    </PaginationLink>
                                  </PaginationItem>
                                )
                              )}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={(e) => { e.preventDefault(); setLogPage((p) => Math.min(attendanceLogsData.totalPages, p + 1)); }}
                                  className={attendanceLogsData.page >= attendanceLogsData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
            </>
          )}
        </div>
      )}
    </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
          <DialogDescription>
            Students can scan this QR code to open the event page and register.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {eventUrl && (
            <QRCodeCanvas
              ref={qrRef}
              value={eventUrl}
              size={240}
              level="H"
              includeMargin
              className="rounded-lg border p-2"
            />
          )}
          <p className="text-sm text-muted-foreground text-center break-all max-w-full">
            {eventUrl}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button onClick={handleDownloadQr}>
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}