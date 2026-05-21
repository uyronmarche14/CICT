'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowRight, Bell, Calendar, Loader2, Newspaper, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Announcement, ContentOwnerType, News, NewsStatus } from '@/types';
import { useNews } from '@/hooks/use-news';
import { eventAPI } from '@/lib/api/event';
import AnnouncementsCarousel from '@/components/announcements-carousel';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { Event } from '@/lib/api/event';
import { getOwnershipLabel } from '@/lib/content-ownership';
import PublicSectionHeader from '@/components/sections/landingpage/PublicSectionHeader';
import { useOrganizations } from '@/hooks/useOrganizations';

type CommunityHighlight = {
  id: string;
  title: string;
  summary: string;
  href: string;
  date: string;
  kind: 'News' | 'Announcement' | 'Event';
  ownershipLabel: string;
};

export default function NewsSection() {
  const { organizations } = useOrganizations();
  const { data: officialNewsData, isLoading: officialNewsLoading } = useNews(
    1, 3, NewsStatus.PUBLISHED, { ownerType: ContentOwnerType.SYSTEM }
  );
  const { data: orgNewsData, isLoading: orgNewsLoading } = useNews(
    1, 4, NewsStatus.PUBLISHED, { ownerType: ContentOwnerType.ORGANIZATION }
  );
  const { data: officialEventsData, isLoading: officialEventsLoading } = useQuery({
    queryKey: ['events', 'landing', 'system'],
    queryFn: () => eventAPI.getAll({ limit: 3, status: 'published', upcoming: true, ownerType: ContentOwnerType.SYSTEM }),
    staleTime: 0,
  });
  const { data: orgEventsData, isLoading: orgEventsLoading } = useQuery({
    queryKey: ['events', 'landing', 'organization'],
    queryFn: () => eventAPI.getAll({ limit: 4, status: 'published', ownerType: ContentOwnerType.ORGANIZATION }),
    staleTime: 0,
  });
  const { data: orgAnnouncementsData, isLoading: orgAnnouncementsLoading } = useGetAnnouncements(
    1, 4, undefined, undefined, true, ContentOwnerType.ORGANIZATION
  );

  const latestOfficialNews = officialNewsData?.news ?? [];
  const latestOfficialEvents = officialEventsData?.data.events ?? [];
  const communityHighlights = [
    ...(orgNewsData?.news ?? []).map<CommunityHighlight>((article: News) => ({
      id: article._id, title: article.title, summary: article.excerpt,
      href: `/news/${article._id}`, date: article.publishedAt ?? article.createdAt,
      kind: 'News', ownershipLabel: getOwnershipLabel(article),
    })),
    ...(orgAnnouncementsData?.data ?? []).map<CommunityHighlight>((a: Announcement) => ({
      id: a._id, title: a.title,
      summary: (a.content ?? a.bodyHtml ?? '').replace(/<[^>]+>/g, ' '),
      href: `/announcements/${a._id}`, date: a.publishedAt ?? a.createdAt,
      kind: 'Announcement', ownershipLabel: getOwnershipLabel(a),
    })),
    ...(orgEventsData?.data.events ?? []).map<CommunityHighlight>((event: Event) => ({
      id: event._id, title: event.title, summary: event.excerpt || event.location,
      href: `/events/${event._id}`, date: event.startDate,
      kind: 'Event', ownershipLabel: getOwnershipLabel(event),
    })),
  ]
    .sort((l, r) => new Date(r.date).getTime() - new Date(l.date).getTime())
    .slice(0, 4);

  const isLoading =
    officialNewsLoading || officialEventsLoading ||
    orgNewsLoading || orgEventsLoading || orgAnnouncementsLoading;

  const organizationsHref = organizations[0] ? `/organization/${organizations[0].id}` : '/updates';

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <PublicSectionHeader
            eyebrow="Latest Updates"
            title="Fresh updates from CICT and the campus community"
            description="Official updates and organization highlights, sourced directly from the CMS."
            align="start"
            className="max-w-xl"
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/updates">
                Updates hub
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/events">Events</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/announcements">Announcements</Link>
            </Button>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ── Main 3-col grid ── */}
            <div className="grid gap-px rounded-2xl border border-border/40 bg-border/40 overflow-hidden md:grid-cols-3">

              {/* Official News */}
              <div className="flex flex-col bg-card px-5 py-6">
                <div className="mb-5 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Official News</span>
                </div>

                {latestOfficialNews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published official news yet.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-border/40">
                    {latestOfficialNews.map((article) => (
                      <Link
                        key={article._id}
                        href={`/news/${article._id}`}
                        className="group flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0 transition-colors hover:text-primary"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {getOwnershipLabel(article, 'CICT Official')}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(article.publishedAt ?? article.createdAt), 'MMM d')}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {article.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-5">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 text-xs">
                    <Link href="/news">
                      All news
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Official Announcements */}
              <div className="flex flex-col bg-card px-5 py-6">
                <AnnouncementsCarousel
                  limit={5}
                  ownerType={ContentOwnerType.SYSTEM}
                  title="Official Announcements"
                />
              </div>

              {/* Community Highlights */}
              <div className="flex flex-col bg-card px-5 py-6">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Community</span>
                </div>

                {communityHighlights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No organization highlights yet.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-border/40">
                    {communityHighlights.map((item) => (
                      <Link
                        key={`${item.kind}-${item.id}`}
                        href={item.href}
                        className="group flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {item.kind}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(item.date), 'MMM d')}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {item.ownershipLabel}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-5">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 text-xs">
                    <Link href={organizationsHref}>
                      Explore organizations
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Upcoming Events strip ── */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Upcoming Events</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                  <Link href="/events">
                    All events
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {latestOfficialEvents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/50 px-5 py-6 text-sm text-muted-foreground">
                  No upcoming official events right now.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {latestOfficialEvents.map((event) => (
                    <Link
                      key={event._id}
                      href={`/events/${event._id}`}
                      className="group flex flex-col gap-2 rounded-xl border border-border/40 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-card/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          {getOwnershipLabel(event, 'CICT Official')}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(event.startDate), 'MMM d')}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      {event.location ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Bell className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}