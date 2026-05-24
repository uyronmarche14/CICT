'use client';

import { useState } from 'react';
import { OrganizationMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, UserPlus } from 'lucide-react';
import AdminMemberForm from './AdminMemberForm';
import { organizationService } from '@/services/organizationService';
import { CldImage } from 'next-cloudinary';
import { appToast } from '@/lib/app-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface AdminMemberManagerProps {
  orgId: string;
  members: OrganizationMember[];
  onRefresh: () => void;
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export default function AdminMemberManager({ orgId, members, onRefresh, color }: AdminMemberManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => void } | null>(null);

  const handleAdd = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: OrganizationMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    setDeleteConfirm({
      onConfirm: async () => {
        try {
          setDeletingId(memberId);
          await organizationService.deleteMember(orgId, memberId);
          onRefresh();
          appToast.success('Member Deleted', 'The member has been removed.');
        } catch (error) {
          console.error('Failed to delete member:', error);
          appToast.error('Deletion Failed', 'Could not delete the member.');
        } finally {
          setDeletingId(null);
          setDeleteConfirm(null);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold" style={{ color: color.primary }}>
          Member Management
        </h3>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors group relative"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border">
              {member.photo ? (
                <CldImage
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{member.name}</p>
              <p className="text-sm text-muted-foreground truncate">{member.position}</p>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 hover:text-blue-500"
                onClick={() => handleEdit(member)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 hover:text-red-500"
                onClick={() => handleDelete(member.id)}
                disabled={deletingId === member.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No members found. Click &quot;Add Member&quot; to start.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Member"
        message="Are you sure you want to delete this member?"
        confirmLabel="Delete"
        onConfirm={deleteConfirm?.onConfirm ?? (() => {})}
      />
      {isFormOpen && (
        <AdminMemberForm
          orgId={orgId}
          member={editingMember}
          onClose={() => setIsFormOpen(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
