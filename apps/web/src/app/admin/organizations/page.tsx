'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Permission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Plus } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import AdminOrganizationForm from '@/components/organizations/AdminOrganizationForm';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { useAdminOrganizations } from '@/hooks/useOrganizations';

const orgTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'special_interest', label: 'Special Interest' },
  { value: 'other', label: 'Other' },
];

export default function AdminOrganizationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orgTypeFilter, setOrgTypeFilter] = useState('');
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
    () => {
      const filtered = canViewAllOrganizations
        ? organizations
        : organizations.filter((organization) => scopedOrganizationIds.includes(organization.id));
      if (!orgTypeFilter) return filtered;
      return filtered.filter((org) => org.organizationType === orgTypeFilter);
    },
    [canViewAllOrganizations, organizations, scopedOrganizationIds, orgTypeFilter]
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
           <Button variant="outline" onClick={() => refresh()} className="ml-4">Retry</Button>
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

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Type:</label>
        <select
          value={orgTypeFilter}
          onChange={(e) => setOrgTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {orgTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
                 <div className="flex flex-wrap items-center gap-2 mb-3">
                   {org.organizationType && (
                     <Badge variant="secondary" className="capitalize text-xs">
                       {org.organizationType.replace(/_/g, ' ')}
                     </Badge>
                   )}
                   {org.isActive !== undefined && (
                     <Badge variant={org.isActive ? 'default' : 'destructive'} className="text-xs">
                       {org.isActive ? 'Active' : 'Inactive'}
                     </Badge>
                   )}
                 </div>
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
