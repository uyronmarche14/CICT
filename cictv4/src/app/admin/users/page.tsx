'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api/users';
import { rolesAPI } from '@/lib/api/roles';
import { Permission, Role, User, UserRole } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Trash, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/admin/UserForm";
import { UserManagementDialog } from '@/components/admin/UserManagementDialog';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';

export default function UsersPage() {
  const { user: currentUser, refreshProfile } = useAuth();
  const {
    canCreateUser,
    canDeleteUser,
    canUpdateUser,
    hasPermission,
    canSetUserStatus,
    canAccessUsersModule,
  } =
    usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessUsersModule());
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customRoleFilter, setCustomRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const canAssignRole = hasPermission(Permission.ASSIGN_ROLE);
  const canViewRoles = hasPermission(Permission.VIEW_ROLE);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAll({
        page,
        limit: 10,
        search,
        role: roleFilter === 'all' ? '' : (roleFilter as UserRole),
        isActive:
          statusFilter === 'all'
            ? ''
            : statusFilter === 'active'
              ? 'true'
              : 'false',
        customRoleId: customRoleFilter === 'all' ? '' : customRoleFilter,
      });
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, customRoleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!canViewRoles && !canAssignRole) {
      setRoles([]);
      return;
    }

    const fetchRoles = async () => {
      try {
        const data = await rolesAPI.getAll();
        setRoles(data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    fetchRoles();
  }, [canAssignRole, canViewRoles]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (!shouldRender) {
    return null;
  }

  const systemRoles = roles.filter((role) => role.kind === 'system');
  const customRoles = roles.filter((role) => role.kind === 'custom');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        {canCreateUser() ? <UserForm onSuccess={fetchUsers} /> : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
          <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {(systemRoles.length > 0 ? systemRoles : []).map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.systemRoleKey ?? UserRole.SUPPORT}
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                  {systemRoles.length === 0 ? (
                    <>
                      <SelectItem value={UserRole.FULL_ADMIN}>Full Admin</SelectItem>
                      <SelectItem value={UserRole.SEMI_ADMIN}>Semi Admin</SelectItem>
                      <SelectItem value={UserRole.SUPPORT}>Support</SelectItem>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {canViewRoles || canAssignRole ? (
                <Select
                  value={customRoleFilter}
                  onValueChange={(value) => {
                    setCustomRoleFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Custom role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All custom roles</SelectItem>
                    {customRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={user.customRole ? 'default' : user.role === UserRole.FULL_ADMIN ? 'default' : 'secondary'}>
                              {user.effectiveRoleLabel}
                            </Badge>
                            {user.customRole ? (
                              <span className="text-xs text-muted-foreground">Effective role</span>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            System role: {user.baseRoleLabel}
                          </div>
                          {user.customRole ? (
                            <div className="text-xs text-muted-foreground">
                              Custom role override: {user.customRole.name}
                            </div>
                          ) : null}
                          <div className="text-xs text-muted-foreground">
                            Org scopes: {user.organizationAssignments?.length ?? 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              disabled={!canUpdateUser()}
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Manage
                            </DropdownMenuItem>
                            {canSetUserStatus() ? (
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    await usersAPI.setStatus(user.id, !user.isActive);
                                    if (currentUser?.id === user.id) {
                                      await refreshProfile();
                                    }
                                    fetchUsers();
                                  } catch (error) {
                                    console.error('Failed to update user status:', error);
                                  }
                                }}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem 
                              disabled={!canDeleteUser()}
                              className="text-red-600"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <UserManagementDialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        roles={roles}
        canAssignRole={canAssignRole}
        canSetStatus={canSetUserStatus()}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
