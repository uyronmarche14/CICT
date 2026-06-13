'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Loader2, UserPlus, Edit2, Trash2, Check, X } from 'lucide-react';
import { appToast } from '@/lib/app-toast';
import { membershipAPI, OrganizationMembership } from '@/lib/api/organization-membership';
import MembershipForm from './MembershipForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getMembershipStatusBadge, getMemberTypeLabel as getCentralMemberTypeLabel } from '@/utils/badge-helpers';
import type { OrganizationMember } from '@/types';
import AdminMemberForm from './AdminMemberForm';

interface OrganizationMembershipsTabProps {
  orgId: string;
}

type TabFilter = 'active' | 'officers' | 'applications' | 'alumni';

const TAB_FILTERS: { value: TabFilter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'officers', label: 'Officers' },
  { value: 'applications', label: 'Applications' },
  { value: 'alumni', label: 'Alumni' },
];

function getStatusBadge(status: string) {
  return getMembershipStatusBadge(status);
}

function getMemberTypeBadge(memberType: string) {
  return getCentralMemberTypeLabel(memberType);
}

function getStudentInitials(membership: OrganizationMembership): string {
  if (typeof membership.studentId === 'object' && membership.studentId) {
    return `${membership.studentId.firstName?.[0] ?? ''}${membership.studentId.lastName?.[0] ?? ''}`.toUpperCase();
  }
  return '??';
}

function getStudentPhoto(membership: OrganizationMembership): string | undefined {
  if (typeof membership.studentId === 'object' && membership.studentId) {
    return membership.studentId.profilePhoto;
  }
  return undefined;
}

function getStudentName(membership: OrganizationMembership): string {
  if (typeof membership.studentId === 'object' && membership.studentId) {
    return `${membership.studentId.firstName} ${membership.studentId.lastName}`;
  }
  return 'N/A';
}

function getStudentNumber(membership: OrganizationMembership): string {
  if (typeof membership.studentId === 'object' && membership.studentId) {
    return membership.studentId.studentNumber;
  }
  return 'N/A';
}

