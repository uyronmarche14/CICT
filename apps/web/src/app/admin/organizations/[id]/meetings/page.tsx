'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Plus, Loader2, Trash2, MapPin, Users, ExternalLink, Clock, Pencil } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { orgMeetingsAPI } from '@/lib/api/org-meetings';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MeetingForm } from '@/components/admin/MeetingForm';
import { format } from 'date-fns';

export default function OrgMeetingsPage() {
  const params = useParams();
  const orgId = params.id as string;
  const { canManageOrgMeetings } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageOrgMeetings(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<{ _id: string; title: string; date: string; duration: number; location?: string; meetingUrl?: string; description?: string; agenda?: Array<{ topic: string; duration?: number }> } | null>(null);

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: queryKeys.orgMeetings.all(orgId),
    queryFn: () => orgMeetingsAPI.list(orgId),
    enabled: !!orgId,
  });

  const deleteMutation = useMutation({
    mutationFn: (meetingId: string) => orgMeetingsAPI.delete(orgId, meetingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orgMeetings.all(orgId) }),
  });

  if (!shouldRender) return null;

  const upcoming = meetings.filter((m) => new Date(m.date) >= new Date());
  const past = meetings.filter((m) => new Date(m.date) < new Date());

  return (
    <OrgPageLayout
      title="Meetings"
      icon={CalendarClock}
      description="Schedule and manage organization meetings, agendas, and minutes."
      loading={orgLoading}
      action={
        <Button size="sm" onClick={() => { setEditingMeeting(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />Schedule Meeting
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground">No meetings scheduled.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Upcoming</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((m) => (
                  <MeetingCard key={m._id} meeting={m} onEdit={() => { setEditingMeeting(m); setShowForm(true); }} onDelete={() => deleteMutation.mutate(m._id)} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Past</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((m) => (
                  <MeetingCard key={m._id} meeting={m} onEdit={() => { setEditingMeeting(m); setShowForm(true); }} onDelete={() => deleteMutation.mutate(m._id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <MeetingForm
        orgId={orgId}
        open={showForm}
        onOpenChange={setShowForm}
        item={editingMeeting}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.orgMeetings.all(orgId) })}
      />
    </OrgPageLayout>
  );
}

function MeetingCard({ meeting, onEdit, onDelete }: {
  meeting: { _id: string; title: string; date: string; duration: number; location?: string; meetingUrl?: string; attendees?: Array<{ rsvp: string }>; minutes?: string; actionItems?: Array<{ text: string; status: string }> };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isPast = new Date(meeting.date) < new Date();
  const acceptedCount = meeting.attendees?.filter((a) => a.rsvp === 'accepted').length ?? 0;

  return (
    <Card className={isPast ? 'opacity-60' : ''}>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{meeting.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{format(new Date(meeting.date), 'MMM d, yyyy · h:mm a')}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
              <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4 space-y-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{meeting.duration}min</span>
          {meeting.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.location}</span>}
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{acceptedCount}/{meeting.attendees?.length || 0}</span>
        </div>
        {meeting.meetingUrl && (
          <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />Join meeting
          </a>
        )}
        <div className="flex items-center gap-2">
          <Badge variant={isPast ? 'outline' : 'default'} className="text-[10px] px-1.5">
            {isPast ? 'Past' : 'Upcoming'}
          </Badge>
          {meeting.minutes && <Badge variant="secondary" className="text-[10px] px-1.5">Minutes saved</Badge>}
          {meeting.actionItems && meeting.actionItems.length > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5">
              {meeting.actionItems.filter((a) => a.status !== 'completed').length} open actions
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
