'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { processAPI, ProcessTemplate } from '@/lib/api/process';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, Eye, Search, FileText, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { appToast } from '@/lib/app-toast';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProcessTemplatesPage() {
  const { canAccessProcessesModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessProcessesModule());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['process-templates', page, search],
    queryFn: () => processAPI.getTemplates({ page, limit: 10, search: search || undefined }),
  });

  const handleDelete = (id: string) => {
    setDeleteConfirm({
      onConfirm: async () => {
        try {
          await processAPI.deleteTemplate(id);
          appToast.success('Template deactivated successfully');
          queryClient.invalidateQueries({ queryKey: ['process-templates'] });
        } catch {
          appToast.error('Failed to deactivate template');
        }
        setDeleteConfirm(null);
      },
    });
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Process Templates</h1>
            <p className="text-muted-foreground">Create and manage reusable process workflow templates.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/processes/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !data?.data?.templates?.length ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-3">
              <FileText className="h-12 w-12 opacity-30" />
              <p>No process templates found.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/processes/templates/new">
                  <Plus className="mr-2 h-4 w-4" /> Create your first template
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.templates.map((template: ProcessTemplate) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">{template.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.processType}</Badge>
                      </TableCell>
                      <TableCell>v{template.version}</TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/processes/templates/${template._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/processes/templates/${template._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {template.isActive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(template._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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

      {deleteConfirm && (
        <ConfirmDialog
          open
          onOpenChange={() => setDeleteConfirm(null)}
          onConfirm={deleteConfirm.onConfirm}
          title="Deactivate Template"
          message="Are you sure you want to deactivate this template? It will no longer be available for creating new instances."
        />
      )}
    </div>
  );
}
