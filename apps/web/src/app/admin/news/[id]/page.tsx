'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newsAPI } from '@/lib/api/news';
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
import { Permission, NewsStatus, ContentSection } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ApprovalTimeline } from '@/components/admin/ApprovalTimeline';
import { RejectionReasonDialog } from '@/components/admin/RejectionReasonDialog';
import { useApprovalHistory } from '@/hooks/use-approval-queue';
import { NewsForm } from '@/components/admin/NewsForm';

export default function AdminNewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const newsId = params.id as string;
  const { canAccessNewsModule, hasPermission, hasAnyScopedPermission } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessNewsModule());

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['admin', 'news', newsId],
    queryFn: () => newsAPI.getById(newsId),
    enabled: !!newsId,
  });

  const { data: approvalHistoryData } = useApprovalHistory('news', newsId);

  const submitMutation = useMutation({
    mutationFn: () => newsAPI.submit(newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news', newsId] });
      appToast.success('Submitted', 'News has been submitted for approval.');
    },
    onError: () => {
      appToast.error('Submission Failed', 'Could not submit news for approval.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => newsAPI.approve(newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news', newsId] });
      appToast.success('Approved', 'News has been approved.');
    },
    onError: () => {
      appToast.error('Approval Failed', 'Could not approve news.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => newsAPI.reject(newsId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news', newsId] });
      appToast.success('Rejected', 'News has been rejected.');
    },
    onError: () => {
      appToast.error('Rejection Failed', 'Could not reject news.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => newsAPI.publish(newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news', newsId] });
      appToast.success('Published', 'News has been published.');
    },
    onError: () => {
      appToast.error('Publish Failed', 'Could not publish news.');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => newsAPI.archive(newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news', newsId] });
      appToast.success('Archived', 'News has been archived.');
    },
    onError: () => {
      appToast.error('Archive Failed', 'Could not archive news.');
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

  const news = newsData?.data?.news;

  if (!news) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">News article not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/news')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
        </Button>
      </div>
    );
  }

  const authorName = typeof news.author === 'object'
    ? `${news.author.firstName} ${news.author.lastName}`
    : 'Unknown';

  const showApproveReject = news.status === NewsStatus.PENDING_APPROVAL &&
    (hasPermission(Permission.APPROVE_CONTENT) || hasAnyScopedPermission(Permission.APPROVE_CONTENT) ||
     hasPermission(Permission.REJECT_CONTENT) || hasAnyScopedPermission(Permission.REJECT_CONTENT));

  const getStatusBadgeClass = (status: NewsStatus) => {
    switch (status) {
      case NewsStatus.APPROVED: return 'bg-blue-600';
      case NewsStatus.REJECTED: return 'bg-red-600';
      case NewsStatus.PENDING_APPROVAL: return 'bg-amber-500';
      case NewsStatus.PUBLISHED: return '';
      case NewsStatus.DRAFT: return 'bg-secondary';
      case NewsStatus.ARCHIVED: return 'bg-gray-500';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/news')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{news.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                By {authorName} &middot; {format(new Date(news.createdAt), 'MMM dd, yyyy h:mm a')}
                {news.updatedAt !== news.createdAt && ` · Updated ${format(new Date(news.updatedAt), 'MMM dd, yyyy')}`}
              </p>
            </div>
            <Badge className={getStatusBadgeClass(news.status)}>
              {news.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {news.excerpt && (
            <p className="text-muted-foreground italic">{news.excerpt}</p>
          )}

          {news.coverImage && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img
                src={news.coverImage.imageUrl}
                alt={news.coverImage.alt ?? news.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {news.bodyHtml && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: news.bodyHtml }}
            />
          )}

          {news.sections && news.sections.length > 0 && (
            <div className="space-y-4">
              {news.sections.map((section: ContentSection, i: number) => (
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

          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {news.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          {(news.category || news.featured || news.pinned || news.spotlightLabel || news.sourceUrl || typeof news.readingTime === 'number') && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h3>
              <div className="flex flex-wrap gap-2">
                {news.category && (
                  <Badge variant="outline">{news.category}</Badge>
                )}
                {news.featured && (
                  <Badge className="bg-yellow-500">Featured</Badge>
                )}
                {news.pinned && (
                  <Badge className="bg-purple-500">Pinned</Badge>
                )}
              </div>
              {news.spotlightLabel && (
                <p className="text-sm"><span className="text-muted-foreground">Spotlight:</span> {news.spotlightLabel}</p>
              )}
              {news.sourceUrl && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Source:</span>{' '}
                  <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{news.sourceUrl}</a>
                </p>
              )}
              {typeof news.readingTime === 'number' && (
                <p className="text-sm"><span className="text-muted-foreground">Reading Time:</span> {news.readingTime} min</p>
              )}
            </div>
          )}

          {/* Author Info */}
          {(news.authorDisplayName || news.authorRole) && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Author Info</h3>
              {news.authorDisplayName && (
                <p className="text-sm"><span className="text-muted-foreground">Display Name:</span> {news.authorDisplayName}</p>
              )}
              {news.authorRole && (
                <p className="text-sm"><span className="text-muted-foreground">Role:</span> {news.authorRole}</p>
              )}
            </div>
          )}

          {/* Related Content */}
          {(news.associatedEventId || news.associatedOrganizationId || (news.relatedArticleIds && news.relatedArticleIds.length > 0)) && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Related Content</h3>
              {news.associatedEventId && (
                <p className="text-sm"><span className="text-muted-foreground">Event ID:</span> {news.associatedEventId}</p>
              )}
              {news.associatedOrganizationId && (
                <p className="text-sm"><span className="text-muted-foreground">Organization ID:</span> {news.associatedOrganizationId}</p>
              )}
              {news.relatedArticleIds && news.relatedArticleIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-sm text-muted-foreground">Related Articles:</span>
                  {news.relatedArticleIds.map((id: string) => (
                    <Badge key={id} variant="secondary" className="text-xs">{id}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEO */}
          {(news.seoDescription || news.canonicalSlug) && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SEO</h3>
              {news.seoDescription && (
                <p className="text-sm"><span className="text-muted-foreground">Description:</span> {news.seoDescription}</p>
              )}
              {news.canonicalSlug && (
                <p className="text-sm"><span className="text-muted-foreground">Canonical Slug:</span> {news.canonicalSlug}</p>
              )}
            </div>
          )}

          {/* Reference Links */}
          {news.referenceLinks && news.referenceLinks.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reference Links</h3>
              <ul className="space-y-1">
                {news.referenceLinks.map((link: { label: string; url: string }, i: number) => (
                  <li key={i}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attachments */}
          {news.attachmentItems && news.attachmentItems.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attachments</h3>
              <ul className="space-y-2">
                {news.attachmentItems.map((item: { label: string; url: string; fileType?: string; fileSize?: number }, i: number) => (
                  <li key={i}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {item.label}
                    </a>
                    {(item.fileType || typeof item.fileSize === 'number') && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({[item.fileType, typeof item.fileSize === 'number' ? `${item.fileSize} bytes` : ''].filter(Boolean).join(', ')})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {news.approvalSummary && (
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
                  <Badge className={getStatusBadgeClass(news.status)}>
                    {news.status.replace(/_/g, ' ')}
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
        {news.status === NewsStatus.DRAFT && (
          <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        )}
        {(news.status === NewsStatus.DRAFT || news.status === NewsStatus.APPROVED) && (
          <Button
            variant="outline"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        )}
        {news.status === NewsStatus.PUBLISHED && (
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
        title="Reject News"
        itemTitle={news?.title}
      />

      <NewsForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        news={news}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'news', newsId] });
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
}
