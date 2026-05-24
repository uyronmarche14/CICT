'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Calendar, Loader2, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAnnouncementById } from '@/hooks/ui/announcement/get-announcement-by-id.hook';
import { StructuredContent } from '@/components/StructuredContent';
import ScrollingGallery from '@/components/ScrollingGallery';
import { getOwnershipLabel } from '@/lib/content-ownership';

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
