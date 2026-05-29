'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListChecks, Plus, Loader2, Trash2, CheckCircle2, Circle, Clock, Pencil, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgTasksAPI } from '@/lib/api/org-tasks';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskForm } from '@/components/admin/TaskForm';
import { format } from 'date-fns';

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'border-l-muted-foreground' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'border-l-blue-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'border-l-green-500' },
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function OrgTasksPage() {
  const params = useParams();
  const orgId = params.id as string;
  const { canManageOrgTasks } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgTasks(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<{ _id: string; title: string; description?: string; priority: string; dueDate?: string } | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: queryKeys.orgTasks.all(orgId),
    queryFn: () => orgTasksAPI.list(orgId),
    enabled: !!orgId,
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => orgTasksAPI.delete(orgId, taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orgTasks.all(orgId) }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      orgTasksAPI.updateStatus(orgId, taskId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orgTasks.all(orgId) }),
  });

  if (!shouldRender) return null;

  const columns = (['todo', 'in_progress', 'done'] as const).map((status) => {
    const config = statusConfig[status];
    const items = tasks.filter((t) => t.status === status);
    return { ...config, status, items };
  });

  return (
    <OrgPageLayout
      title="Tasks"
      icon={ListChecks}
      description="Track and manage organizational tasks and assignments."
      loading={orgLoading}
      action={
        <Button size="sm" onClick={() => { setEditingTask(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />New Task
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground">No tasks yet. Create your first task to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <col.icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm text-muted-foreground">{col.label}</h3>
                <span className="text-xs text-muted-foreground">({col.items.length})</span>
              </div>
              <div className="space-y-2">
                {col.items.map((task) => (
                  <Card key={task._id} className={`border-l-2 ${col.color}`}>
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingTask(task); setShowForm(true); }}>
                            <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMutation.mutate(task._id)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 px-4">
                      {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority] || ''}`}>
                          {task.priority}
                        </Badge>
                        {task.category && <Badge variant="secondary" className="text-[10px] px-1.5">{task.category}</Badge>}
                        {task.dueDate && (
                          <span className="text-[10px] text-muted-foreground">Due {format(new Date(task.dueDate), 'MMM d')}</span>
                        )}
                        {task.checklist && task.checklist.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {task.checklist.filter((c) => c.completed).length}/{task.checklist.length} done
                          </span>
                        )}
                        {task.assigneeIds?.length ? (
                          <span className="text-[10px] text-muted-foreground">{task.assigneeIds.length} assignee(s)</span>
                        ) : null}
                      </div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      )}
                      {/* Status transition buttons */}
                      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/30">
                        {task.status === 'todo' && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700"
                            onClick={() => updateStatusMutation.mutate({ taskId: task._id, status: 'in_progress' })}>
                            <ArrowRight className="h-3 w-3" /> Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground"
                              onClick={() => updateStatusMutation.mutate({ taskId: task._id, status: 'todo' })}>
                              <ArrowLeft className="h-3 w-3" /> Back
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-green-600 hover:text-green-700"
                              onClick={() => updateStatusMutation.mutate({ taskId: task._id, status: 'done' })}>
                              <Check className="h-3 w-3" /> Complete
                            </Button>
                          </>
                        )}
                        {task.status === 'done' && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground"
                            onClick={() => updateStatusMutation.mutate({ taskId: task._id, status: 'in_progress' })}>
                            <ArrowLeft className="h-3 w-3" /> Reopen
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm
        orgId={orgId}
        open={showForm}
        onOpenChange={setShowForm}
        item={editingTask}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.orgTasks.all(orgId) })}
      />
    </OrgPageLayout>
  );
}
