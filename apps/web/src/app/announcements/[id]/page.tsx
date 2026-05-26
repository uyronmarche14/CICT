'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Calendar, ExternalLink, Loader2, Paperclip, Share2, User } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAnnouncementById } from '@/hooks/ui/announcement/get-announcement-by-id.hook';
import { StructuredContent } from '@/components/StructuredContent';
import ScrollingGallery from '@/components/ScrollingGallery';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { SEOHead } from '@/components/SEOHead';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params.id as string;
  const { data: announcement, isLoading, error } = useGetAnnouncementById(announcementId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Announcement Not Found</h1>
          <p className="text-muted-foreground">
            The announcement you&apos;re looking for doesn&apos;t exist or is no longer public.
          </p>
          <Button onClick={() => router.push('/announcements')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
        </div>
      </div>
    );
  }

  const heroImage = announcement.coverImage?.imageUrl || announcement.imageUrl;
  const bodyHtml = announcement.bodyHtml || announcement.content || '';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={announcement.title}
        description={announcement.content || announcement.bodyHtml?.slice(0, 160) || ''}
        ogImage={announcement.coverImage?.imageUrl || announcement.imageUrl}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/announcements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Link>
        </Button>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge>
            {announcement.priority}
          </Badge>
          <Badge variant="outline">{announcement.type}</Badge>
          {announcement.subtype && <Badge variant="outline">{announcement.subtype}</Badge>}
          <Badge variant="outline">
            {getOwnershipLabel(announcement)}
          </Badge>
        </div>

        <h1 className="mb-6 text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
          {announcement.title}
        </h1>

        <div className="mb-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>{announcement.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(announcement.publishedAt ?? announcement.createdAt), 'MMMM d, yyyy')}
            </span>
          </div>
          {announcement.effectiveDate && (
            <span className="text-sm text-muted-foreground">
              Effective: {format(new Date(announcement.effectiveDate), 'MMMM d, yyyy')}
            </span>
          )}
        </div>

        {heroImage ? (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={announcement.coverImage?.alt || announcement.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <StructuredContent bodyHtml={bodyHtml} sections={announcement.sections} className="mb-12" />

        {announcement.officerItems?.length ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Incoming Officers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {announcement.officerItems!.map((officer, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-secondary/10">
                  {officer.photo ? (
                    <img src={officer.photo.imageUrl} alt={officer.photo.alt || officer.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : <User className="w-10 h-10 p-2 bg-muted rounded-full" />}
                  <div>
                    <p className="font-medium text-sm">{officer.position}</p>
                    <p className="text-sm text-muted-foreground">{officer.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {announcement.outgoingOfficerItems?.length ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Outgoing Officers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {announcement.outgoingOfficerItems!.map((officer, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-secondary/10">
                  {officer.photo ? (
                    <img src={officer.photo.imageUrl} alt={officer.photo.alt || officer.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : <User className="w-10 h-10 p-2 bg-muted rounded-full" />}
                  <div>
                    <p className="font-medium text-sm">{officer.position}</p>
                    <p className="text-sm text-muted-foreground">{officer.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {announcement.awardItems?.length ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Awards & Recognition</h3>
            <div className="space-y-3">
              {announcement.awardItems!.map((award, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <p className="font-medium">{award.title}</p>
                  <p className="text-sm text-muted-foreground">{award.recipient}</p>
                  {award.category && <Badge variant="outline" className="mt-2">{award.category}</Badge>}
                  {award.description && <p className="text-sm mt-2">{award.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {announcement.ctaLabel && announcement.ctaUrl && (
          <div className="mb-8">
            <a href={announcement.ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto">
                <ExternalLink className="w-4 h-4 mr-2" />
                {announcement.ctaLabel}
              </Button>
            </a>
          </div>
        )}

        {(announcement.contactName || announcement.contactEmail) && (
          <div className="mb-8 p-4 rounded-lg border bg-secondary/10">
            <h4 className="font-medium mb-2">Contact</h4>
            {announcement.contactName && <p className="text-sm">{announcement.contactName}</p>}
            {announcement.contactEmail && (
              <a href={`mailto:${announcement.contactEmail}`} className="text-sm text-primary hover:underline">
                {announcement.contactEmail}
              </a>
            )}
          </div>
        )}

        {announcement.attachmentItems?.length ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Attachments</h3>
            <div className="space-y-2">
              {announcement.attachmentItems!.map((att, i) => (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 p-3 rounded-lg border hover:bg-secondary/20 transition-colors">
                  <Paperclip className="w-4 h-4 text-primary" />
                  <span className="font-medium">{att.label}</span>
                  {att.fileSize && <span className="text-xs text-muted-foreground ml-auto">({(att.fileSize / 1024).toFixed(0)} KB)</span>}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {announcement.gallery?.length ? (
          <div className="mb-12">
            <ScrollingGallery
              images={announcement.gallery.map((image) => image.imageUrl)}
              accentColor="#7c3aed"
            />
          </div>
        ) : null}

        <div className="mb-12 flex items-center gap-4 border-y border-border/50 py-6">
          <span className="text-sm font-semibold text-foreground">Share this announcement:</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: announcement.title,
                  text: (announcement.content ?? '').slice(0, 160),
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </article>
    </div>
  );
}
