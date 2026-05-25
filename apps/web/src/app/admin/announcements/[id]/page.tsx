'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { announcementAPI } from '@/lib/api/announcements';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  ArrowLeft,
  Pencil,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { appToast } from '@/lib/app-toast';
import {
  AnnouncementPriority,
  NewsStatus,
  Permission,
  ContentSection,
  OfficerItem,
  AwardItem,
  AttachmentItem,
} from '@/types';
import { Badge } from '@/components/ui/badge';
import { ApprovalTimeline } from '@/components/admin/ApprovalTimeline';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { useApprovalHistory } from '@/hooks/use-approval-queue';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';

export default function AdminAnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const announcementId = params.id as string;
  const { canAccessAnnouncementsModule, hasPermission, hasAnyScopedPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessAnnouncementsModule());

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: announcementData, isLoading } = useQuery({
    queryKey: ['admin', 'announcement', announcementId],
    queryFn: () => announcementAPI.getById(announcementId),
    enabled: !!announcementId,
  });

  const { data: approvalHistoryData } = useApprovalHistory('announcement', announcementId);

  const submitMutation = useMutation({
    mutationFn: () => announcementAPI.submit(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcement', announcementId] });
      appToast.success('Submitted', 'Announcement has been submitted for approval.');
    },
    onError: () => {
      appToast.error('Submission Failed', 'Could not submit announcement for approval.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => announcementAPI.approve(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcement', announcementId] });
      appToast.success('Approved', 'Announcement has been approved.');
    },
    onError: () => {
      appToast.error('Approval Failed', 'Could not approve announcement.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => announcementAPI.reject(announcementId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcement', announcementId] });
      appToast.success('Rejected', 'Announcement has been rejected.');
    },
    onError: () => {
      appToast.error('Rejection Failed', 'Could not reject announcement.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => announcementAPI.publish(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcement', announcementId] });
      appToast.success('Published', 'Announcement has been published.');
    },
    onError: () => {
      appToast.error('Publish Failed', 'Could not publish announcement.');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => announcementAPI.archive(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcement', announcementId] });
      appToast.success('Archived', 'Announcement has been archived.');
    },
    onError: () => {
      appToast.error('Archive Failed', 'Could not archive announcement.');
    },
  });

  if (!shouldRender) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const announcement = announcementData?.data?.announcement;

  if (!announcement) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Announcement not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/announcements')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Announcements
        </Button>
      </div>
    );
  }

  const authorName = typeof announcement.author === 'object'
    ? `${announcement.author.firstName} ${announcement.author.lastName}`
    : 'Unknown';

  const status = announcement.status ?? NewsStatus.DRAFT;
  const showApproveReject = status === NewsStatus.PENDING_APPROVAL &&
    (hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT) ||
     hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT));

  const getStatusBadgeClass = (s: NewsStatus) => {
    switch (s) {
      case NewsStatus.APPROVED: return 'bg-blue-600';
      case NewsStatus.REJECTED: return 'bg-red-600';
      case NewsStatus.PENDING_APPROVAL: return 'bg-amber-500';
      case NewsStatus.PUBLISHED: return '';
      case NewsStatus.DRAFT: return 'bg-secondary';
      case NewsStatus.ARCHIVED: return 'bg-gray-500';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case AnnouncementPriority.URGENT:
        return <Badge variant="destructive">Urgent</Badge>;
      case AnnouncementPriority.HIGH:
        return <Badge className="bg-orange-500">High</Badge>;
      case AnnouncementPriority.MEDIUM:
        return <Badge className="bg-blue-500">Medium</Badge>;
      case AnnouncementPriority.LOW:
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/announcements')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Announcements
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                {getPriorityBadge(announcement.priority)}
              </div>
              <p className="text-sm text-muted-foreground">
                {announcement.type.replace(/_/g, ' ')} &middot;
                By {authorName} &middot;
                {format(new Date(announcement.createdAt), 'MMM dd, yyyy h:mm a')}
              </p>
            </div>
            <Badge className={getStatusBadgeClass(status)}>
              {status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Target Audience:</span>{' '}
              <span className="font-medium">
                {announcement.targetAudience?.length
                  ? announcement.targetAudience.join(', ')
                  : 'All'}
              </span>
            </div>
            {announcement.expiresAt && (
              <div>
                <span className="text-muted-foreground">Expires:</span>{' '}
                <span className="font-medium">
                  {format(new Date(announcement.expiresAt), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Active:</span>{' '}
              <span className={announcement.isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {announcement.isActive ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {announcement.coverImage && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img
                src={announcement.coverImage.imageUrl}
                alt={announcement.coverImage.alt ?? announcement.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {announcement.bodyHtml && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.bodyHtml }}
            />
          )}

          {announcement.sections && announcement.sections.length > 0 && (
            <div className="space-y-4">
              {announcement.sections.map((section: ContentSection, i: number) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>
                  {section.bodyHtml && (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Classification */}
          {(announcement.subtype || announcement.effectiveDate || announcement.termStart || announcement.termEnd) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcement.subtype && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Subtype:</span>
                    <Badge variant="outline" className="capitalize">
                      {announcement.subtype}
                    </Badge>
                  </div>
                )}
                {(announcement.effectiveDate || announcement.termStart || announcement.termEnd) && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    {announcement.effectiveDate && (
                      <div>
                        <span className="text-muted-foreground">Effective Date:</span>{' '}
                        <span className="font-medium">{format(new Date(announcement.effectiveDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {announcement.termStart && (
                      <div>
                        <span className="text-muted-foreground">Term Start:</span>{' '}
                        <span className="font-medium">{format(new Date(announcement.termStart), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {announcement.termEnd && (
                      <div>
                        <span className="text-muted-foreground">Term End:</span>{' '}
                        <span className="font-medium">{format(new Date(announcement.termEnd), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Related Content */}
          {(announcement.relatedOrganizationId || announcement.relatedEventId || announcement.approvalSource) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {announcement.relatedOrganizationId && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{announcement.relatedOrganizationId}</span>
                  </div>
                )}
                {announcement.relatedEventId && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium">{announcement.relatedEventId}</span>
                  </div>
                )}
                {announcement.approvalSource && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">Approval Source:</span>
                    <span className="font-medium">{announcement.approvalSource}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact & CTA */}
          {(announcement.contactName || announcement.contactEmail || announcement.ctaLabel) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact & CTA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {announcement.contactName && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">{announcement.contactName}</span>
                  </div>
                )}
                {announcement.contactEmail && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <a href={`mailto:${announcement.contactEmail}`} className="font-medium text-primary hover:underline">
                      {announcement.contactEmail}
                    </a>
                  </div>
                )}
                {announcement.ctaLabel && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">CTA:</span>{' '}
                    {announcement.ctaUrl ? (
                      <a href={announcement.ctaUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                        {announcement.ctaLabel}
                      </a>
                    ) : (
                      <span className="font-medium">{announcement.ctaLabel}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Incoming Officers */}
          {announcement.officerItems && announcement.officerItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incoming Officers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcement.officerItems.map((item: OfficerItem, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.photo?.imageUrl && (
                        <img src={item.photo.imageUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outgoing Officers */}
          {announcement.outgoingOfficerItems && announcement.outgoingOfficerItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outgoing Officers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcement.outgoingOfficerItems.map((item: OfficerItem, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.photo?.imageUrl && (
                        <img src={item.photo.imageUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Awards */}
          {announcement.awardItems && announcement.awardItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcement.awardItems.map((item: AwardItem, i: number) => (
                    <div key={i} className={i > 0 ? 'border-t pt-4' : ''}>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Recipient: {item.recipient}</p>
                      {item.category && (
                        <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {announcement.attachmentItems && announcement.attachmentItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {announcement.attachmentItems.map((item: AttachmentItem, i: number) => (
                    <div key={i}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {item.label}
                      </a>
                      {item.fileSize && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({(item.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {announcement.approvalSummary && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Approval Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusBadgeClass(status)}>
                    {status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <ApprovalTimeline
                  actions={approvalHistoryData?.data?.actions}
                  loading={approvalHistoryData === undefined}
                />

                {showApproveReject && (
                  <div className="flex gap-2 pt-2 border-t">
                    {(hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT)) && (
                      <Button
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        variant="outline"
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                    )}
                    {(hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT)) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Workflow action buttons */}
      <div className="flex gap-2">
        {status === NewsStatus.DRAFT && (
          <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        )}
        {(status === NewsStatus.DRAFT || status === NewsStatus.APPROVED) && (
          <Button
            variant="outline"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        )}
        {status === NewsStatus.PUBLISHED && (
          <Button
            variant="outline"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
          </Button>
        )}
      </div>

      <RejectionReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={async (reason) => rejectMutation.mutate(reason)}
        title="Reject Announcement"
        itemTitle={announcement?.title}
      />

      <AnnouncementForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        announcement={announcement}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'announcement', announcementId] });
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
}
