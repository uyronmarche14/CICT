'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Organization, Role, User, UserRole } from '@/types';
import { usersAPI } from '@/lib/api/users';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePermissionMetadata } from '@/hooks/use-permission-metadata';
import { permissionsMetadataAPI } from '@/lib/api/permissions';
import { organizationService } from '@/services/organizationService';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  systemRole: z.nativeEnum(UserRole),
  customRoleId: z.string().nullable(),
  isActive: z.boolean(),
});

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  roles: Role[];
  canAssignRole: boolean;
  canSetStatus: boolean;
  onSuccess: () => void;
}
type InputFieldProps = React.ComponentProps<typeof Input>;
type SelectFieldProps = { value?: string; onChange: (value: string) => void };
type SwitchFieldProps = { value: boolean; onChange: (value: boolean) => void };

export function UserManagementDialog({
  open,
  onOpenChange,
  user,
  roles,
  canAssignRole,
  canSetStatus,
  onSuccess,
}: UserManagementDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationAssignments, setOrganizationAssignments] = useState<
    Array<{ id: string; organizationId: string; roleId: string }>
  >([]);
  const { user: currentUser, refreshProfile } = useAuth();
  const { groups: permissionGroups } = usePermissionMetadata();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      systemRole: user?.role ?? UserRole.SUPPORT,
      customRoleId: user?.customRoleId ?? null,
      isActive: user?.isActive ?? true,
    },
  });
  const systemRole = form.watch('systemRole');
  const customRoleId = form.watch('customRoleId');

  const systemRoles = useMemo(
    () => roles.filter((role) => role.kind === 'system'),
    [roles]
  );
  const customRoles = useMemo(
    () => roles.filter((role) => role.kind === 'custom'),
    [roles]
  );

  const selectedSystemRole = useMemo(
    () =>
      systemRoles.find((role) => role.systemRoleKey === systemRole) ??
      systemRoles.find((role) => role.systemRoleKey === UserRole.SUPPORT) ??
      null,
    [systemRole, systemRoles]
  );

  const selectedCustomRole = useMemo(
    () => customRoles.find((role) => role.id === customRoleId) ?? null,
    [customRoleId, customRoles]
  );

  const effectiveRole = selectedCustomRole ?? selectedSystemRole;
  const groupedPermissionPreview = useMemo(() => {
    const effectivePermissions = effectiveRole?.permissions ?? [];

    return permissionsMetadataAPI.getGroupedPreviewCounts(
      effectivePermissions,
      permissionGroups
    );
  }, [effectiveRole, permissionGroups]);

  useEffect(() => {
    form.reset({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      systemRole: user?.role ?? UserRole.SUPPORT,
      customRoleId: user?.customRoleId ?? null,
      isActive: user?.isActive ?? true,
    });
  }, [form, user]);

  useEffect(() => {
    if (!open || !user || !canAssignRole) {
      return;
    }

    const fetchScopedAccess = async () => {
      try {
        const [organizationData, assignmentData] = await Promise.all([
          organizationService.getAll(),
          usersAPI.getOrgAssignments(user.id),
        ]);
        setOrganizations(organizationData);
        setOrganizationAssignments(
          assignmentData.map((assignment) => ({
            id: assignment.id,
            organizationId: assignment.organizationId,
            roleId: assignment.roleId,
          }))
        );
      } catch (error) {
        console.error('Failed to load organization assignments:', error);
      }
    };

    fetchScopedAccess();
  }, [open, user, canAssignRole]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    try {
      await usersAPI.update(user.id, {
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (canAssignRole) {
        await usersAPI.setRole(user.id, {
          role: values.systemRole,
          customRoleId: values.customRoleId,
        });
      }

      if (canSetStatus && values.isActive !== user.isActive) {
        await usersAPI.setStatus(user.id, values.isActive);
      }

      if (canAssignRole) {
        const existingAssignments = user.organizationAssignments ?? [];
        const currentAssignments = organizationAssignments.filter(
          (assignment) => assignment.organizationId && assignment.roleId
        );
        const existingById = new Map(
          existingAssignments.map((assignment) => [assignment.id, assignment])
        );

        for (const existingAssignment of existingAssignments) {
          if (!currentAssignments.some((assignment) => assignment.id === existingAssignment.id)) {
            await usersAPI.deleteOrgAssignment(user.id, existingAssignment.id);
          }
        }

        for (const assignment of currentAssignments) {
          const originalAssignment = existingById.get(assignment.id);

          if (!originalAssignment) {
            await usersAPI.createOrgAssignment(user.id, {
              organizationId: assignment.organizationId,
              roleId: assignment.roleId,
            });
            continue;
          }

          if (
            originalAssignment.organizationId !== assignment.organizationId ||
            originalAssignment.roleId !== assignment.roleId
          ) {
            await usersAPI.updateOrgAssignment(user.id, assignment.id, {
              organizationId: assignment.organizationId,
              roleId: assignment.roleId,
            });
          }
        }
      }

      if (currentUser?.id === user.id) {
        await refreshProfile();
      }

      toast.success('User updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="systemRole"
              render={({ field }: { field: SelectFieldProps }) => (
                <FormItem>
                  <FormLabel>System Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!canAssignRole}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a system role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {systemRoles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.systemRoleKey ?? UserRole.SUPPORT}
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!canAssignRole ? (
                    <p className="text-xs text-muted-foreground">
                      You can edit profile details, but role assignment requires additional permission.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This is the base role stored on the account.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customRoleId"
              render={({ field }: { field: { value: string | null; onChange: (value: string | null) => void } }) => (
                <FormItem>
                  <FormLabel>Custom Role Override</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    value={field.value ?? 'none'}
                    disabled={!canAssignRole}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a custom role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No custom role</SelectItem>
                      {customRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    When assigned, the custom role becomes the effective permission profile.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium">Effective Access Summary</h3>
                <p className="text-xs text-muted-foreground">
                  The system role remains the stored base role. A custom role override becomes the active permission source.
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Base role:</span>{' '}
                  {selectedSystemRole?.name ?? user?.baseRoleLabel ?? 'Support'}
                </div>
                <div>
                  <span className="text-muted-foreground">Custom override:</span>{' '}
                  {selectedCustomRole?.name ?? 'None'}
                </div>
                <div>
                  <span className="text-muted-foreground">Effective role:</span>{' '}
                  {effectiveRole?.name ?? user?.effectiveRoleLabel ?? 'Support'}
                </div>
                <div>
                  <span className="text-muted-foreground">Permissions:</span>{' '}
                  {effectiveRole?.permissions.length ?? user?.effectivePermissions.length ?? 0}
                </div>
              </div>
              {groupedPermissionPreview.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {groupedPermissionPreview.map((group) => (
                    <span
                      key={group.label}
                      className="rounded-full border px-2 py-1 text-xs text-muted-foreground"
                    >
                      {group.label} ({group.count})
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {canAssignRole ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Organization Assignments</h3>
                    <p className="text-xs text-muted-foreground">
                      Scoped roles grant access only inside selected organizations.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOrganizationAssignments((current) => [
                        ...current,
                        {
                          id: crypto.randomUUID(),
                          organizationId: '',
                          roleId: '',
                        },
                      ])
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Scope
                  </Button>
                </div>

                {organizationAssignments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No organization-scoped access assigned.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {organizationAssignments.map((assignment) => (
                      <div key={assignment.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_auto]">
                        <Select
                          value={assignment.organizationId}
                          onValueChange={(value) =>
                            setOrganizationAssignments((current) =>
                              current.map((item) =>
                                item.id === assignment.id ? { ...item, organizationId: value } : item
                              )
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((organization) => (
                              <SelectItem key={organization.id} value={organization.id}>
                                {organization.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={assignment.roleId}
                          onValueChange={(value) =>
                            setOrganizationAssignments((current) =>
                              current.map((item) =>
                                item.id === assignment.id ? { ...item, roleId: value } : item
                              )
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select scoped role" />
                          </SelectTrigger>
                          <SelectContent>
                            {customRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setOrganizationAssignments((current) =>
                              current.filter((item) => item.id !== assignment.id)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }: { field: SwitchFieldProps }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Active users can sign in and use the admin platform.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canSetStatus}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
