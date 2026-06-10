'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/event';
import { adminEventAPI, AdminRegistration } from '@/lib/api/admin-events';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Permission } from '@cict/contracts/enums';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import QrCameraScanner from '@/components/admin/QrCameraScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  QrCode,
  Undo2,
  Clock,
  Camera,
  Search,
  X,
  ScanLine,
} from 'lucide-react';
import { appToast } from '@/lib/app-toast';
import { format } from 'date-fns';
import { getScanResultBadge as getCentralScanResultBadge } from '@/utils/badge-helpers';

type ScanMethod = 'camera' | 'manual';

export default function AdminScanPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id as string;
  const { hasPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(hasPermission(Permission.SCAN_EVENT_ATTENDANCE));
  const [scanMethod, setScanMethod] = useState<ScanMethod>('camera');
  const [scanResult, setScanResult] = useState<{ result: string; studentName?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [studentNumber, setStudentNumber] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [nameResults, setNameResults] = useState<AdminRegistration[]>([]);
  const [searching, setSearching] = useState(false);

  const { data: eventData } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => eventAPI.getById(eventId),
    enabled: !!eventId,
  });

  const event = eventData?.data?.event;

  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['admin', 'event', eventId, 'registrations'],
    queryFn: () => adminEventAPI.getRegistrations(eventId),
    enabled: !!eventId,
  });

  const checkedInRegistrations = (registrations ?? [])
    .filter((r) => r.status === 'checked_in')
    .sort((a, b) => new Date(b.checkedInAt ?? 0).getTime() - new Date(a.checkedInAt ?? 0).getTime());

  const undoCheckInMutation = useMutation({
    mutationFn: (regId: string) => adminEventAPI.undoCheckIn(eventId, regId),
    onSuccess: (_data, regId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      const cachedRegs = queryClient.getQueryData<AdminRegistration[]>(
        ['admin', 'event', eventId, 'registrations']
      );
      const reg = cachedRegs?.find(r => r._id === regId);
      appToast.success('Check-in Undone', 'The student has been reverted to Registered status.', {
        label: 'Re-check-in',
        onClick: () => {
          if (reg?.studentId?.studentNumber) {
            adminEventAPI.scanAttendance(eventId, { studentNumber: reg.studentId.studentNumber })
              .then((result) => {
                if (result.result === 'SUCCESS') {
                  appToast.success('Check-in Successful', `${reg.studentId.firstName} ${reg.studentId.lastName} checked in.`);
                  queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
                } else {
                  appToast.info('Already Checked In', `${reg.studentId.firstName} ${reg.studentId.lastName} was already checked in.`);
                }
              })
              .catch(() => appToast.error('Check-in Failed', 'Could not re-check-in the student.'));
          }
        },
      });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Undo Failed', error?.response?.data?.message || 'Could not undo check-in. Please try again.');
    },
  });

  if (!shouldRender) return null;

  const handleQrScan = async (token: string) => {
    setLoading(true);
    setScanResult(null);
    try {
      const result = await adminEventAPI.scanAttendance(eventId, { qrToken: token });
      setScanResult(result);
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      const eventTitle = event?.title ?? 'this event';
      const studentName = result.studentName ?? 'Student';
      if (result.result === 'SUCCESS') {
        appToast.success('Check-in Successful', `${studentName} checked in to "${eventTitle}".`, {
          label: 'Undo',
          onClick: () => {
            if (result.registration?._id) undoCheckInMutation.mutate(result.registration._id);
          },
        });
      } else if (result.result === 'DUPLICATE') {
        appToast.info('Already Checked In', `${studentName} was already checked in to "${eventTitle}".`);
      } else {
        const label = result.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        appToast.error('Scan Failed', `${label} — "${eventTitle}".`);
      }
    } catch {
      appToast.error('Scan Error', 'Could not process QR scan. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualScanByNumber = async () => {
    if (!studentNumber.trim()) return;
    setLoading(true);
    setScanResult(null);
    try {
      const result = await adminEventAPI.scanAttendance(eventId, {
        studentNumber: studentNumber.trim().toUpperCase(),
      });
      setScanResult(result);
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      const eventTitle = event?.title ?? 'this event';
      const sn = studentNumber.trim().toUpperCase();
      if (result.result === 'SUCCESS') {
        appToast.success('Check-in Successful', `Student ${sn} checked in to "${eventTitle}".`, {
          label: 'Undo',
          onClick: () => {
            if (result.registration?._id) undoCheckInMutation.mutate(result.registration._id);
          },
        });
      } else if (result.result === 'DUPLICATE') {
        appToast.info('Already Checked In', `Student ${sn} was already checked in to "${eventTitle}".`);
      } else {
        const label = result.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        appToast.error('Check-in Failed', `${label} for ${sn} at "${eventTitle}".`);
      }
      setStudentNumber('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Check-in Error', error?.response?.data?.message || `Could not check in ${studentNumber}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSearch = async (q: string) => {
    setNameQuery(q);
    if (q.trim().length < 2) {
      setNameResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await adminEventAPI.searchRegistrations(eventId, q.trim());
      setNameResults(results);
    } catch {
      setNameResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleNameSelect = async (reg: AdminRegistration) => {
    setNameQuery('');
    setNameResults([]);
    setLoading(true);
    setScanResult(null);
    try {
      const result = await adminEventAPI.scanAttendance(eventId, {
        studentNumber: reg.studentId.studentNumber,
      });
      setScanResult({ ...result, studentName: `${reg.studentId.firstName} ${reg.studentId.lastName}` });
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      const studentName = `${reg.studentId.firstName} ${reg.studentId.lastName}`;
      const eventTitle = event?.title ?? 'this event';
      if (result.result === 'SUCCESS') {
        appToast.success('Check-in Successful', `${studentName} checked in to "${eventTitle}".`, {
          label: 'Undo',
          onClick: () => undoCheckInMutation.mutate(reg._id),
        });
      } else if (result.result === 'DUPLICATE') {
        appToast.info('Already Checked In', `${studentName} was already checked in to "${eventTitle}".`);
      } else {
        const label = result.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        appToast.error('Check-in Failed', `${label} for ${studentName} at "${eventTitle}".`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Check-in Error', error?.response?.data?.message || `Could not check in ${reg.studentId.firstName} ${reg.studentId.lastName}.`);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result: string) => getCentralScanResultBadge(result.toLowerCase());

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push(`/admin/events/${eventId}`)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scan Attendance</h1>
          {event && <p className="text-muted-foreground">{event.title}</p>}
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={scanMethod === 'camera' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScanMethod('camera')}
          >
            <Camera className="w-4 h-4 mr-1.5" /> Camera
          </Button>
          <Button
            variant={scanMethod === 'manual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScanMethod('manual')}
          >
            <Search className="w-4 h-4 mr-1.5" /> Manual
          </Button>
        </div>
      </div>

      {scanMethod === 'camera' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QrCameraScanner
              onScan={handleQrScan}
              onError={(msg) => appToast.error('Camera Error', msg, { label: 'Try Manual', onClick: () => setScanMethod('manual') })}
              scanning={loading}
            />
            {scanResult && scanResult.result === 'SUCCESS' && !loading && (
              <div className="flex justify-center mt-4">
                {getResultBadge(scanResult.result)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {scanMethod === 'manual' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5" />
                Check-in by Student Number
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter student number"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualScanByNumber()}
                />
                <Button onClick={handleManualScanByNumber} disabled={loading || !studentNumber.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check In'}
                </Button>
              </div>

              {scanResult && (
                <div className="flex justify-center py-2">
                  {getResultBadge(scanResult.result)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="w-5 h-5" />
                Search by Name
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type a student name to search..."
                  value={nameQuery}
                  onChange={(e) => handleNameSearch(e.target.value)}
                  className="pl-8"
                />
                {nameQuery && (
                  <button
                    onClick={() => { setNameQuery(''); setNameResults([]); }}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {searching && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}

              {!searching && nameResults.length > 0 && (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {nameResults.map((reg) => (
                    <button
                      key={reg._id}
                      onClick={() => handleNameSelect(reg)}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {reg.studentId.firstName} {reg.studentId.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{reg.studentId.studentNumber}</p>
                      </div>
                      <Badge variant={reg.status === 'checked_in' ? 'secondary' : 'outline'} className="text-[10px]">
                        {reg.status === 'checked_in' ? 'Checked In' : reg.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {!searching && nameQuery.length >= 2 && nameResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No matching registrations found.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {regsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : checkedInRegistrations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No check-ins yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Student No.</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Checked In At</TableHead>
                  <TableHead className="w-20 text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkedInRegistrations.slice(0, 20).map((reg) => (
                  <TableRow key={reg._id}>
                    <TableCell className="font-medium">
                      {reg.studentId.firstName} {reg.studentId.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{reg.studentId.studentNumber}</TableCell>
                    <TableCell className="text-sm">
                      {reg.checkedInAt ? format(new Date(reg.checkedInAt), 'MMM dd, h:mm a') : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => undoCheckInMutation.mutate(reg._id)}
                        disabled={undoCheckInMutation.isPending}
                      >
                        <Undo2 className="w-3.5 h-3.5 mr-1" /> Undo
                      </Button>
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
