'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserPlus, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { LookupCombobox } from '@/components/ui/lookup-combobox';
import { rolesAPI } from '@/lib/api/roles';
import api from '@/lib/api/axios';
import { appToast } from '@/lib/app-toast';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';

interface AdminAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

const PERM_LABELS: Record<string, string> = {
  MANAGE_ORG_TASKS: 'Tasks', MANAGE_ORG_MEETINGS: 'Meetings',
  MANAGE_ORG_VOTES: 'Voting', MANAGE_ORG_BUDGET: 'Budget',
  MANAGE_ORG_TEMPLATES: 'Templates', VIEW_ORG_ANALYTICS: 'Analytics',
  MANAGE_ORG_PARTNERSHIPS: 'Partnerships', MANAGE_ORG_COLLABORATION: 'Collab',
  SHARE_CONTENT_CROSS_ORG: 'Share', MANAGE_ORG_TASK_FORCES: 'Task Forces',
  MANAGE_ORG_RESOURCE_POOLING: 'Resources', MANAGE_ORG_MENTORSHIP: 'Mentorship',
  MANAGE_ORG_ADMINS: 'Admins',
};

function AdminListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border animate-pulse">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function OrgAdminAssignments({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();
  const { canManageOrgAdmins, organizationAssignments, permissions } = usePermissions();
  const canManageAdmins = canManageOrgAdmins(orgId);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<AdminAssignment | null>(null);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['org-admins', orgId],
    queryFn: async () => {
      const { data: res } = await api.get(`/organizations/${orgId}/admins`);
      return (res.data?.assignments ?? []) as AdminAssignment[];
    },
    enabled: canManageAdmins,
    staleTime: 30_000,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles', 'custom'],
    queryFn: async () => {
      const roleData = await rolesAPI.getAll();
      return roleData.filter((role) => role.kind === 'custom');
    },
    enabled: canManageAdmins,
    staleTime: 60_000,
  });

  const assignablePermissions = useMemo(() => {
    const permissionSet = new Set(permissions.map(String));
    const scopedAssignment = organizationAssignments.find(
      (assignment) => assignment.organizationId === orgId
    );

    scopedAssignment?.permissions.forEach((permission) => permissionSet.add(String(permission)));

    return permissionSet;
  }, [orgId, organizationAssignments, permissions]);

  const assignableRoles = useMemo(
    () =>
      roles?.filter((role) =>
        role.permissions.every((permission) => assignablePermissions.has(String(permission)))
      ) ?? [],
    [assignablePermissions, roles]
  );

  const selectedRoleData = assignableRoles.find((role) => role.id === selectedRole);

  const refreshSidebar = () => {
    queryClient.invalidateQueries({ queryKey: ['organizations', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['org-admins', orgId] });
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/organizations/${orgId}/admins`, { userId: selectedUser, roleId: selectedRole });
    },
    onSuccess: async () => {
      refreshSidebar();
      if (user?.id === selectedUser) await refreshProfile();
      setAddOpen(false);
      setSelectedUser('');
      setSelectedRole('');
      appToast.success('Admin Added', 'The user can now access this organization.');
    },
    onError: () => appToast.error('Failed', 'Could not add admin.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await api.delete(`/organizations/${orgId}/admins/${assignmentId}`);
    },
    onSuccess: async () => {
      refreshSidebar();
      if (user?.id === deleteConfirm?.userId) await refreshProfile();
      setDeleteConfirm(null);
      appToast.success('Admin Removed', 'Organization admin has been removed.');
    },
    onError: () => { setDeleteConfirm(null); appToast.error('Failed', 'Could not remove admin.'); },
  });

  if (!canManageAdmins) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Organization Admins</span>
              <Badge variant="secondary" className="text-[10px] ml-1">
                {assignments?.length ?? 0}
              </Badge>
            </div>
            {canManageAdmins ? (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                          <Shield className="h-5 w-5 text-primary" />
                          Add Organization Admin
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        {/* User search — instant LookupCombobox */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select User</label>
                          <LookupCombobox
                            kind="users"
                            value={selectedUser}
                            onChange={(val) => setSelectedUser(val)}
                            placeholder="Search users..."
                            searchPlaceholder="Type name or email..."
                          />
                        </div>

                        {/* Role picker — shadcn Select */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Assign Role</label>
                          <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!assignableRoles.length}>
                            <SelectTrigger className="h-10 rounded-lg">
                              <span className={selectedRole ? '' : 'text-muted-foreground truncate'}>
                                {selectedRole ? selectedRoleData?.name : 'Select a role...'}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {assignableRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id} className="py-2">
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate">{role.name}</span>
                                    {role.description && (
                                      <span className="text-muted-foreground text-[11px] truncate leading-tight">{role.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Permission preview — compact count */}
                        {selectedRoleData && selectedRoleData.permissions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/30 border"
                          >
                            <Badge variant="default" className="text-[10px] font-semibold">
                              {selectedRoleData.permissions.length} tools
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {selectedRoleData.permissions.slice(0, 3).map((p) => PERM_LABELS[p]).filter(Boolean).join(' · ')}
                              {selectedRoleData.permissions.length > 3 ? ' & more' : ''}
                            </span>
                          </motion.div>
                        )}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button
                          onClick={() => addMutation.mutate()}
                          disabled={!selectedUser || !selectedRole || addMutation.isPending}
                          className="gap-1.5"
                        >
                          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {addMutation.isPending ? 'Adding...' : 'Add Admin'}
                        </Button>
                      </DialogFooter>
                    </motion.div>
                  </AnimatePresence>
                </DialogContent>
              </Dialog>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AdminListSkeleton />
          ) : !assignments || assignments.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Shield className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">No admins assigned</p>
              <p className="text-xs text-muted-foreground mt-1">Add an admin to manage this organization.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {assignments.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-start justify-between p-3.5 rounded-xl border hover:border-primary/20 hover:bg-accent/20 transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                          {(a.userName || '?')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{a.userName || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">{a.userEmail || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 ml-10 flex-wrap">
                        <Badge variant="outline" className="text-[9px] font-medium shrink-0">{a.roleName}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                          {a.permissions.slice(0, 4).map((p) => PERM_LABELS[p]).filter(Boolean).join(', ')}
                          {a.permissions.length > 4 && ` +${a.permissions.length - 4} more`}
                        </span>
                      </div>
                    </div>
                    {canManageAdmins ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        onClick={() => setDeleteConfirm(a)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Remove Admin"
        message={`Remove ${deleteConfirm?.userName || 'this user'} as admin? They will lose access to all organization tools.`}
        confirmLabel="Remove"
        onConfirm={() => deleteMutation.mutate(deleteConfirm!.id)}
      />
    </>
  );
}
