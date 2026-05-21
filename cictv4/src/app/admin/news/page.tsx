'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/axios';
import { ContentOwnerType, News, NewsStatus } from '@/types';
import { NewsForm } from '@/components/admin/NewsForm';
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
import { MoreHorizontal, Plus, Search, Trash, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Permission } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';

export default function NewsPage() {
  const {
    hasPermission,
    hasScopedPermission,
    hasAnyScopedPermission,
    canAccessNewsModule,
    getScopedOrganizationIdsForPermissions,
  } = usePermissions();
  const { organizations } = useOrganizations();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NewsStatus>('all');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<'all' | ContentOwnerType>(
    hasPermission(Permission.VIEW_NEWS) ? 'all' : ContentOwnerType.ORGANIZATION
  );
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const { shouldRender } = useAdminPageAccess(canAccessNewsModule());
  const canViewAllNews = hasPermission(Permission.VIEW_NEWS);
  const scopedOrganizationIds = getScopedOrganizationIdsForPermissions([
    Permission.VIEW_NEWS,
    Permission.CREATE_NEWS,
    Permission.EDIT_NEWS,
    Permission.DELETE_NEWS,
    Permission.PUBLISH_NEWS,
    Permission.ARCHIVE_NEWS,
  ]);
  const availableOrganizations = canViewAllNews
    ? organizations
    : organizations.filter((organization) => scopedOrganizationIds.includes(organization.id));

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/news', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter === 'all' ? undefined : statusFilter,
          ownerType: ownerTypeFilter === 'all' ? undefined : ownerTypeFilter,
          organizationId: organizationFilter === 'all' ? undefined : organizationFilter,
        },
      });
      if (response.data.success) {
        setNews(response.data.data.news);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, ownerTypeFilter, organizationFilter]);

  const canActOnNews = (item: News, permission: Permission) =>
    hasPermission(permission) ||
    (item.ownerType === ContentOwnerType.ORGANIZATION &&
      !!item.organizationId &&
      hasScopedPermission(item.organizationId, permission));

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (canViewAllNews) {
      return;
    }

    if (ownerTypeFilter !== ContentOwnerType.ORGANIZATION) {
      setOwnerTypeFilter(ContentOwnerType.ORGANIZATION);
    }
  }, [canViewAllNews, ownerTypeFilter]);

  useEffect(() => {
    if (canViewAllNews) {
      return;
    }

    if (
      organizationFilter !== 'all' &&
      !availableOrganizations.some((organization) => organization.id === organizationFilter)
    ) {
      setOrganizationFilter('all');
    }
  }, [availableOrganizations, canViewAllNews, organizationFilter]);

  if (!shouldRender) {
    return null;
  }

  const handleCreate = () => {
    setSelectedNews(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: News) => {
    setSelectedNews(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const handleWorkflowAction = async (
    id: string,
    action: 'submit' | 'approve' | 'reject' | 'publish' | 'archive'
  ) => {
    try {
      if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason');
        if (!reason?.trim()) {
          return;
        }
        await api.patch(`/news/${id}/reject`, { reason: reason.trim() });
      } else {
        await api.patch(`/news/${id}/${action}`);
      }
      fetchNews();
    } catch (error) {
      console.error(`Failed to ${action} news:`, error);
    }
  };

  const getStatusBadge = (status: NewsStatus) => {
    switch (status) {
      case NewsStatus.PUBLISHED:
        return <Badge className="bg-green-500">Published</Badge>;
      case NewsStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case NewsStatus.PENDING_APPROVAL:
        return <Badge className="bg-amber-500">Pending Approval</Badge>;
      case NewsStatus.APPROVED:
        return <Badge className="bg-blue-600">Approved</Badge>;
      case NewsStatus.REJECTED:
        return <Badge className="bg-red-600">Rejected</Badge>;
      case NewsStatus.ARCHIVED:
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <p className="text-muted-foreground">
            Manage news articles and updates
          </p>
        </div>
        {hasPermission(Permission.CREATE_NEWS) || hasAnyScopedPermission(Permission.CREATE_NEWS) ? (
          <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create News
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All News</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select
                value={ownerTypeFilter}
                onValueChange={(value: 'all' | ContentOwnerType) => setOwnerTypeFilter(value)}
                disabled={!canViewAllNews}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Ownership" />
                </SelectTrigger>
                <SelectContent>
                  {canViewAllNews ? <SelectItem value="all">All ownership</SelectItem> : null}
                  {canViewAllNews ? (
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
                    {canViewAllNews ? 'All organizations' : 'Assigned organizations'}
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No news articles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOwnershipLabel(item)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(item.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              disabled={!canActOnNews(item, Permission.EDIT_NEWS)}
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {item.status === NewsStatus.DRAFT &&
                              canActOnNews(item, Permission.SUBMIT_CONTENT_FOR_APPROVAL) && (
                              <DropdownMenuItem onClick={() => handleWorkflowAction(item._id, 'submit')}>
                                Submit for approval
                              </DropdownMenuItem>
                            )}
                            {item.status === NewsStatus.PENDING_APPROVAL &&
                              hasPermission(Permission.APPROVE_CONTENT) && (
                              <DropdownMenuItem onClick={() => handleWorkflowAction(item._id, 'approve')}>
                                Approve
                              </DropdownMenuItem>
                            )}
                            {item.status === NewsStatus.PENDING_APPROVAL &&
                              hasPermission(Permission.REJECT_CONTENT) && (
                              <DropdownMenuItem onClick={() => handleWorkflowAction(item._id, 'reject')}>
                                Reject
                              </DropdownMenuItem>
                            )}
                            {item.status === NewsStatus.APPROVED && canActOnNews(item, Permission.PUBLISH_NEWS) && (
                              <DropdownMenuItem onClick={() => handleWorkflowAction(item._id, 'publish')}>
                                Publish
                              </DropdownMenuItem>
                            )}
                            {item.status === NewsStatus.PUBLISHED && canActOnNews(item, Permission.ARCHIVE_NEWS) && (
                              <DropdownMenuItem onClick={() => handleWorkflowAction(item._id, 'archive')}>
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              disabled={!canActOnNews(item, Permission.DELETE_NEWS)}
                              className="text-red-600"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
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

      <NewsForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        news={selectedNews}
        onSuccess={fetchNews}
      />
    </div>
  );
}
