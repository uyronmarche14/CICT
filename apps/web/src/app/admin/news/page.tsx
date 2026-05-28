'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
import { MoreHorizontal, Plus, Search, Trash, Edit, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Permission } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { getContentStatusBadge, getFeatureBadge } from '@/utils/badge-helpers';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { appToast } from '@/lib/app-toast';
import { useRouter } from 'next/navigation';

export default function NewsPage() {
  const router = useRouter();
  const {
    hasPermission,
    hasScopedPermission,
    hasAnyScopedPermission,
    canAccessNewsModule,
    getScopedOrganizationIdsForPermissions,
  } = usePermissions();
  const { organizations } = useOrganizations();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NewsStatus>('all');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<'all' | ContentOwnerType>(
    hasPermission(Permission.VIEW_NEWS) ? 'all' : ContentOwnerType.ORGANIZATION
  );
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not_featured'>('all');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
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
  const queryClient = useQueryClient();

  const { data: newsData, isLoading } = useQuery<{ news: News[]; pagination: { pages: number } }>({
    queryKey: ['admin', 'news', page, search, statusFilter, categoryFilter, featuredFilter, ownerTypeFilter, organizationFilter],
    queryFn: async () => {
      const response = await api.get('/news', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured' ? 'true' : 'false',
          ownerType: ownerTypeFilter === 'all' ? undefined : ownerTypeFilter,
          organizationId: organizationFilter === 'all' ? undefined : organizationFilter,
        },
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData,
  });

  const news = newsData?.news ?? [];
  const totalPages = newsData?.pagination?.pages ?? 1;
  const invalidateNews = () => queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });

  const availableOrganizations = canViewAllNews
    ? organizations
    : organizations.filter((organization) => scopedOrganizationIds.includes(organization.id));

  useEffect(() => { setPage(1); }, [categoryFilter, featuredFilter, search, statusFilter, ownerTypeFilter, organizationFilter]);

  const canActOnNews = (item: News, permission: Permission) =>
    hasPermission(permission) ||
    (item.ownerType === ContentOwnerType.ORGANIZATION &&
      !!item.organizationId &&
      hasScopedPermission(item.organizationId, permission));

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

  const filteredNews = news;

  const handleCreate = () => {
    setSelectedNews(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: News) => {
    setSelectedNews(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({
      onConfirm: async () => {
        try {
          await api.delete(`/news/${id}`);
          invalidateNews();
          appToast.success('News Deleted', 'The news article has been removed.');
        } catch {
          appToast.error('Deletion Failed', 'Could not delete the news article.');
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
      const item = news.find((n) => n._id === id);
      setRejectTarget(item ? { id, title: item.title } : { id, title: '' });
      setRejectDialogOpen(true);
      return;
    }

    try {
      await api.patch(`/news/${id}/${action}`);
      invalidateNews();
    } catch (error) {
      console.error(`Failed to ${action} news:`, error);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await api.patch(`/news/${rejectTarget.id}/reject`, { reason });
      invalidateNews();
      setRejectTarget(null);
    } catch (error) {
      console.error('Failed to reject news:', error);
    }
  };

  const getStatusBadge = (status: NewsStatus) => getContentStatusBadge(status);

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
            <div className="flex items-center gap-1.5 flex-wrap">
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
                <Select
                  value={categoryFilter}
                  onValueChange={(value: string) => setCategoryFilter(value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="news">news</SelectItem>
                    <SelectItem value="feature">feature</SelectItem>
                    <SelectItem value="opinion">opinion</SelectItem>
                    <SelectItem value="announcement">announcement</SelectItem>
                    <SelectItem value="event">event</SelectItem>
                    <SelectItem value="general">general</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={featuredFilter}
                  onValueChange={(value: 'all' | 'featured' | 'not_featured') => setFeaturedFilter(value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="not_featured">Not Featured</SelectItem>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No news articles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNews.map((item) => (
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
                      <TableCell>{item.category ? <Badge>{item.category}</Badge> : '—'}</TableCell>
                      <TableCell>
                        {item.featured ? getFeatureBadge(true) : '—'}
                      </TableCell>
                      <TableCell>
                        {item.authorDisplayName
                          ? item.authorDisplayName.length > 20
                            ? item.authorDisplayName.slice(0, 20) + '…'
                            : item.authorDisplayName
                          : '—'}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/news/${item._id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
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
        onSuccess={invalidateNews}
      />
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete News"
        message="Are you sure you want to delete this news article?"
        confirmLabel="Delete"
        onConfirm={deleteConfirm?.onConfirm ?? (() => {})}
      />
      <RejectionReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        title="Reject News"
        itemTitle={rejectTarget?.title}
      />
    </div>
  );
}
