'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, Search, X, Download, UserPlus, Ban, CheckCheck, Clock, MoreHorizontal, Users } from 'lucide-react';
import { format } from 'date-fns';
import { adminEventAPI, type AdminRegistration } from '@/lib/api/admin-events';
import type { EventRegistrationStatus } from '@cict/contracts/enums';
import { STATUS_OPTIONS, PAGE_SIZE, getStatusBadge, getPageNumbers } from './helpers';

interface EventDetailRegistrationsProps {
  eventId: string;
  canViewRegistrations: boolean;
  canManageRegistrations: boolean;
}

export function EventDetailRegistrations({
  eventId,
  canViewRegistrations,
  canManageRegistrations,
}: EventDetailRegistrationsProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addRegOpen, setAddRegOpen] = useState(false);
  const [addRegStudentNo, setAddRegStudentNo] = useState('');

  const queryKey = ['admin', 'event', eventId, 'registrations', search, statusFilter];

  const { data: regData, isLoading: regLoading } = useQuery({
    queryKey,
    queryFn: () => adminEventAPI.getRegistrations(eventId),
    enabled: canViewRegistrations,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'event', eventId] });

  const cancelMutation = useMutation({
    mutationFn: (params: { regId: string }) => adminEventAPI.cancelRegistration(eventId, params.regId),
    onSuccess: invalidate,
  });

  const undoCheckInMutation = useMutation({
    mutationFn: (params: { regId: string }) => adminEventAPI.undoCheckIn(eventId, params.regId),
    onSuccess: invalidate,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: { regId: string; status: string }) =>
      adminEventAPI.updateRegistrationStatus(eventId, params.regId, { status: params.status }),
    onSuccess: invalidate,
  });

  const addRegistrationMutation = useMutation({
    mutationFn: () => adminEventAPI.adminCreateRegistration(eventId, { studentNumber: addRegStudentNo.trim() }),
    onSuccess: () => { invalidate(); setAddRegOpen(false); setAddRegStudentNo(''); },
  });

  const registrations = regData ?? [];

  const filteredRegistrations = useMemo(() => {
    let items = registrations;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r) =>
        r.studentId?.firstName?.toLowerCase().includes(q) ||
        r.studentId?.lastName?.toLowerCase().includes(q) ||
        r.studentId?.studentNumber?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      items = items.filter((r) => r.status === statusFilter);
    }
    return items;
  }, [registrations, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRegistrations = filteredRegistrations.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelectedOnPage = paginatedRegistrations.length > 0 &&
    paginatedRegistrations.every((r) => selectedIds.has(r._id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSet = new Set(selectedIds);
      paginatedRegistrations.forEach((r) => newSet.add(r._id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginatedRegistrations.forEach((r) => newSet.delete(r._id));
      setSelectedIds(newSet);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleBulkCancel = () => {
    selectedIds.forEach((id) => cancelMutation.mutate({ regId: id }));
    setSelectedIds(new Set());
  };

  const handleBulkCheckIn = () => {
    selectedIds.forEach((id) => updateStatusMutation.mutate({ regId: id, status: 'checked_in' }));
    setSelectedIds(new Set());
  };

  const handleAddRegistration = () => {
    if (!addRegStudentNo.trim()) return;
    addRegistrationMutation.mutate();
  };

  const handleExportCsv = () => {
    const headers = ['Student Name', 'Student No.', 'Status', 'Source', 'Registered At', 'Checked In'];
    const rows = filteredRegistrations.map((r) => [
      `${r.studentId?.firstName ?? ''} ${r.studentId?.lastName ?? ''}`,
      r.studentId?.studentNumber ?? '',
      r.status,
      r.source,
      r.registeredAt ? format(new Date(r.registeredAt), 'yyyy-MM-dd HH:mm') : '',
      r.checkedInAt ? format(new Date(r.checkedInAt), 'yyyy-MM-dd HH:mm') : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `registrations-${eventId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!canViewRegistrations) {
    return (
      <Card><CardContent className="p-6 text-center text-muted-foreground">
        You do not have permission to view event registrations.
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or student no..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-8 h-9" />
            {search && (
              <Button variant="ghost" size="icon" onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-2 top-2.5"><X className="h-4 w-4" /></Button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt: { value: string; label: string }) => (
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
                <Button size="sm"><UserPlus className="w-4 h-4 mr-1" /> Add Registration</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Registration</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Student Number</Label>
                    <Input placeholder="Enter student number" value={addRegStudentNo}
                      onChange={(e) => setAddRegStudentNo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddRegistration()} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRegOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddRegistration}
                    disabled={addRegistrationMutation.isPending || !addRegStudentNo.trim()}>
                    {addRegistrationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
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
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="ml-auto">Clear</Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {regLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !filteredRegistrations.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {search || statusFilter !== 'all' ? 'No registrations match your search or filters.' : 'No registrations yet.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {canManageRegistrations && (
                      <TableHead className="w-10">
                        <Checkbox checked={allSelectedOnPage} onCheckedChange={(c) => handleSelectAll(c === true)} />
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
                          <Checkbox checked={selectedIds.has(reg._id)}
                            onCheckedChange={(c) => handleSelectOne(reg._id, c === true)} />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{reg.studentId?.firstName} {reg.studentId?.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{reg.studentId?.studentNumber}</TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">{reg.source}</TableCell>
                      <TableCell className="text-sm">{reg.registeredAt ? format(new Date(reg.registeredAt), 'MMM dd, h:mm a') : '—'}</TableCell>
                      <TableCell className="text-sm">{reg.checkedInAt ? format(new Date(reg.checkedInAt), 'MMM dd, h:mm a') : '—'}</TableCell>
                      {canManageRegistrations && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {reg.status === 'registered' && (
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ regId: reg._id, status: 'checked_in' })}>
                                  <CheckCheck className="w-4 h-4 mr-2" /> Mark Checked In
                                </DropdownMenuItem>
                              )}
                              {reg.status === 'checked_in' && (
                                <DropdownMenuItem onClick={() => undoCheckInMutation.mutate({ regId: reg._id })}>
                                  <Clock className="w-4 h-4 mr-2" /> Undo Check-in
                                </DropdownMenuItem>
                              )}
                              {reg.status !== 'cancelled' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => cancelMutation.mutate({ regId: reg._id })}>
                                    <Ban className="w-4 h-4 mr-2" /> Cancel Registration
                                  </DropdownMenuItem>
                                </>
                              )}
                              {reg.status === 'cancelled' && (
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ regId: reg._id, status: 'registered' })}>
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
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredRegistrations.length)} of {filteredRegistrations.length}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                          className={safePage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                      {getPageNumbers(safePage, totalPages).map((p, i) =>
                        p === 'ellipsis' ? (
                          <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink isActive={p === safePage} size="icon"
                              onClick={(e) => { e.preventDefault(); setPage(p); }} className="cursor-pointer">
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                          className={safePage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
