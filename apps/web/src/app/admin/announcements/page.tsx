'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Announcement, AnnouncementPriority, ContentOwnerType } from '@/types';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Trash, Edit, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { NewsStatus, Permission } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { getContentStatusBadge, getPriorityBadge as getCentralPriorityBadge } from '@/utils/badge-helpers';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { appToast } from '@/lib/app-toast';
import { useRouter } from 'next/navigation';
import {
  adminContentAPI,
  canActOnContent,
  getVisibleWorkflowActions,
  getWorkflowActionLabel,
  useAdminAnnouncementsList,
  type ContentWorkflowAction,
} from '@/features/admin-content';

export default function AnnouncementsPage() {
  const router = useRouter();
  const {
    hasPermission,
    hasScopedPermission,
    hasAnyScopedPermission,
    canAccessAnnouncementsModule,
    getScopedOrganizationIdsForPermissions,
  } = usePermissions();
  const { organizations } = useOrganizations();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NewsStatus>('all');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<'all' | ContentOwnerType>(
    hasPermission(Permission.VIEW_ANNOUNCEMENT) ? 'all' : ContentOwnerType.ORGANIZATION
  );
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
  const { shouldRender } = useAdminPageAccess(canAccessAnnouncementsModule());
  const canViewAllAnnouncements = hasPermission(Permission.VIEW_ANNOUNCEMENT);
  const scopedOrganizationIds = getScopedOrganizationIdsForPermissions([
    Permission.VIEW_ANNOUNCEMENT,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.EDIT_ANNOUNCEMENT,
    Permission.DELETE_ANNOUNCEMENT,
    Permission.PUBLISH_ANNOUNCEMENT,
    Permission.ARCHIVE_ANNOUNCEMENT,
  ]);
  const availableOrganizations = canViewAllAnnouncements
    ? organizations
    : organizations.filter((organization) => scopedOrganizationIds.includes(organization.id));

  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');
  const [ctaFilter, setCtaFilter] = useState<'all' | 'has_cta' | 'no_cta'>('all');

  const queryClient = useQueryClient();

  const { data: announcementsData, isLoading } = useAdminAnnouncementsList({
    page,
    limit: 10,
    search,
    status: statusFilter,
    subtype: subtypeFilter,
    ctaFilter,
    ownerType: ownerTypeFilter,
    organizationId: organizationFilter,
  });

  const announcements = announcementsData?.announcements ?? [];
  const totalPages = announcementsData?.pagination?.pages ?? 1;
  const invalidateAnnouncements = () => queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
  const filteredAnnouncements = announcements;

  useEffect(() => { setPage(1); }, [subtypeFilter, ctaFilter, search, statusFilter, ownerTypeFilter, organizationFilter]);

  const canActOnAnnouncement = (item: Announcement, permission: Permission) =>
    canActOnContent(item, permission, { hasPermission, hasScopedPermission });

  useEffect(() => {
    if (canViewAllAnnouncements) {
      return;
    }

    if (ownerTypeFilter !== ContentOwnerType.ORGANIZATION) {
      setOwnerTypeFilter(ContentOwnerType.ORGANIZATION);
    }
  }, [canViewAllAnnouncements, ownerTypeFilter]);

  useEffect(() => {
    if (canViewAllAnnouncements) {
      return;
    }

    if (
      organizationFilter !== 'all' &&
      !availableOrganizations.some((organization) => organization.id === organizationFilter)
    ) {
      setOrganizationFilter('all');
    }
  }, [availableOrganizations, canViewAllAnnouncements, organizationFilter]);

  if (!shouldRender) {
    return null;
  }

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Announcement) => {
    setSelectedAnnouncement(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({
      onConfirm: async () => {
        try {
          await adminContentAPI.announcements.delete(id);
          invalidateAnnouncements();
          appToast.success('Announcement Deleted', 'The announcement has been removed.');
        } catch {
          appToast.error('Deletion Failed', 'Could not delete the announcement.');
        }
        setDeleteConfirm(null);
      },
    });
  };

  const handleWorkflowAction = async (
    id: string,
    action: 'submit' | 'approve' | 'reject' | 'publish' | 'archive'
  ) => {
    if (action === 'reject') {
      const item = announcements.find((a) => a._id === id);
      setRejectTarget(item ? { id, title: item.title } : { id, title: '' });
      setRejectDialogOpen(true);
      return;
    }

    try {
      await adminContentAPI.announcements.workflow(id, action);
      invalidateAnnouncements();
    } catch (error) {
      console.error(`Failed to ${action} announcement:`, error);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await adminContentAPI.announcements.workflow(rejectTarget.id, 'reject', reason);
      invalidateAnnouncements();
      setRejectTarget(null);
    } catch (error) {
      console.error('Failed to reject announcement:', error);
    }
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => getCentralPriorityBadge(priority);

  const getStatusBadge = (status?: NewsStatus) => getContentStatusBadge(status ?? 'unknown');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage system announcements
          </p>
        </div>
        {hasPermission(Permission.CREATE_ANNOUNCEMENT) ||
        hasAnyScopedPermission(Permission.CREATE_ANNOUNCEMENT) ? (
          <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Announcement
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Announcements</CardTitle>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select
                value={ownerTypeFilter}
                onValueChange={(value: 'all' | ContentOwnerType) => setOwnerTypeFilter(value)}
                disabled={!canViewAllAnnouncements}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Ownership" />
                </SelectTrigger>
                <SelectContent>
                  {canViewAllAnnouncements ? (
                    <SelectItem value="all">All ownership</SelectItem>
                  ) : null}
                  {canViewAllAnnouncements ? (
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
                    {canViewAllAnnouncements ? 'All organizations' : 'Assigned organizations'}
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
                onValueChange={(value: 'all' | NewsStatus) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(NewsStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subtypeFilter} onValueChange={(value: string) => setSubtypeFilter(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Subtype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subtypes</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="recognition">Recognition</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ctaFilter} onValueChange={(value: 'all' | 'has_cta' | 'no_cta') => setCtaFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="CTA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="has_cta">Has CTA</SelectItem>
                  <SelectItem value="no_cta">No CTA</SelectItem>
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
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Subtype</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No announcements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnnouncements.map((item) => {
                    const workflowActions = getVisibleWorkflowActions('announcement', item, {
                      hasPermission,
                      hasScopedPermission,
                    });
                    return (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOwnershipLabel(item)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.targetAudience.map((audience, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.expiresAt 
                          ? format(new Date(item.expiresAt), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {item.subtype ? <Badge variant="outline">{item.subtype}</Badge> : '—'}
                      </TableCell>
                      <TableCell>
                        {item.contactName ? `${item.contactName.substring(0, 20)}${item.contactName.length > 20 ? '...' : ''}` : '—'}
                      </TableCell>
                      <TableCell>
                        {item.ctaLabel ? <Badge>{item.ctaLabel}</Badge> : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/announcements/${item._id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!canActOnAnnouncement(item, Permission.EDIT_ANNOUNCEMENT)}
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {workflowActions
                              .filter((action): action is Exclude<ContentWorkflowAction, 'delete'> => action !== 'delete')
                              .map((action) => (
                                <DropdownMenuItem key={action} onClick={() => handleWorkflowAction(item._id, action)}>
                                  {getWorkflowActionLabel(action)}
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuItem
                              disabled={!workflowActions.includes('delete')}
                              className="text-red-600"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnnouncementForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        announcement={selectedAnnouncement}
        onSuccess={invalidateAnnouncements}
      />
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?"
        confirmLabel="Delete"
        onConfirm={deleteConfirm?.onConfirm ?? (() => {})}
      />
      <RejectionReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        title="Reject Announcement"
        itemTitle={rejectTarget?.title}
      />
    </div>
  );
}
