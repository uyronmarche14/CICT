'use client';

import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          Process templates and workflow instances will live here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 6 Scaffold</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The process module backend data model is planned as a template-and-instance workflow system.
          The visual ReactFlow builder is intentionally scaffolded separately so the current CMS can stay
          stable while the workflow foundation is added in controlled phases.
        </CardContent>
      </Card>
    </div>
  );
}
