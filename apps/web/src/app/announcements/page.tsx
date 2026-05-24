'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Bell, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { AnnouncementPriority } from '@/types';
import { useState } from 'react';
import { getOwnershipLabel } from '@/lib/content-ownership';

const priorityLabelClass: Record<AnnouncementPriority, string> = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-yellow-500 text-black',
  high: 'bg-orange-500 text-white',
  urgent: 'bg-red-500 text-white',
};

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetAnnouncements(page, 9, undefined, undefined, true);
  const announcements = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold lg:text-6xl">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Announcements
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Official notices, reminders, and public updates from CICT and its student organizations.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">Failed to load announcements</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No announcements available.</div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {announcements.map((announcement) => (
                <Link
                  key={announcement._id}
                  href={`/announcements/${announcement._id}`}
                  className="group block"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    {(announcement.coverImage?.imageUrl || announcement.imageUrl) && (
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={announcement.coverImage?.imageUrl || announcement.imageUrl}
                          alt={announcement.coverImage?.alt || announcement.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <Badge className={priorityLabelClass[announcement.priority]}>
                          {announcement.priority}
                        </Badge>
                        <Badge variant="outline">
                          {getOwnershipLabel(announcement)}
                        </Badge>
                      </div>

                      <h2 className="mb-3 line-clamp-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {announcement.title}
                      </h2>

                      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(
                            new Date(announcement.publishedAt ?? announcement.createdAt),
                            'MMM d, yyyy'
                          )}
                        </span>
                      </div>

                      <p className="line-clamp-4 flex-1 text-sm text-muted-foreground">
                        {(announcement.content ?? announcement.bodyHtml ?? '').replace(/<[^>]+>/g, '')}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                        <Bell className="h-4 w-4" />
                        View announcement
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {pagination && pagination.pages > 1 ? (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
