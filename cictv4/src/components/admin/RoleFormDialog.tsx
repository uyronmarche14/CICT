'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Permission, Role } from '@/types';
import { usePermissionMetadata } from '@/hooks/use-permission-metadata';
import { rolesAPI } from '@/lib/api/roles';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters'),
  description: z.string().min(8, 'Description must be at least 8 characters'),
  permissions: z.array(z.nativeEnum(Permission)).min(1, 'Select at least one permission'),
});

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSuccess: () => void;
}
type InputFieldProps = React.ComponentProps<typeof Input>;
type TextareaFieldProps = React.ComponentProps<typeof Textarea>;
type PermissionFieldProps = { value: Permission[]; onChange: (value: Permission[]) => void };

export function RoleFormDialog({ open, onOpenChange, role, onSuccess }: RoleFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { groups: permissionGroups } = usePermissionMetadata();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissions: role?.permissions ?? [],
    },
  });

  useEffect(() => {
    form.reset({
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissions: role?.permissions ?? [],
    });
  }, [form, role]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (role) {
        await rolesAPI.update(role.id, values);
        toast.success('Role updated successfully');
      } else {
        await rolesAPI.create(values);
        toast.success('Role created successfully');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to save role:', error);
      toast.error('Failed to save role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Custom Role' : 'Create Custom Role'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Content Publisher" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }: { field: TextareaFieldProps }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Describe what this role can do." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="space-y-4">
                    {permissionGroups.map((group) => (
                      <div key={group.label} className="rounded-lg border p-4">
                        <h3 className="font-medium">{group.label}</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {group.permissions.map((permission) => (
                            <FormField
                              key={permission.value}
                              control={form.control}
                              name="permissions"
                              render={({ field }: { field: PermissionFieldProps }) => (
                                <FormItem className="flex items-start gap-3 rounded-md border p-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value.includes(permission.value)}
                                      onCheckedChange={(checked) => {
                                        const nextPermissions = checked
                                          ? [...field.value, permission.value]
                                          : field.value.filter((value: Permission) => value !== permission.value);
                                        field.onChange(nextPermissions);
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">{permission.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {role ? 'Save Changes' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
