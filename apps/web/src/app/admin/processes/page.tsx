'use client';

import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, PlayCircle, Plus, GitBranch } from 'lucide-react';

export default function ProcessesPage() {
  const { canAccessProcessesModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessProcessesModule());

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Process</h1>
        <p className="text-muted-foreground">
          Manage process templates and workflow instances.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Process Templates
            </CardTitle>
            <CardDescription>
              Create and manage reusable workflow templates. Define nodes, edges, and
              approval steps that can be instantiated into live processes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/admin/processes/templates">
                <GitBranch className="mr-2 h-4 w-4" />
                View Templates
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/processes/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Process Instances
            </CardTitle>
            <CardDescription>
              View and manage live process instances. Track progress, add comments,
              complete requirements, and approve steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/admin/processes/instances">
                <PlayCircle className="mr-2 h-4 w-4" />
                View Instances
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
