'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bell, CalendarDays, Loader2, Newspaper, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Announcement, ContentOwnerType, News, NewsStatus } from '@/types';
import { useNews } from '@/hooks/use-news';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { Event, eventAPI } from '@/lib/api/event';

interface OrganizationContentPreviewProps {
  organizationId: string;
  organizationName: string;
  compact?: boolean;
}

type ContentPreviewItem = News | Announcement | Event;

interface ContentGroup {
  key: string;
  title: string;
  icon: LucideIcon;
  items: ContentPreviewItem[];
  empty: string;
  hrefFor: (id: string) => string;
  dateFor: (item: ContentPreviewItem) => string;
  summaryFor: (item: ContentPreviewItem) => string;
}

export default function OrganizationContentPreview({
  organizationId,
  organizationName,
  compact = false,
}: OrganizationContentPreviewProps) {
  const limit = compact ? 2 : 4;
  const { data: newsData, isLoading: newsLoading } = useNews(1, limit, NewsStatus.PUBLISHED, {
    ownerType: ContentOwnerType.ORGANIZATION,
    organizationId,
  });
  const {
    data: announcementsData,
    isLoading: announcementsLoading,
  } = useGetAnnouncements(
    1,
    limit,
    undefined,
    undefined,
    true,
    ContentOwnerType.ORGANIZATION,
    organizationId
  );
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'organization', organizationId, limit],
    queryFn: () =>
      eventAPI.getAll({
        limit,
        status: 'published',
        ownerType: ContentOwnerType.ORGANIZATION,
        organizationId,
      }),
    staleTime: 0,
  });

  const isLoading = newsLoading || announcementsLoading || eventsLoading;

  const groups: ContentGroup[] = [
    {
      key: 'news',
      title: 'Latest News',
      icon: Newspaper,
      items: newsData?.news ?? [],
      empty: `No published news for ${organizationName} yet.`,
      hrefFor: (id: string) => `/news/${id}`,
      dateFor: (item) =>
        'publishedAt' in item && item.publishedAt ? item.publishedAt : item.createdAt,
      summaryFor: (item) => ('excerpt' in item ? item.excerpt : '') ?? '',
    },
    {
      key: 'announcements',
      title: 'Announcements',
      icon: Bell,
      items: announcementsData?.data ?? [],
      empty: `No active announcements for ${organizationName} yet.`,
      hrefFor: (id: string) => `/announcements/${id}`,
      dateFor: (item) =>
        'publishedAt' in item && item.publishedAt ? item.publishedAt : item.createdAt,
      summaryFor: (item) =>
        ('content' in item ? item.content : '') || ('bodyHtml' in item ? item.bodyHtml : '') || '',
    },
    {
      key: 'events',
      title: 'Events',
      icon: CalendarDays,
      items: eventsData?.data.events ?? [],
      empty: `No published events for ${organizationName} yet.`,
      hrefFor: (id: string) => `/events/${id}`,
      dateFor: (item) => ('startDate' in item ? item.startDate : undefined) ?? item.createdAt,
      summaryFor: (item) =>
        ('excerpt' in item ? item.excerpt : '') || ('location' in item ? item.location : '') || '',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Latest from {organizationName}</h3>
          <p className="text-sm text-muted-foreground">
            Published updates, announcements, and events for this organization.
          </p>
        </div>
        {!compact ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/organization/${organizationId}`}>Open organization page</Link>
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-border/40 bg-card/70">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.key} className="border-border/40 bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                      {group.empty}
                    </div>
                  ) : (
                    group.items.map((item) => (
                      <Link
                        key={item._id}
                        href={group.hrefFor(item._id)}
                        className="block rounded-xl border border-border/40 bg-background/50 p-4 transition-colors hover:border-primary/30 hover:bg-background"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {group.title}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(group.dateFor(item)), compact ? 'MMM d' : 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h4 className="line-clamp-2 text-sm font-semibold text-foreground">
                          {item.title}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {String(group.summaryFor(item)).replace(/<[^>]+>/g, '')}
                        </p>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