export default function OrganizationMembershipsTab({ orgId }: OrganizationMembershipsTabProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('active');
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<OrganizationMembership | null>(null);
  const [editingProfile, setEditingProfile] = useState<OrganizationMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };

      if (activeTab === 'applications') {
        params.status = 'applied,invited';
      } else if (activeTab === 'officers') {
        params.status = 'active';
        params.memberType = 'officer,advisor';
      } else if (activeTab === 'alumni') {
        params.status = 'alumni';
      } else {
        params.status = 'active';
      }

      const data = await membershipAPI.list(orgId, params);
      setMemberships(data.memberships ?? data.members ?? []);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch {
      appToast.error('Failed to Load', 'Could not load memberships.');
    } finally {
      setLoading(false);
    }
  }, [orgId, page, activeTab]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleAdd = () => {
    setEditingMembership(null);
    setIsFormOpen(true);
  };

  const handleEdit = (membership: OrganizationMembership) => {
    setEditingMembership(membership);
    setIsFormOpen(true);
  };

  const isProfileEligible = (membership: OrganizationMembership) =>
    membership.status === 'active' && ['officer', 'advisor'].includes(membership.memberType);

  const getStudentId = (membership: OrganizationMembership): string | undefined =>
    typeof membership.studentId === 'object' ? membership.studentId._id : membership.studentId;

  const buildProfileShell = (membership: OrganizationMembership): OrganizationMember => {
    const student = typeof membership.studentId === 'object' ? membership.studentId : null;

    return {
      id: '',
      membershipId: membership._id,
      studentId: getStudentId(membership),
      isPublic: false,
      name: student ? `${student.firstName} ${student.lastName}` : '',
      position: membership.position || 'Officer',
      photo: student?.profilePhoto ?? '',
      bio: '',
      memberType: membership.memberType,
      status: 'active',
      startDate: membership.startDate,
      endDate: membership.endDate,
      termStart: membership.startDate,
      termEnd: membership.endDate,
      leadershipStatus: 'current',
      sortOrder: 0,
      achievements: [],
      responsibilities: [],
      skills: [],
      timeline: [],
      gallery: [],
      social: {},
      projectItems: [],
      milestoneItems: [],
    };
  };

  const handleEditProfile = (membership: OrganizationMembership) => {
    setEditingProfile(membership.publicProfile ?? buildProfileShell(membership));
  };

  const handleDelete = (membershipId: string) => {
    setDeleteConfirm({
      onConfirm: async () => {
        try {
          setDeletingId(membershipId);
          await membershipAPI.delete(orgId, membershipId);
          fetchMemberships();
          appToast.success('Member Removed', 'The membership has been removed.');
        } catch {
          appToast.error('Deletion Failed', 'Could not delete the membership.');
        } finally {
          setDeletingId(null);
          setDeleteConfirm(null);
        }
      },
    });
  };

  const handleApprove = async (membershipId: string) => {
    try {
      setActionLoading(membershipId);
      await membershipAPI.approve(orgId, membershipId);
      fetchMemberships();
      appToast.success('Approved', 'The membership has been approved.');
    } catch {
      appToast.error('Approval Failed', 'Could not approve the membership.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (membershipId: string) => {
    try {
      setActionLoading(membershipId);
      await membershipAPI.reject(orgId, membershipId);
      fetchMemberships();
      appToast.success('Rejected', 'The membership has been rejected.');
    } catch {
      appToast.error('Rejection Failed', 'Could not reject the membership.');
    } finally {
      setActionLoading(null);
    }
  };

  const isPending = (status: string) => status === 'applied' || status === 'invited';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Organization Memberships</h3>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {TAB_FILTERS.map((tab) => (
          <Button
            key={tab.value}
            variant="ghost"
            size="sm"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors rounded-none ${
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Student #</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Public Profile</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((membership) => (
                <TableRow key={membership._id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getStudentPhoto(membership)} />
                      <AvatarFallback>{getStudentInitials(membership)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{getStudentName(membership)}</TableCell>
                  <TableCell>{getStudentNumber(membership)}</TableCell>
                  <TableCell>{membership.position || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getMemberTypeBadge(membership.memberType)}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(membership.status)}</TableCell>
                  <TableCell>{formatDate(membership.startDate)}</TableCell>
                  <TableCell>
                    {isProfileEligible(membership) ? (
                      <Badge variant={membership.publicProfile?.isPublic ? 'default' : 'secondary'}>
                        {membership.publicProfile?.isPublic
                          ? 'Published'
                          : membership.publicProfile
                            ? 'Draft'
                            : 'Not started'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:text-blue-500"
                        onClick={() => handleEdit(membership)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {isProfileEligible(membership) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => handleEditProfile(membership)}
                        >
                          Profile
                        </Button>
                      ) : null}
                      {isPending(membership.status) && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:text-green-500"
                            onClick={() => handleApprove(membership._id)}
                            disabled={actionLoading === membership._id}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:text-red-500"
                            onClick={() => handleReject(membership._id)}
                            disabled={actionLoading === membership._id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:text-red-500"
                        onClick={() => handleDelete(membership._id)}
                        disabled={deletingId === membership._id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {memberships.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No memberships found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {isFormOpen && (
        <MembershipForm
          orgId={orgId}
          membership={editingMembership}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchMemberships}
        />
      )}

      {editingProfile ? (
        <AdminMemberForm
          orgId={orgId}
          member={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSuccess={() => {
            setEditingProfile(null);
            fetchMemberships();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Remove Membership"
        message="Are you sure you want to remove this membership?"
        confirmLabel="Remove"
        onConfirm={deleteConfirm?.onConfirm ?? (() => {})}
      />
    </div>
  );
}
