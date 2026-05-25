'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Loader2, ArrowLeft, Edit, AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CldImage } from 'next-cloudinary';
import AdminMemberManager from '@/components/organizations/AdminMemberManager';
import AdminOrganizationForm from '@/components/organizations/AdminOrganizationForm';
import OrganizationMembershipsTab from '@/components/organizations/OrganizationMembershipsTab';
import OrganizationContentPreview from '@/components/organizations/OrganizationContentPreview';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { organizationService } from '@/services/organizationService';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import type { OrganizationAdminAssignment } from '@/types';

export default function AdminOrganizationManagePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const {
    canAccessOrganization,
    canDeleteOrganization,
    canManageOrganizationMembers,
    canUpdateOrganization,
  } = usePermissions();
  const { shouldRender } = useAdminPageAccess(Boolean(orgId) && canAccessOrganization(orgId));
  
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [resolvedAdminAssignments, setResolvedAdminAssignments] = useState<
    OrganizationAdminAssignment[]
  >([]);
  const [loadingAdminAssignments, setLoadingAdminAssignments] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);
  const { organization, loading, error, refresh } = useAdminOrganization(orgId);
  const canEditOrganization = organization ? canUpdateOrganization(organization.id) : false;
  const canRemoveOrganization = organization ? canDeleteOrganization(organization.id) : false;
  const canManageMembers = organization
    ? canManageOrganizationMembers(organization.id)
    : false;
  const canViewScopedAdmins = organization ? canAccessOrganization(organization.id) : false;
 
  useEffect(() => {
    if (!organization || !canViewScopedAdmins) {
      setResolvedAdminAssignments([]);
      return;
    }

    let cancelled = false;

    const loadAssignments = async () => {
      setLoadingAdminAssignments(true);

      try {
        const assignments = await organizationService.getAdminAssignments(organization.id);
        if (!cancelled) {
          setResolvedAdminAssignments(assignments);
        }
      } catch (assignmentError) {
        console.error('Failed to load organization admin assignments:', assignmentError);
        if (!cancelled) {
          setResolvedAdminAssignments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingAdminAssignments(false);
        }
      }
    };

    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [canViewScopedAdmins, organization]);

  const tabs = useMemo(
    () =>
      [
        canManageMembers ? { value: 'members', label: 'Members' } : null,
        canViewScopedAdmins ? { value: 'memberships', label: 'Memberships' } : null,
        canViewScopedAdmins ? { value: 'admins', label: 'Scoped Admins' } : null,
        { value: 'content', label: 'Public Content' },
        { value: 'mission', label: 'Mission & Vision' },
      ].filter((tab): tab is { value: string; label: string } => tab !== null),
    [canManageMembers, canViewScopedAdmins]
  );
  const defaultTab = tabs[0]?.value ?? 'content';

  if (loading) {
     return (
        <div className="flex h-[50vh] w-full items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
     );
  }

  if (error || !organization) {
     return (
        <div className="space-y-4">
           <Button variant="ghost" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Organizations
           </Button>
           <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                 Failed to load organization. {error || 'Organization not found.'}
              </AlertDescription>
           </Alert>
        </div>
     );
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/organizations')}>
             <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Manage {organization.name}</h1>
          <div className="ml-auto">
             <div className="flex gap-2">
                {canRemoveOrganization ? (
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={async () => {
                      setDeleteConfirm({
                        onConfirm: async () => {
                          try {
                            await organizationService.delete(organization.id);
                            router.push('/admin/organizations');
                          } catch (error) {
                            console.error('Failed to delete organization:', error);
                          }
                          setDeleteConfirm(null);
                        },
                      });
                      return;
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                ) : null}
                {canEditOrganization ? (
                  <Button onClick={() => setIsEditingOrg(true)} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Details
                  </Button>
                ) : null}
             </div>
          </div>
       </div>

       <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          {/* Organization Info Sidebar */}
          <div className="space-y-6">
             <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                 <CldImage
                    src={organization.banner}
                    alt="Banner"
                    fill
                    className="object-cover"
                 />
                 <div className="absolute bottom-4 left-4 h-16 w-16 rounded-lg border-2 border-background overflow-hidden bg-background">
                    <CldImage
                       src={organization.logo}
                       alt="Logo"
                       fill
                       className="object-cover"
                    />
                 </div>
             </div>

              <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <h3 className="font-semibold mb-2">Overview</h3>
                  <dl className="space-y-4 text-sm">
                     <div>
                         <dt className="text-muted-foreground">Full Name</dt>
                         <dd className="font-medium">{organization.fullName}</dd>
                     </div>
                     <div>
                         <dt className="text-muted-foreground">Established</dt>
                         <dd className="font-medium">{organization.established}</dd>
                     </div>
                     <div>
                        <dt className="text-muted-foreground">Description</dt>
                        <dd className="mt-1 line-clamp-4">{organization.description}</dd>
                     </div>
                     {organization.organizationType && (
                       <div>
                         <dt className="text-muted-foreground">Type</dt>
                         <dd className="mt-1">
                           <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize">
                             {organization.organizationType.replace(/_/g, ' ')}
                           </span>
                         </dd>
                       </div>
                     )}
                     {organization.isActive !== undefined && (
                       <div>
                         <dt className="text-muted-foreground">Status</dt>
                         <dd className="mt-1">
                           <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${organization.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                             {organization.isActive ? 'Active' : 'Inactive'}
                           </span>
                         </dd>
                       </div>
                     )}
                     {(organization.email || organization.phone || organization.website) && (
                       <div>
                         <dt className="text-muted-foreground">Contact</dt>
                         <dd className="mt-1 space-y-1">
                           {organization.email && (
                             <a href={`mailto:${organization.email}`} className="block text-primary hover:underline truncate">{organization.email}</a>
                           )}
                           {organization.phone && (
                             <span className="block truncate">{organization.phone}</span>
                           )}
                           {organization.website && (
                             <a href={organization.website} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">{organization.website}</a>
                           )}
                         </dd>
                       </div>
                     )}
                     {(organization.facebookUrl || organization.twitterUrl || organization.instagramUrl || organization.tiktokUrl || organization.linkedinUrl) && (
                       <div>
                         <dt className="text-muted-foreground">Social Media</dt>
                         <dd className="mt-1 space-y-1">
                           {organization.facebookUrl && (
                             <a href={organization.facebookUrl} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">Facebook</a>
                           )}
                           {organization.twitterUrl && (
                             <a href={organization.twitterUrl} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">Twitter</a>
                           )}
                           {organization.instagramUrl && (
                             <a href={organization.instagramUrl} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">Instagram</a>
                           )}
                           {organization.tiktokUrl && (
                             <a href={organization.tiktokUrl} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">TikTok</a>
                           )}
                           {organization.linkedinUrl && (
                             <a href={organization.linkedinUrl} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">LinkedIn</a>
                           )}
                         </dd>
                       </div>
                     )}
                     {(organization.building || organization.room || organization.campus) && (
                       <div>
                         <dt className="text-muted-foreground">Location</dt>
                         <dd className="mt-1 font-medium">
                           {[organization.building, organization.room, organization.campus].filter(Boolean).join(', ')}
                         </dd>
                       </div>
                     )}
                     {(organization.advisorName || organization.advisorEmail) && (
                       <div>
                         <dt className="text-muted-foreground">Advisor</dt>
                         <dd className="mt-1 font-medium">{organization.advisorName}
                           {organization.advisorEmail && (
                             <a href={`mailto:${organization.advisorEmail}`} className="block text-primary hover:underline text-xs truncate">{organization.advisorEmail}</a>
                           )}
                         </dd>
                       </div>
                     )}
                     {(organization.moderatorName || organization.moderatorEmail) && (
                       <div>
                         <dt className="text-muted-foreground">Moderator</dt>
                         <dd className="mt-1 font-medium">{organization.moderatorName}
                           {organization.moderatorEmail && (
                             <a href={`mailto:${organization.moderatorEmail}`} className="block text-primary hover:underline text-xs truncate">{organization.moderatorEmail}</a>
                           )}
                         </dd>
                       </div>
                     )}
                     {organization.tags && organization.tags.length > 0 && (
                       <div>
                         <dt className="text-muted-foreground">Tags</dt>
                         <dd className="mt-1 flex flex-wrap gap-1">
                           {organization.tags.map((tag) => (
                             <span key={tag} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-muted">
                               {tag}
                             </span>
                           ))}
                         </dd>
                       </div>
                     )}
                     {organization.seoDescription && (
                       <div>
                         <dt className="text-muted-foreground">SEO Description</dt>
                         <dd className="mt-1 line-clamp-3 text-muted-foreground">{organization.seoDescription}</dd>
                       </div>
                     )}
                  </dl>
              </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
             <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList>
                   {tabs.map((tab) => (
                     <TabsTrigger key={tab.value} value={tab.value}>
                       {tab.label}
                     </TabsTrigger>
                   ))}
                </TabsList>
                
                {canManageMembers ? (
                  <TabsContent value="members" className="mt-6">
                     <div className="rounded-xl border bg-card p-6">
                        <AdminMemberManager 
                           orgId={organization.id}
                           members={organization.members}
                           onRefresh={refresh}
                           color={organization.color}
                        />
                     </div>
                  </TabsContent>
                ) : null}

                {canViewScopedAdmins ? (
                  <TabsContent value="memberships" className="mt-6">
                     <div className="rounded-xl border bg-card p-6">
                        <OrganizationMembershipsTab orgId={organization.id} />
                     </div>
                  </TabsContent>
                ) : null}

                {canViewScopedAdmins ? (
                  <TabsContent value="admins" className="mt-6">
                     <div className="rounded-xl border bg-card p-6 space-y-4">
                        <div>
                           <h3 className="font-semibold text-lg">Assigned Organization Admins</h3>
                           <p className="text-sm text-muted-foreground">
                              These scoped assignments can manage content and workflows only inside {organization.name}.
                           </p>
                        </div>
                        {loadingAdminAssignments ? (
                          <div className="flex min-h-[120px] items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : resolvedAdminAssignments.length > 0 ? (
                          <div className="space-y-3">
                            {resolvedAdminAssignments.map((assignment) => (
                              <div key={`${assignment.userId ?? 'assignment'}-${assignment.id}`} className="rounded-lg border p-4">
                                <div className="font-medium">{assignment.userName ?? 'Assigned User'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {assignment.userEmail ?? 'No email available'}
                                </div>
                                <div className="mt-2 text-sm">
                                  Scoped role: <span className="font-medium">{assignment.roleName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No scoped admins are assigned to this organization yet.
                          </p>
                        )}
                     </div>
                  </TabsContent>
                ) : null}

                <TabsContent value="content" className="mt-6">
                   <div className="rounded-xl border bg-card p-6 space-y-4">
                      <div>
                         <h3 className="font-semibold text-lg">Published Organization Content</h3>
                         <p className="text-sm text-muted-foreground">
                            Use this view to confirm that published organization-owned news, announcements, and events are landing in the correct public organization surface.
                         </p>
                      </div>
                      <OrganizationContentPreview
                        organizationId={organization.id}
                        organizationName={organization.name}
                      />
                   </div>
                </TabsContent>

                <TabsContent value="mission" className="mt-6 space-y-6">
                   <div className="rounded-xl border bg-card p-6">
                      <h3 className="font-semibold mb-4 text-lg">Mission</h3>
                      <p className="text-muted-foreground leading-relaxed">
                         {organization.mission}
                      </p>
                   </div>
                   <div className="rounded-xl border bg-card p-6">
                      <h3 className="font-semibold mb-4 text-lg">Vision</h3>
                      <p className="text-muted-foreground leading-relaxed">
                         {organization.vision}
                      </p>
                   </div>
                </TabsContent>
             </Tabs>
          </div>
       </div>

        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
          title="Delete Organization"
          message={`Are you sure you want to delete ${organization?.name ?? 'this organization'}?`}
          confirmLabel="Delete"
          onConfirm={deleteConfirm?.onConfirm ?? (() => {})}
        />
        {isEditingOrg && (
          <AdminOrganizationForm 
             organization={organization}
             onClose={() => setIsEditingOrg(false)}
             onSuccess={() => {
                refresh();
             }}
          />
       )}
    </div>
  );
}
