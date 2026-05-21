'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventAPI, Event } from '@/lib/api/event';
import { EventForm } from '@/components/admin/EventForm';
import { EditEventForm } from '@/components/admin/EditEventForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Edit, MapPin, Users, Eye, CheckCircle } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { ContentOwnerType, Permission } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';

export default function AdminEventsPage() {
  const {
    hasPermission,
    hasScopedPermission,
    hasAnyScopedPermission,
    canAccessEventsModule,
    getScopedOrganizationIdsForPermissions,
  } = usePermissions();
  const { organizations } = useOrganizations();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | Event['status']>('all');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<'all' | ContentOwnerType>(
    hasPermission(Permission.VIEW_EVENT) ? 'all' : ContentOwnerType.ORGANIZATION
  );
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const { shouldRender } = useAdminPageAccess(canAccessEventsModule());
  const canViewAllEvents = hasPermission(Permission.VIEW_EVENT);
  const scopedOrganizationIds = getScopedOrganizationIdsForPermissions([
    Permission.VIEW_EVENT,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.PUBLISH_EVENT,
    Permission.CANCEL_EVENT,
    Permission.COMPLETE_EVENT,
  ]);
  const availableOrganizations = canViewAllEvents
    ? organizations
    : organizations.filter((organization) => scopedOrganizationIds.includes(organization.id));
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'events', ownerTypeFilter, organizationFilter, statusFilter],
    queryFn: () =>
      eventAPI.getAll({
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        ownerType: ownerTypeFilter,
        organizationId: organizationFilter === 'all' ? undefined : organizationFilter,
      }),
  });

  const canActOnEvent = (event: Event, permission: Permission) =>
    hasPermission(permission) ||
    (event.ownerType === ContentOwnerType.ORGANIZATION &&
      !!event.organizationId &&
      hasScopedPermission(event.organizationId, permission));

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        await eventAPI.delete(id);
        toast.success('Event deleted');
        refetch();
    } catch {
        toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handleWorkflowAction = async (
    id: string,
    action: 'submit' | 'approve' | 'reject' | 'publish' | 'cancel' | 'complete'
  ) => {
    try {
      if (action === 'submit') {
        await eventAPI.submit(id);
      } else if (action === 'approve') {
        await eventAPI.approve(id);
      } else if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason');
        if (!reason?.trim()) {
          return;
        }
        await eventAPI.reject(id, { reason: reason.trim() });
      } else if (action === 'publish') {
        await eventAPI.publish(id);
      } else if (action === 'cancel') {
        await eventAPI.cancel(id);
      } else {
        await eventAPI.complete(id);
      }
      const successLabel =
        action === 'submit'
          ? 'submitted for approval'
          : action === 'approve'
            ? 'approved'
            : action === 'reject'
              ? 'rejected'
              : action === 'publish'
                ? 'published'
                : action === 'cancel'
                  ? 'cancelled'
                  : 'completed';
      toast.success(`Event ${successLabel} successfully`);
      refetch();
    } catch {
      toast.error(`Failed to ${action} event`);
    }
  };

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return <Badge>Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending_approval':
        return <Badge className="bg-amber-500">Pending Approval</Badge>;
      case 'approved':
        return <Badge className="bg-blue-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeEvents = data?.data.events || [];

  useEffect(() => {
    if (!canViewAllEvents && ownerTypeFilter !== ContentOwnerType.ORGANIZATION) {
      setOwnerTypeFilter(ContentOwnerType.ORGANIZATION);
    }
  }, [canViewAllEvents, ownerTypeFilter]);

  useEffect(() => {
    if (
      !canViewAllEvents &&
      organizationFilter !== 'all' &&
      !availableOrganizations.some((organization) => organization.id === organizationFilter)
    ) {
      setOrganizationFilter('all');
    }
  }, [availableOrganizations, canViewAllEvents, organizationFilter]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage upcoming and past events
          </p>
        </div>
        {hasPermission(Permission.CREATE_EVENT) || hasAnyScopedPermission(Permission.CREATE_EVENT) ? (
          <EventForm onSuccess={refetch} />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>All Events</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={ownerTypeFilter}
                onValueChange={(value: 'all' | ContentOwnerType) => setOwnerTypeFilter(value)}
                disabled={!canViewAllEvents}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Ownership" />
                </SelectTrigger>
                <SelectContent>
                  {canViewAllEvents ? <SelectItem value="all">All ownership</SelectItem> : null}
                  {canViewAllEvents ? (
                    <SelectItem value={ContentOwnerType.SYSTEM}>System-owned</SelectItem>
                  ) : null}
                  <SelectItem value={ContentOwnerType.ORGANIZATION}>Organization-owned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {canViewAllEvents ? 'All organizations' : 'Assigned organizations'}
                  </SelectItem>
                  {availableOrganizations.map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | Event['status']) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {[
                    'draft',
                    'pending_approval',
                    'approved',
                    'rejected',
                    'published',
                    'cancelled',
                    'completed',
                  ].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
             <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Checked In</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : activeEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        <Link href={`/admin/events/${event._id}`} className="hover:text-primary transition-colors">
                          {event.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col text-sm">
                            <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                            <span className="text-muted-foreground">{format(new Date(event.startDate), 'h:mm a')}</span>
                         </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                          <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {event.location}
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              {event.registeredCount ?? event.attendees.length}
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-muted-foreground" />
                              {event.checkedInCount ?? 0}
                          </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOwnershipLabel(event)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                asChild
                            >
                                <Link href={`/admin/events/${event._id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={!canActOnEvent(event, Permission.EDIT_EVENT)}
                                onClick={() => handleEdit(event)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            {event.status === 'draft' &&
                              canActOnEvent(event, Permission.SUBMIT_CONTENT_FOR_APPROVAL) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWorkflowAction(event._id, 'submit')}
                              >
                                Submit
                              </Button>
                            )}
                            {event.status === 'pending_approval' && hasPermission(Permission.APPROVE_CONTENT) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWorkflowAction(event._id, 'approve')}
                              >
                                Approve
                              </Button>
                            )}
                            {event.status === 'pending_approval' && hasPermission(Permission.REJECT_CONTENT) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWorkflowAction(event._id, 'reject')}
                              >
                                Reject
                              </Button>
                            )}
                            {event.status === 'approved' && canActOnEvent(event, Permission.PUBLISH_EVENT) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWorkflowAction(event._id, 'publish')}
                              >
                                Publish
                              </Button>
                            )}
                            {event.status === 'published' && canActOnEvent(event, Permission.CANCEL_EVENT) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWorkflowAction(event._id, 'cancel')}
                              >
                                Cancel
                              </Button>
                            )}
                            {event.status === 'published' && canActOnEvent(event, Permission.COMPLETE_EVENT) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWorkflowAction(event._id, 'complete')}
                              >
                                Complete
                              </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={!canActOnEvent(event, Permission.DELETE_EVENT)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(event._id)}
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
        </CardContent>
      </Card>

      {editingEvent && (
        <EditEventForm
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          onSuccess={() => {
            refetch();
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}
