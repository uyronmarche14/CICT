'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Permission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Plus } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import AdminOrganizationForm from '@/components/organizations/AdminOrganizationForm';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { useAdminOrganizations } from '@/hooks/useOrganizations';

export default function AdminOrganizationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const {
    canAccessOrganizationsModule,
    canCreateOrganization,
    hasPermission,
    getScopedOrganizationIds,
  } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessOrganizationsModule());
  const { organizations, loading, error, refresh } = useAdminOrganizations();
  const canViewAllOrganizations = hasPermission(Permission.VIEW_ORGANIZATION);
  const scopedOrganizationIds = getScopedOrganizationIds();

  const visibleOrganizations = useMemo(
    () =>
      canViewAllOrganizations
        ? organizations
        : organizations.filter((organization) => scopedOrganizationIds.includes(organization.id)),
    [canViewAllOrganizations, organizations, scopedOrganizationIds]
  );

  if (loading) {
     return (
        <div className="flex h-[50vh] w-full items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
     );
  }

  if (error) {
     return (
        <div className="p-4 text-center text-red-500">
           {error}
           <Button variant="outline" onClick={refresh} className="ml-4">Retry</Button>
        </div>
     );
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
         {canCreateOrganization() ? (
           <Button onClick={() => setIsCreateOpen(true)}>
             <Plus className="mr-2 h-4 w-4" /> Add Organization
           </Button>
         ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleOrganizations.map((org) => (
           <Card key={org.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-32 bg-muted">
                 <CldImage
                    src={org.banner}
                    alt={org.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                 />
                 <div className="absolute inset-0 bg-black/20" />
                 <div className="absolute -bottom-6 left-6 h-12 w-12 rounded-lg border-2 border-background overflow-hidden bg-background">
                    <CldImage
                       src={org.logo}
                       alt={org.name}
                       fill
                       className="object-cover"
                       sizes="48px"
                    />
                 </div>
              </div>
              <CardHeader className="pt-8">
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{org.fullName}</CardTitle>
                        <p className="text-sm font-medium text-muted-foreground">{org.name}</p>
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {org.description}
                 </p>
                 <Button asChild className="w-full gap-2">
                    <Link href={`/admin/organizations/${org.id}`}>
                       Manage Organization
                       <ArrowRight className="w-4 h-4" />
                    </Link>
                 </Button>
              </CardContent>
           </Card>
        ))}
      </div>

      {!loading && visibleOrganizations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No organizations are available in your current admin scope yet.
          </CardContent>
        </Card>
      ) : null}

      {isCreateOpen ? (
        <AdminOrganizationForm
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            refresh();
            setIsCreateOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
