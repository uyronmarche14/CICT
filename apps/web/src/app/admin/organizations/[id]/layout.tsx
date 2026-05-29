'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import OrgSubNav from '@/components/organizations/OrgSubNav';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrgAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const orgId = params.id as string;

  const { canAccessOrganization } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessOrganization(orgId));
  const { organization, loading } = useAdminOrganization(orgId);

  if (!shouldRender) return null;

  return (
    <div className="space-y-0">
      {/* Breadcrumb */}
      <div className="border-b border-border/40 bg-background px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/organizations">Organizations</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <span className="font-medium text-foreground">
                    {organization?.name ?? orgId}
                  </span>
                )}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Sub-navigation */}
      <OrgSubNav orgId={orgId} className="bg-background px-6" />

      {/* Page content */}
      <div className="py-6">
        {children}
      </div>
    </div>
  );
}
