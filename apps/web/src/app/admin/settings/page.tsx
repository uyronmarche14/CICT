'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Save, AlertCircle, Settings as SettingsIcon,
  Shield, Upload, Bell, GraduationCap, Wrench, Flag,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { settingsAPI } from '@/lib/api/settings';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { appToast } from '@/lib/app-toast';

const TABS = [
  { value: 'general', label: 'General', icon: SettingsIcon },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
  { value: 'features', label: 'Features', icon: Flag },
  { value: 'academic', label: 'Academic', icon: GraduationCap },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'uploads', label: 'Uploads', icon: Upload },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'referenceData', label: 'Reference Data', icon: ListChecks },
] as const;

export default function AdminSettingsPage() {
  const { canManageSettings } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageSettings());
  const [forms, setForms] = useState<Record<string, Record<string, unknown>>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: settingsAPI.getAll,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (data) {
      const initial: Record<string, Record<string, unknown>> = {};
      for (const [key, val] of Object.entries(data)) {
        initial[key] = { ...(val as Record<string, unknown>) };
      }
      setForms(initial);
    }
  }, [data]);

  const handleChange = useCallback((group: string, field: string, value: unknown) => {
    setForms((prev) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }));
    setDirty((prev) => ({ ...prev, [group]: true }));
  }, []);

  const handleSave = useCallback(async (group: string) => {
    setSaving((prev) => ({ ...prev, [group]: true }));
    try {
      await settingsAPI.updateGroup(group, forms[group] || {});
      appToast.success('Saved', `${group} settings updated successfully`);
      setDirty((prev) => ({ ...prev, [group]: false }));
      refetch();
    } catch {
      appToast.error('Failed', `Could not save ${group} settings`);
    } finally {
      setSaving((prev) => ({ ...prev, [group]: false }));
    }
  }, [forms, refetch]);

  if (!shouldRender) return null;
  if (!canManageSettings()) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <AlertCircle className="w-5 h-5" />
        You do not have permission to manage settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system-wide configuration</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-8 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Failed to load settings.
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {dirty[tab.value] && (
                  <Badge variant="default" className="ml-1 h-2 w-2 rounded-full p-0" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <SettingsCard
              title="General Settings"
              description="Site name, branding, and contact information"
              group="general"
              fields={[
                { key: 'siteName', label: 'Site Name', type: 'text' },
                { key: 'siteDescription', label: 'Site Description', type: 'text' },
                { key: 'contactEmail', label: 'Contact Email', type: 'email' },
                { key: 'footerText', label: 'Footer Text', type: 'textarea' },
              ]}
              values={forms.general || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.general}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <SettingsCard
              title="Maintenance Mode"
              description="Put the site in maintenance mode. Only admins can access the system while enabled."
              group="maintenance"
              fields={[
                { key: 'enabled', label: 'Maintenance Mode', type: 'boolean' },
                { key: 'message', label: 'Maintenance Message', type: 'textarea' },
              ]}
              values={forms.maintenance || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.maintenance}
            />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <SettingsCard
              title="Feature Flags"
              description="Enable or disable system features"
              group="features"
              fields={[
                { key: 'selfRegistration', label: 'Self Registration', type: 'boolean', hint: 'Allow students to register for events' },
                { key: 'qrScanning', label: 'QR Scanning', type: 'boolean', hint: 'Allow QR code check-in for events' },
                { key: 'pushNotifications', label: 'Push Notifications', type: 'boolean', hint: 'Send push notifications to students' },
                { key: 'orgApplications', label: 'Org Applications', type: 'boolean', hint: 'Allow students to apply to organizations' },
              ]}
              values={forms.features || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.features}
            />
          </TabsContent>

          <TabsContent value="academic" className="mt-6">
            <SettingsCard
              title="Academic Settings"
              description="Current semester, academic year, and enrollment periods"
              group="academic"
              fields={[
                { key: 'currentSemester', label: 'Current Semester', type: 'text', hint: 'e.g. 1st Semester' },
                { key: 'currentAcademicYear', label: 'Academic Year', type: 'text', hint: 'e.g. 2025-2026' },
                { key: 'enrollmentStart', label: 'Enrollment Start', type: 'date' },
                { key: 'enrollmentEnd', label: 'Enrollment End', type: 'date' },
              ]}
              values={forms.academic || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.academic}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SettingsCard
              title="Security Settings"
              description="Password policy and session timeouts"
              group="security"
              fields={[
                { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number' },
                { key: 'studentSessionMinutes', label: 'Student Session (minutes)', type: 'number', hint: 'JWT expiration for student tokens' },
                { key: 'adminSessionMinutes', label: 'Admin Session (minutes)', type: 'number', hint: 'JWT expiration for admin tokens' },
              ]}
              values={forms.security || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.security}
            />
          </TabsContent>

          <TabsContent value="uploads" className="mt-6">
            <SettingsCard
              title="Upload Settings"
              description="File upload limits and Cloudinary configuration"
              group="uploads"
              fields={[
                { key: 'maxFileSizeMb', label: 'Max File Size (MB)', type: 'number' },
                { key: 'cloudinaryFolder', label: 'Cloudinary Folder', type: 'text' },
                { key: 'allowedTypes', label: 'Allowed File Types', type: 'textarea', hint: 'Comma-separated MIME types' },
              ]}
              values={forms.uploads || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.uploads}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <SettingsCard
              title="Notification Settings"
              description="Enable or disable notification channels"
              group="notifications"
              fields={[
                { key: 'emailEnabled', label: 'Email Notifications', type: 'boolean' },
                { key: 'pushEnabled', label: 'Push Notifications', type: 'boolean' },
                { key: 'smsEnabled', label: 'SMS Notifications', type: 'boolean' },
              ]}
              values={forms.notifications || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.notifications}
            />
          </TabsContent>

          <TabsContent value="referenceData" className="mt-6">
            <SettingsCard
              title="Reference Data"
              description="Reusable controlled values for searchable dropdowns and feature forms. Use one item per line."
              group="referenceData"
              fields={[
                { key: 'taskCategories', label: 'Task Categories', type: 'textarea' },
                { key: 'budgetCategories', label: 'Budget Categories', type: 'textarea' },
                { key: 'resourceTypes', label: 'Resource Types', type: 'textarea' },
                { key: 'partnershipTypes', label: 'Partnership Types', type: 'textarea' },
                { key: 'mentorshipFocusAreas', label: 'Mentorship Focus Areas', type: 'textarea' },
                { key: 'committees', label: 'Committees', type: 'textarea' },
                { key: 'officerPositions', label: 'Officer Positions', type: 'textarea' },
                { key: 'contentCategories', label: 'Content Categories', type: 'textarea' },
                { key: 'announcementSubtypes', label: 'Announcement Subtypes', type: 'textarea' },
                { key: 'awardCategories', label: 'Award Categories', type: 'textarea' },
              ]}
              values={forms.referenceData || {}}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving.referenceData}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'email' | 'date';
  hint?: string;
}

interface SettingsCardProps {
  title: string;
  description: string;
  group: string;
  fields: FieldDef[];
  values: Record<string, unknown>;
  onChange: (group: string, field: string, value: unknown) => void;
  onSave: (group: string) => void;
  saving?: boolean;
}

function SettingsCard({ title, description, group, fields, values, onChange, onSave, saving }: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button onClick={() => onSave(group)} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`${group}-${field.key}`}>{field.label}</Label>
            {field.type === 'boolean' ? (
              <div className="flex items-center gap-3">
                <Switch
                  id={`${group}-${field.key}`}
                  checked={Boolean(values[field.key])}
                  onCheckedChange={(checked) => onChange(group, field.key, checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {values[field.key] ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ) : field.type === 'textarea' ? (
              <Textarea
                id={`${group}-${field.key}`}
                value={String(values[field.key] ?? '')}
                onChange={(e) => onChange(group, field.key, e.target.value)}
                className="min-h-[80px]"
              />
            ) : field.type === 'number' ? (
              <Input
                id={`${group}-${field.key}`}
                type="number"
                value={Number(values[field.key]) ?? 0}
                onChange={(e) => onChange(group, field.key, Number(e.target.value))}
                className="max-w-[200px]"
              />
            ) : (
              <Input
                id={`${group}-${field.key}`}
                type={field.type}
                value={String(values[field.key] ?? '')}
                onChange={(e) => onChange(group, field.key, e.target.value)}
              />
            )}
            {field.hint && (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
