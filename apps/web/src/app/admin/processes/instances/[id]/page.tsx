'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { processAPI } from '@/lib/api/process';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Loader2 } from 'lucide-react';
import { ProcessFlowExecutor } from '@/components/admin/process-flow/ProcessFlowExecutor';

export default function ProcessInstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canAccessProcessesModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessProcessesModule());

  const { data, isLoading } = useQuery({
    queryKey: ['process-instance', id],
    queryFn: () => processAPI.getInstance(id),
    enabled: !!id,
  });

  const instance = data?.data?.instance;

  if (!shouldRender) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Instance not found.
      </div>
    );
  }

  return (
    <ProcessFlowExecutor
      instance={instance}
      instanceId={id}
    />
  );
}
