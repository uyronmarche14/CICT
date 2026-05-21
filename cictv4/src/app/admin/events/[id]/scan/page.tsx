'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/event';
import { adminEventAPI } from '@/lib/api/admin-events';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
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
import { Loader2, ArrowLeft, QrCode, UserCheck, AlertCircle, CheckCircle, Undo2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminScanPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id as string;
  const { canAccessEventsModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessEventsModule());
  const [studentNumber, setStudentNumber] = useState('');
  const [scanResult, setScanResult] = useState<{ result: string; studentName?: string } | null>(null);
  const [loading, setLoading] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      toast.success('Check-in undone');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to undo check-in');
    },
  });

  if (!shouldRender) return null;

  const handleManualScan = async () => {
    if (!studentNumber.trim()) return;
    setLoading(true);
    setScanResult(null);
    try {
      const result = await adminEventAPI.scanAttendance(eventId, {
        studentNumber: studentNumber.trim().toUpperCase(),
      });
      setScanResult(result);
      queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });
      if (result.result === 'SUCCESS') {
        toast.success('Check-in successful!');
      } else if (result.result === 'DUPLICATE') {
        toast.info('Student was already checked in');
      } else {
        toast.error(`Scan result: ${result.result}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'SUCCESS': return <Badge className="bg-green-600 text-lg px-4 py-2"><CheckCircle className="w-5 h-5 mr-2" /> Checked In</Badge>;
      case 'DUPLICATE': return <Badge className="bg-blue-600 text-lg px-4 py-2"><UserCheck className="w-5 h-5 mr-2" /> Already Checked In</Badge>;
      case 'INVALID_QR': return <Badge className="bg-red-600 text-lg px-4 py-2"><AlertCircle className="w-5 h-5 mr-2" /> Invalid QR</Badge>;
      case 'NOT_REGISTERED': return <Badge variant="secondary" className="text-lg px-4 py-2">Not Registered</Badge>;
      case 'NOT_ELIGIBLE': return <Badge className="bg-orange-600 text-lg px-4 py-2">Not Eligible</Badge>;
      case 'EVENT_FULL': return <Badge className="bg-red-600 text-lg px-4 py-2">Event Full</Badge>;
      case 'REGISTRATION_CLOSED': return <Badge className="bg-red-600 text-lg px-4 py-2">Registration Closed</Badge>;
      default: return <Badge variant="outline">{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push(`/admin/events/${eventId}`)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Scan Attendance</h1>
        {event && <p className="text-muted-foreground">{event.title}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Camera QR scanning will be available here in Phase 4. For now, use the manual lookup below.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Manual Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter student number"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
            />
            <Button onClick={handleManualScan} disabled={loading || !studentNumber.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check In'}
            </Button>
          </div>

          {scanResult && (
            <div className="flex justify-center py-4">
              {getResultBadge(scanResult.result)}
            </div>
          )}
        </CardContent>
      </Card>

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