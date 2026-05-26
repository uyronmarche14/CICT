'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { processAPI } from '@/lib/api/process';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { appToast } from '@/lib/app-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewProcessTemplatePage() {
  const { canAccessProcessesModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessProcessesModule());
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [processType, setProcessType] = useState('');
  const [organizationScope, setOrganizationScope] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      processAPI.createTemplate({
        title,
        description: description || undefined,
        processType,
        organizationScope: organizationScope || null,
      }),
    onSuccess: (data) => {
      appToast.success('Template created successfully');
      router.push(`/admin/processes/templates/${data.data.template._id}`);
    },
    onError: () => {
      appToast.error('Failed to create template');
    },
  });

  if (!shouldRender) return null;

  const isValid = title.trim().length >= 2 && processType.trim().length > 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/processes/templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Process Template</h1>
          <p className="text-muted-foreground">
            Define a reusable workflow template. Nodes and edges can be added after creation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Event Approval Workflow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="processType">Process Type *</Label>
            <Input
              id="processType"
              value={processType}
              onChange={(e) => setProcessType(e.target.value)}
              placeholder="e.g., approval, review, onboarding"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationScope">Organization Scope (optional)</Label>
            <Input
              id="organizationScope"
              value={organizationScope}
              onChange={(e) => setOrganizationScope(e.target.value)}
              placeholder="e.g., cict"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!isValid || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Template
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/processes/templates">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
