'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processAPI } from '@/lib/api/process';
import type { ProcessNode, ProcessEdge, NodeAssignment } from '@/lib/api/process';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { appToast } from '@/lib/app-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Workflow, PlayCircle } from 'lucide-react';
import { ProcessFlowCanvas } from '@/components/admin/process-flow/ProcessFlowCanvas';

export default function ProcessTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canAccessProcessesModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessProcessesModule());
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['process-template', id],
    queryFn: () => processAPI.getTemplate(id),
    enabled: !!id,
  });

  const template = data?.data?.template;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [processType, setProcessType] = useState('');
  const [organizationScope, setOrganizationScope] = useState('');
  const [nodes, setNodes] = useState<ProcessNode[]>([]);
  const [edges, setEdges] = useState<ProcessEdge[]>([]);
  const [assignments, setAssignments] = useState<NodeAssignment[]>([]);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description || '');
      setProcessType(template.processType);
      setOrganizationScope(template.organizationScope || '');
      setNodes(template.nodes || []);
      setEdges(template.edges || []);
      setAssignments(template.nodeAssignments || []);
    }
  }, [template]);

  const handleFlowChange = useCallback((
    updatedNodes: ProcessNode[],
    updatedEdges: ProcessEdge[],
    updatedAssignments: NodeAssignment[],
  ) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setAssignments(updatedAssignments);
  }, []);

  const updateMutation = useMutation({
    mutationFn: () =>
      processAPI.updateTemplate(id, {
        title,
        description: description || undefined,
        processType,
        organizationScope: organizationScope || null,
        nodes,
        edges,
        nodeAssignments: assignments,
      }),
    onSuccess: () => {
      appToast.success('Template saved');
      queryClient.invalidateQueries({ queryKey: ['process-template', id] });
    },
    onError: () => {
      appToast.error('Failed to save template');
    },
  });

  const createInstanceMutation = useMutation({
    mutationFn: () => processAPI.createInstance({ templateId: id, title: `Run: ${title}` }),
    onSuccess: (data) => {
      appToast.success('Instance created');
      router.push(`/admin/processes/instances/${data.data.instance._id}`);
    },
    onError: () => {
      appToast.error('Failed to create instance');
    },
  });

  if (!shouldRender) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Template not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-between shrink-0 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/admin/processes/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3 min-w-0">
            <Workflow className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight truncate">{template.title}</h1>
                <Badge variant={template.isActive ? 'default' : 'secondary'} className="shrink-0 text-[10px] h-5">
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                v{template.version} &middot; {template.processType}
                {template.organizationScope && ` · ${template.organizationScope}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-2">
            <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{edges.length} edge{edges.length !== 1 ? 's' : ''}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{assignments.length} assignee{assignments.length !== 1 ? 's' : ''}</span>
          </div>
          <Button
            size="sm"
            variant="default"
            className="h-8 text-xs"
            onClick={() => createInstanceMutation.mutate()}
            disabled={createInstanceMutation.isPending}
          >
            {createInstanceMutation.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            <PlayCircle className="mr-1 h-3 w-3" />
            Launch
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            <Save className="mr-1 h-3 w-3" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <ProcessFlowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          initialAssignments={assignments}
          onChange={handleFlowChange}
        />
      </div>
    </div>
  );
}
