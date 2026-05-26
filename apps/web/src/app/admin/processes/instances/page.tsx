'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { processAPI, ProcessInstance } from '@/lib/api/process';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PlayCircle, Eye, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  archived: 'destructive',
};

export default function ProcessInstancesPage() {
  const { canAccessProcessesModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessProcessesModule());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['process-instances', page, search, statusFilter],
    queryFn: () =>
      processAPI.getInstances({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter as ProcessInstance['status'] : undefined,
      }),
  });

  if (!shouldRender) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/processes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Process Instances</h1>
            <p className="text-muted-foreground">View and manage live process workflow instances.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instances..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="max-w-sm"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.data?.instances?.length ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-3">
              <PlayCircle className="h-12 w-12 opacity-30" />
              <p>No process instances found.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Linked Content</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.instances.map((instance: ProcessInstance) => (
                    <TableRow key={instance._id}>
                      <TableCell className="font-medium">{instance.title}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[instance.status] || 'secondary'}>
                          {instance.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {typeof instance.templateId === 'object'
                          ? instance.templateId?.title
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {instance.linkedContentType ? (
                          <Badge variant="outline">
                            {instance.linkedContentType}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(instance.updatedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/processes/instances/${instance._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.data.pagination && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.data.pagination.page} of {data.data.pagination.pages} ({data.data.pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      disabled={page >= (data.data.pagination.pages || 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
