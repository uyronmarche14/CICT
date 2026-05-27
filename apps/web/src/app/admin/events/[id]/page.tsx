'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/event';
import { adminEventAPI } from '@/lib/api/admin-events';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  ArrowLeft,
  Clock,
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
  Users,
  File,
  Globe,
  Info,
  Link2,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  User,
  Video,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { appToast } from '@/lib/app-toast';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { EventOverview, EventQrDialog } from '@/components/admin/EventDetail';
import { Badge } from '@/components/ui/badge';
import { ApprovalTimeline } from '@/components/admin/ApprovalTimeline';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { useApprovalHistory } from '@/hooks/use-approval-queue';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import { getEventStatusBadge, getRegistrationBadge } from '@/utils/badge-helpers';
import {
  PAGE_SIZE,
  STATUS_OPTIONS,
  SCAN_RESULT_OPTIONS,
  SCAN_TYPE_OPTIONS,
  getStatusBadge,
  getScanResultBadge,
  getPageNumbers,
} from '@/components/admin/EventDetail';

type Tab = 'details' | 'registrations' | 'attendance';

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id as string;
  const { canAccessEventsModule, hasPermission, hasAnyScopedPermission, hasAnyGlobalOrScopedPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessEventsModule());
  const [tab, setTab] = useState<Tab>('details');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addRegOpen, setAddRegOpen] = useState(false);
  const [addRegStudentNo, setAddRegStudentNo] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logResultFilter, setLogResultFilter] = useState('all');
  const [logScanType, setLogScanType] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

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
      appToast.success('Registration Cancelled', 'The student has been removed from this event.');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Cancellation Failed', error?.response?.data?.message || 'Could not cancel registration.');
    },
  });

  const undoCheckInMutation = useMutation({
    mutationFn: ({ regId }: { regId: string }) => adminEventAPI.undoCheckIn(eventId, regId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      appToast.success('Check-in Undone', 'The student has been reverted to Registered status.');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Undo Failed', error?.response?.data?.message || 'Could not undo check-in.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ regId, status }: { regId: string; status: string }) =>
      adminEventAPI.updateRegistrationStatus(eventId, regId, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      appToast.success('Status Updated', `Registration status changed to ${variables.status.replace(/_/g, ' ')}.`);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Update Failed', error?.response?.data?.message || 'Could not update registration status.');
    },
  });

  const addRegistrationMutation = useMutation({
    mutationFn: (studentNumber: string) => adminEventAPI.adminCreateRegistration(eventId, { studentNumber }),
    onSuccess: (_data, studentNumber) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      setAddRegOpen(false);
      setAddRegStudentNo('');
      appToast.success('Registration Added', `Student ${studentNumber} has been registered for this event.`);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Registration Failed', error?.response?.data?.message || 'Could not add registration.');
    },
  });

  const { data: approvalHistoryData } = useApprovalHistory('event', eventId);

  const approveMutation = useMutation({
    mutationFn: () => eventAPI.approve(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      appToast.success('Approved', 'Event has been approved.');
    },
    onError: () => {
      appToast.error('Approval Failed', 'Could not approve event.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => eventAPI.reject(eventId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      appToast.success('Rejected', 'Event has been rejected.');
    },
    onError: () => {
      appToast.error('Rejection Failed', 'Could not reject event.');
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
    appToast.success('Export Complete', `${filteredRegistrations.length} registrations exported to CSV.`);
  }, [filteredRegistrations, eventId]);

  const handleExportAttendanceCsv = useCallback(async () => {
    try {
      const logs = await adminEventAPI.exportAttendanceLogs(eventId, {
        result: logResultFilter !== 'all' ? logResultFilter : undefined,
        scanType: logScanType !== 'all' ? logScanType : undefined,
        q: logSearch || undefined,
      });
      if (!logs.length) {
        appToast.info('Nothing to Export', 'No attendance logs match the current filters.');
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
      appToast.success('Export Complete', 'Attendance logs exported to CSV.');
    } catch {
      appToast.error('Export Failed', 'Could not export attendance logs. Please try again.');
    }
  }, [eventId, logResultFilter, logScanType, logSearch]);

  const handleAddRegistration = useCallback(() => {
    if (!addRegStudentNo.trim()) return;
    addRegistrationMutation.mutate(addRegStudentNo.trim().toUpperCase());
  }, [addRegStudentNo, addRegistrationMutation]);

  const event = eventData?.data?.event;

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
        <>
          <EventOverview event={event} eventId={eventId} onOpenQr={() => setQrDialogOpen(true)} />
          {event.approvalSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Approval Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getEventStatusBadge(event.status)}
                </div>

                <ApprovalTimeline
                  actions={approvalHistoryData?.data?.actions}
                  loading={approvalHistoryData === undefined}
                />

                {event.status === 'pending_approval' && (hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT) || hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT)) && (
                  <div className="flex gap-2 pt-2 border-t">
                    {(hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT)) && (
                      <Button
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        variant="outline"
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                    )}
                    {(hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT)) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Registration Details */}
          {(event.registrationUrl || event.registrationDeadline || event.audience || event.eligibility || event.feeLabel || event.certificateInfo || event.registrationCloseAt) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Registration Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Open: </span>
                    {getRegistrationBadge(event.isRegistrationOpen)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Walk-ins: </span>
                    <Badge variant="outline">{event.allowWalkIns ? 'Allowed' : 'Not Allowed'}</Badge>
                  </div>
                </div>
                {event.registrationUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                      {event.registrationUrl}
                    </a>
                  </div>
                )}
                {event.registrationDeadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">Deadline: <span className="font-medium">{format(new Date(event.registrationDeadline), 'MMM dd, yyyy h:mm a')}</span></span>
                  </div>
                )}
                {event.registrationCloseAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">Auto-close: <span className="font-medium">{format(new Date(event.registrationCloseAt), 'MMM dd, yyyy h:mm a')}</span></span>
                  </div>
                )}
                {event.audience && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Audience: </span>
                      <span className="font-medium">{event.audience}</span>
                    </div>
                  </div>
                )}
                {event.eligibility && (
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Eligibility: </span>
                      <span className="font-medium">{event.eligibility}</span>
                    </div>
                  </div>
                )}
                {event.feeLabel && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[100px]">Fee:</span>
                    <Badge variant="secondary">{event.feeLabel}</Badge>
                  </div>
                )}
                {event.certificateInfo && (
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Certificate: </span>
                      <span className="font-medium">{event.certificateInfo}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {(event.contactName || event.contactEmail || event.contactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.contactName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">{event.contactName}</span>
                  </div>
                )}
                {event.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={`mailto:${event.contactEmail}`} className="text-sm text-primary hover:underline">{event.contactEmail}</a>
                  </div>
                )}
                {event.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${event.contactPhone}`} className="text-sm text-primary hover:underline">{event.contactPhone}</a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Venue */}
          {(event.venueDetails?.name || event.venueDetails?.address || event.venueDetails?.room || event.venueDetails?.capacity || event.venueDetails?.accessibility || event.mapUrl || event.meetingUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Venue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.venueDetails?.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[90px]">Name:</span>
                    <span className="text-sm font-medium">{event.venueDetails.name}</span>
                  </div>
                )}
                {event.venueDetails?.address && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[90px]">Address:</span>
                    <span className="text-sm">{event.venueDetails.address}</span>
                  </div>
                )}
                {event.venueDetails?.room && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[90px]">Room:</span>
                    <span className="text-sm font-medium">{event.venueDetails.room}</span>
                  </div>
                )}
                {event.venueDetails?.capacity && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[90px]">Capacity:</span>
                    <span className="text-sm font-medium">{event.venueDetails.capacity}</span>
                  </div>
                )}
                {event.venueDetails?.accessibility && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[90px]">Accessibility:</span>
                    <span className="text-sm">{event.venueDetails.accessibility}</span>
                  </div>
                )}
                {event.mapUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Map</a>
                  </div>
                )}
                {event.meetingUrl && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Join Meeting</a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Speakers */}
          {event.speakerItems && event.speakerItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Speakers ({event.speakerItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {event.speakerItems.map((speaker, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {speaker.photo ? (
                          <img src={speaker.photo.imageUrl} alt={speaker.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{speaker.name}</p>
                        {speaker.title && <p className="text-xs text-muted-foreground truncate">{speaker.title}</p>}
                        {speaker.organization && <p className="text-xs text-muted-foreground truncate">{speaker.organization}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {(event.requirements || event.posterCaption || (event.hostOrganizationIds && event.hostOrganizationIds.length > 0) || (event.coHostOrganizationIds && event.coHostOrganizationIds.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.requirements && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Requirements</p>
                    <p className="text-sm whitespace-pre-wrap bg-secondary/20 rounded-lg p-3">{event.requirements}</p>
                  </div>
                )}
                {event.posterCaption && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Poster Caption</p>
                    <p className="text-sm">{event.posterCaption}</p>
                  </div>
                )}
                {event.hostOrganizationIds && event.hostOrganizationIds.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">Host Organizations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.hostOrganizationIds.map((id) => (
                        <Badge key={id} variant="secondary">{id}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {event.coHostOrganizationIds && event.coHostOrganizationIds.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">Co-Host Organizations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.coHostOrganizationIds.map((id) => (
                        <Badge key={id} variant="outline">{id}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {event.attachmentItems && event.attachmentItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments ({event.attachmentItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.attachmentItems.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                      <File className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.label}</p>
                        {attachment.fileSize && (
                          <p className="text-xs text-muted-foreground">
                            {(attachment.fileSize / 1024).toFixed(1)} KB{attachment.fileType ? ` · ${attachment.fileType}` : ''}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild className="shrink-0">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSearch(''); setPage(1); }}
                        className="absolute right-2 top-2.5"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                            <Label className="text-sm font-medium">Student Number</Label>
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
                    <Button variant="outline" size="sm" onClick={handleBulkCancel} disabled={cancelMutation.isPending}>
                      <Ban className="w-3.5 h-3.5 mr-1" /> Cancel Selected
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkCheckIn} disabled={updateStatusMutation.isPending}>
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Check In Selected
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="ml-auto">
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
                                <Checkbox
                                  checked={allSelectedOnPage}
                                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
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
                                  <Checkbox
                                    checked={selectedIds.has(reg._id)}
                                    onCheckedChange={(checked) => handleSelectOne(reg._id, checked === true)}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setLogSearch(''); setLogPage(1); }}
                          className="absolute right-2 top-2.5"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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

      <EventQrDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        eventUrl={eventUrl}
        eventTitle={event?.title}
      />

      <RejectionReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={async (reason) => rejectMutation.mutate(reason)}
        title="Reject Event"
        itemTitle={event?.title}
      />
    </div>
  );
}
