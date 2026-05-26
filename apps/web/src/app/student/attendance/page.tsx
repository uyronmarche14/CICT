'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentRegistrationAPI } from '@/lib/api/student';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Clock, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { getScanResultBadge } from '@/utils/badge-helpers';

const RESULT_OPTIONS = [
  { value: 'all', label: 'All Results' },
  { value: 'success', label: 'Checked In' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'not_registered', label: 'Not Registered' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'invalid_qr', label: 'Invalid QR' },
  { value: 'event_full', label: 'Event Full' },
  { value: 'registration_closed', label: 'Registration Closed' },
];

const getResultBadge = (result: string) => getScanResultBadge(result);

export default function StudentAttendancePage() {
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: () => studentRegistrationAPI.getAttendanceHistory(),
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log) => {
      if (search) {
        const q = search.toLowerCase();
        if (!log.eventId.title.toLowerCase().includes(q)) return false;
      }
      if (resultFilter !== 'all' && log.result !== resultFilter) return false;
      return true;
    });
  }, [logs, search, resultFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Attendance History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Your event check-in and scan records.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESULT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !filteredLogs.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {search || resultFilter !== 'all'
                ? 'No records match your search or filters.'
                : 'No attendance history yet. Check in to an event to see your records here.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Event</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Result</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Scanned At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {log.eventId.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.eventId.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{log.scanType}</TableCell>
                    <TableCell>{getResultBadge(log.result)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.scannedAt), 'MMM dd, h:mm a')}
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