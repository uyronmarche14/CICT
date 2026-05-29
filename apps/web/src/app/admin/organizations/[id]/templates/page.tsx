'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutTemplate, Plus, Loader2, Palette, ShieldCheck, Folders, Pencil } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgTemplatesAPI } from '@/lib/api/org-templates';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateForm } from '@/components/admin/TemplateForm';
import { appToast } from '@/lib/app-toast';

export default function OrgTemplatesPage() {
  const params = useParams();
  const orgId = params.id as string;
  const { canManageOrgTemplates } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgTemplates());
  const { organization, loading: orgLoading } = useAdminOrganization(orgId);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ _id: string; name: string; description?: string; defaultRoles?: Array<{ name: string; permissions: string[] }>; defaultColorScheme?: { primary: string; secondary: string; accent: string }; defaultStructure?: { committees: string[]; programs: string[] } } | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.orgTemplates.all,
    queryFn: () => orgTemplatesAPI.list(),
  });

  const handleApply = async (templateId: string) => {
    if (!organization) return;
    try {
      await orgTemplatesAPI.apply(templateId, organization._id);
      appToast.success('Applied', `Template applied to ${organization.name}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(orgId) });
    } catch {
      appToast.error('Error', 'Failed to apply template.');
    }
  };

  if (!shouldRender) return null;

  return (
    <OrgPageLayout
      title="Templates"
      icon={LayoutTemplate}
      description="Apply pre-built organizational structure templates."
      loading={orgLoading}
      action={
        <Button size="sm" onClick={() => { setEditingTemplate(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />New Template
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground">No templates available. Create a template to standardize your org structure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template._id}>
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: template.defaultColorScheme?.primary || '#6e29f6' }} />
                    <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingTemplate(template); setShowForm(true); }}>
                      <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </Button>
                    {template.isActive && <Badge variant="outline" className="text-[10px] px-1.5">Active</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 px-4 space-y-3">
                {template.description && <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{template.defaultRoles?.length || 0} roles</span>
                  <span className="flex items-center gap-1"><Folders className="h-3 w-3" />{template.defaultStructure?.committees?.length || 0} committees</span>
                  <span className="flex items-center gap-1"><Palette className="h-3 w-3" />Color scheme</span>
                </div>
                <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => handleApply(template._id)}>
                  Apply to {organization?.name || 'this org'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingTemplate}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.orgTemplates.all })}
      />
    </OrgPageLayout>
  );
}
