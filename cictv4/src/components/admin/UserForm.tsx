'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api/axios';
import { toast } from 'sonner';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Organization, Permission, Role, UserRole } from '@/types';
import { rolesAPI } from '@/lib/api/roles';
import { usePermissionMetadata } from '@/hooks/use-permission-metadata';
import { permissionsMetadataAPI } from '@/lib/api/permissions';
import { organizationService } from '@/services/organizationService';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  systemRole: z.nativeEnum(UserRole),
  customRoleId: z.string().nullable(),
});

interface UserFormProps {
  onSuccess: () => void;
}

interface UserApiError {
  message?: string;
}
type InputFieldProps = React.ComponentProps<typeof Input>;
type SelectFieldProps = { value?: string; onChange: (value: string) => void };

export function UserForm({ onSuccess }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationAssignments, setOrganizationAssignments] = useState<
    Array<{ id: string; organizationId: string; roleId: string }>
  >([]);
  const { hasPermission } = usePermissions();
  const { groups: permissionGroups } = usePermissionMetadata();
  const canAssignRole = hasPermission(Permission.ASSIGN_ROLE);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      systemRole: UserRole.SUPPORT,
      customRoleId: null,
    },
  });
  const systemRole = form.watch('systemRole');
  const customRoleId = form.watch('customRoleId');

  useEffect(() => {
    if (!open || !canAssignRole) {
      return;
    }

    const fetchDependencies = async () => {
      try {
        const [roleData, organizationData] = await Promise.all([
          rolesAPI.getAll(),
          organizationService.getAll(),
        ]);
        setRoles(roleData);
        setOrganizations(organizationData);
      } catch (error) {
        console.error('Failed to fetch user creation dependencies:', error);
      }
    };

    fetchDependencies();
  }, [open, canAssignRole]);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const normalizedAssignments = organizationAssignments
        .filter((assignment) => assignment.organizationId && assignment.roleId)
        .map((assignment) => ({
          organizationId: assignment.organizationId,
          roleId: assignment.roleId,
        }));
      const payload: Record<string, string | null> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: canAssignRole ? values.systemRole : UserRole.SUPPORT,
        customRoleId: canAssignRole ? values.customRoleId : null,
      };

      const response = await api.post('/users', {
        ...payload,
        organizationAssignments: canAssignRole ? normalizedAssignments : [],
      });
      if (response.data.success) {
        toast.success('User created successfully');
        setOpen(false);
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          systemRole: UserRole.SUPPORT,
          customRoleId: null,
        });
        setOrganizationAssignments([]);
        onSuccess();
      }
    } catch (error) {
      const apiError = error as AxiosError<UserApiError>;
      toast.error(apiError.response?.data?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
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
                        <Input placeholder="John" {...field} />
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
                        <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="********" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemRole"
              render={({ field }: { field: SelectFieldProps }) => (
                <FormItem>
                  <FormLabel>System Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a system role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(canAssignRole ? systemRoles : []).map((role) => (
                        <SelectItem key={role.id} value={role.systemRoleKey ?? UserRole.SUPPORT}>
                          {role.name}
                        </SelectItem>
                      ))}
                      {!canAssignRole ? (
                        <SelectItem value={UserRole.SUPPORT}>Support</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  {!canAssignRole && (
                    <p className="text-xs text-muted-foreground">
                      New users default to Support when you do not have role-assignment permission.
                    </p>
                  )}
                  {canAssignRole ? (
                    <p className="text-xs text-muted-foreground">
                      This is the base system role stored on the account.
                    </p>
                  ) : null}
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
                    When assigned, the custom role overrides the default system-role permissions.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canAssignRole ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Organization Assignments</h3>
                    <p className="text-xs text-muted-foreground">
                      Assign reusable custom roles to specific organizations. These scopes are separate from the global account role.
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
                    No organization scopes assigned yet.
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

            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium">Effective Access Summary</h3>
                <p className="text-xs text-muted-foreground">
                  The system role is stored as the base account role. A custom role override becomes the active permission source.
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Base role:</span>{' '}
                  {selectedSystemRole?.name ?? 'Support'}
                </div>
                <div>
                  <span className="text-muted-foreground">Custom override:</span>{' '}
                  {selectedCustomRole?.name ?? 'None'}
                </div>
                <div>
                  <span className="text-muted-foreground">Effective role:</span>{' '}
                  {effectiveRole?.name ?? 'Support'}
                </div>
                <div>
                  <span className="text-muted-foreground">Permissions:</span>{' '}
                  {effectiveRole?.permissions.length ?? 0}
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

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
