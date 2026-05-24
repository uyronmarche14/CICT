'use client';
 
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Role } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rolesAPI } from '@/lib/api/roles';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { RoleFormDialog } from '@/components/admin/RoleFormDialog';
import { usePermissionMetadata } from '@/hooks/use-permission-metadata';
import { appToast } from '@/lib/app-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);
  const { canCreateRole, canUpdateRole, canDeleteRole, canAccessRolesModule } = usePermissions();
  const { groups: permissionGroups } = usePermissionMetadata();
  const { shouldRender } = useAdminPageAccess(canAccessRolesModule());

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesAPI.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!role.isDeletable) {
      appToast.error('Cannot Delete Role', 'This role is still assigned to users. Reassign them before deleting.', { label: 'Manage Users', onClick: () => router.push('/admin/users') });
      return;
    }
    setDeleteConfirm({
      onConfirm: async () => {
        try {
          await rolesAPI.delete(role.id);
          fetchRoles();
          appToast.success('Role Deleted', `The role "${role.name}" has been deleted.`);
        } catch {
          appToast.error('Deletion Failed', 'Could not delete the role.');
        }
        setDeleteConfirm(null);
      },
    });
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage system and custom roles in one permission matrix
          </p>
        </div>
        {canCreateRole() ? (
          <Button
            onClick={() => {
              setSelectedRole(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Custom Role
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Scope</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant={role.kind === 'system' ? 'secondary' : 'outline'}>
                          {role.kind === 'system' ? 'Built-in' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-sm">
                            {role.permissions.length} permissions
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {permissionGroups
                              .filter((group) =>
                                group.permissions.some((permission) =>
                                  role.permissions.includes(permission.value)
                                )
                              )
                              .map((group) => (
                                <Badge key={group.label} variant="outline" className="text-[10px]">
                                  {group.label}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {role.kind === 'system' ? (
                            <div className="text-right">
                              <span className="text-sm text-muted-foreground">Code managed</span>
                              <p className="text-xs text-muted-foreground">
                                {role.systemRoleKey?.replace('_', ' ')}
                              </p>
                            </div>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!canUpdateRole() || !role.isEditable}
                                onClick={() => {
                                  setSelectedRole(role);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                disabled={!canDeleteRole() || !role.isDeletable}
                                onClick={() => handleDelete(role)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RoleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={selectedRole}
        onSuccess={fetchRoles}
      />
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Role"
        message="Are you sure you want to delete this role?"
        confirmLabel="Delete"
        onConfirm={deleteConfirm?.onConfirm ?? (() => {})}
      />
    </div>
  );
}
