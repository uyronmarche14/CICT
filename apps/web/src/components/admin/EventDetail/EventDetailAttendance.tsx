'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { AdminAttendanceLog } from '@/lib/api/admin-events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Search, Camera, X } from 'lucide-react';
import { format } from 'date-fns';
import { adminEventAPI } from '@/lib/api/admin-events';
import { SCAN_RESULT_OPTIONS, SCAN_TYPE_OPTIONS, PAGE_SIZE, getScanResultBadge, getPageNumbers } from './helpers';

interface EventDetailAttendanceProps {
  eventId: string;
  canViewRegistrations: boolean;
}

export function EventDetailAttendance({ eventId, canViewRegistrations }: EventDetailAttendanceProps) {
  const [logPage, setLogPage] = useState(1);
  const [logResultFilter, setLogResultFilter] = useState('all');
  const [logScanType, setLogScanType] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  const { data: attendanceLogsData, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'event', eventId, 'attendance-logs', logPage, logResultFilter, logScanType, logSearch],
    queryFn: () => adminEventAPI.getAttendanceLogs(eventId, {
      page: logPage, limit: PAGE_SIZE,
      result: logResultFilter === 'all' ? undefined : logResultFilter,
      scanType: logScanType === 'all' ? undefined : logScanType,
      q: logSearch || undefined,
    }),
    enabled: canViewRegistrations,
  });

  const logs = attendanceLogsData?.logs ?? [];
  const totalLogPages = attendanceLogsData?.totalPages ?? 1;
  const summary = attendanceLogsData?.summary ?? null;

  const attendanceStats = useMemo(() => {
    if (!summary && !logs.length) return null;
    if (!logs.length && !summary) return null;
    const checkedIn = summary?.byResult?.success ?? 0;
    const duplicates = summary?.byResult?.duplicate ?? 0;
    const notRegistered = summary?.byResult?.not_registered ?? 0;
    const invalidQr = summary?.byResult?.invalid_qr ?? 0;
    const qrScan = summary?.byScanType?.entry ?? 0;
    const manualScan = summary?.byScanType?.manual ?? 0;
    const total = checkedIn + duplicates + notRegistered + invalidQr;
    return { checkedIn, duplicates, notRegistered, invalidQr, qrScan, manualScan, total, rate: total > 0 ? Math.round((checkedIn / total) * 100) : 0 };
  }, [logs, summary]);

  const handleExportCsv = () => {
    const params = new URLSearchParams({ format: 'csv' });
    if (logResultFilter !== 'all') params.set('result', logResultFilter);
    if (logScanType !== 'all') params.set('scanType', logScanType);
    if (logSearch) params.set('q', logSearch);
    window.open(`/api/admin/events/${eventId}/attendance/logs/export?${params}`, '_blank');
  };

  if (!canViewRegistrations) {
    return (
      <Card><CardContent className="p-6 text-center text-muted-foreground">
        You do not have permission to view attendance data.
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {attendanceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{attendanceStats.rate}%</div>
            <div className="text-xs text-muted-foreground">Check-in Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              {attendanceStats.checkedIn}/{attendanceStats.total} total
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{attendanceStats.checkedIn}</div>
            <div className="text-xs text-muted-foreground">Checked In</div>
            <div className="text-xs text-muted-foreground mt-1">{attendanceStats.qrScan} QR · {attendanceStats.manualScan} Manual</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{attendanceStats.checkedIn + attendanceStats.duplicates}</div>
            <div className="text-xs text-muted-foreground">Registered</div>
            <div className="text-xs text-muted-foreground mt-1">{attendanceStats.notRegistered} not found</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{attendanceStats.duplicates}</div>
            <div className="text-xs text-muted-foreground">Cancelled / Invalid</div>
            <div className="text-xs text-muted-foreground mt-1">{attendanceStats.invalidQr} invalid QR</div>
          </CardContent></Card>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/admin/events/${eventId}/scan`}><Camera className="w-4 h-4 mr-1" /> Open Scanner</Link>
        </Button>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary.byResult ?? {}).map(([key, count]) => (
            <Badge key={key} variant="secondary">{key}: {count}</Badge>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Scan Log</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!logs.length}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={logSearch}
                onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }} className="pl-8 h-9" />
              {logSearch && (
                <Button variant="ghost" size="icon" onClick={() => { setLogSearch(''); setLogPage(1); }}
                  className="absolute right-2 top-2.5"><X className="h-4 w-4" /></Button>
              )}
            </div>
            <Select value={logResultFilter} onValueChange={(v) => { setLogResultFilter(v); setLogPage(1); }}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCAN_RESULT_OPTIONS.map((opt: { value: string; label: string }) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={logScanType} onValueChange={(v) => { setLogScanType(v); setLogPage(1); }}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCAN_TYPE_OPTIONS.map((opt: { value: string; label: string }) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead><TableHead>Student No.</TableHead>
                  <TableHead>Type</TableHead><TableHead>Result</TableHead>
                  <TableHead>Scanned By</TableHead><TableHead>Scanned At</TableHead><TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsLoading ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
                ) : !logs.length ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No scan logs yet.</TableCell></TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">{log.studentId?.firstName} {log.studentId?.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{log.studentId?.studentNumber}</TableCell>
                      <TableCell className="capitalize">{log.scanType}</TableCell>
                      <TableCell>{getScanResultBadge(log.result)}</TableCell>
                      <TableCell>{log.scannedByAdminId ? `${log.scannedByAdminId.firstName} ${log.scannedByAdminId.lastName}` : '—'}</TableCell>
                      <TableCell className="text-sm">{log.scannedAt ? format(new Date(log.scannedAt), 'MMM dd, h:mm a') : '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.notes || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalLogPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">Page {logPage} of {totalLogPages}</p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={(e) => { e.preventDefault(); setLogPage((p) => Math.max(1, p - 1)); }}
                      className={logPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                  {getPageNumbers(logPage, totalLogPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink isActive={p === logPage} size="icon"
                          onClick={(e) => { e.preventDefault(); setLogPage(p); }} className="cursor-pointer">{p}</PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext onClick={(e) => { e.preventDefault(); setLogPage((p) => Math.min(totalLogPages, p + 1)); }}
                      className={logPage >= totalLogPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
