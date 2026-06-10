'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/event';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { appToast } from '@/lib/app-toast';
import { Permission } from '@/types';
import {
  EventOverview,
  EventQrDialog,
  EventDetailHeader,
  EventInfoPanel,
  EventDetailRegistrations,
  EventDetailAttendance,
} from '@/components/admin/EventDetail';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { useApprovalHistory } from '@/hooks/use-approval-queue';

type Tab = 'details' | 'registrations' | 'attendance';

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id as string;
  const { canAccessEventsModule, hasPermission, hasAnyScopedPermission, hasAnyGlobalOrScopedPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessEventsModule());
  const [tab, setTab] = useState<Tab>('details');

  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const canViewRegistrations = hasAnyGlobalOrScopedPermission(Permission.VIEW_EVENT_REGISTRATIONS);
  const canManageRegistrations = hasAnyGlobalOrScopedPermission(Permission.MANAGE_EVENT_REGISTRATIONS);
  const canApprove = hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT);
  const canReject = hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT);

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['admin', 'event', eventId],
    queryFn: () => eventAPI.getById(eventId),
    enabled: !!eventId,
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

  const event = eventData?.data?.event;

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${eventId}`
    : '';

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

  return (
    <div className="space-y-6">
      <EventDetailHeader
        eventId={eventId}
        tab={tab}
        onTabChange={setTab}
        tabs={tabs}
      />

      {tab === 'details' && (
        <>
          <EventOverview event={event} eventId={eventId} onOpenQr={() => setQrDialogOpen(true)} />
          <EventInfoPanel
            event={event}
            approvalActions={approvalHistoryData?.data?.actions}
            approvalHistoryLoading={approvalHistoryData === undefined}
            canApprove={canApprove}
            canReject={canReject}
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
            onApprove={() => approveMutation.mutate()}
            onReject={() => setRejectDialogOpen(true)}
          />
        </>
      )}

      {tab === 'registrations' && (
        <EventDetailRegistrations
          eventId={eventId}
          canViewRegistrations={canViewRegistrations}
          canManageRegistrations={canManageRegistrations}
        />
      )}

      {tab === 'attendance' && (
        <EventDetailAttendance
          eventId={eventId}
          canViewRegistrations={canViewRegistrations}
        />
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
