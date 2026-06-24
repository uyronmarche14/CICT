'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Trophy, Sparkles } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganizations';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { useNews } from '@/hooks/use-news';
import { eventAPI } from '@/lib/api/event';
import { ContentOwnerType, NewsStatus } from '@/types';
import type { Announcement, News, OrganizationMember } from '@/types';
import type { OrganizationPage } from '@/lib/data/organizationPages';
import { organizationPages } from '@/lib/data/organizationPages';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import HeroSection from '@/components/organizations/sections/HeroSection';
import { EventCarousel } from '@/components/events/EventCarousel';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const { organization, loading, error } = useOrganization(orgId);

  // Merge API data with static page data
  const staticPage = organizationPages.find((p) => p.id === orgId);
  const organizationPage: OrganizationPage | null = organization && staticPage
    ? {
        ...staticPage,
        id: organization.id,
        name: organization.name,
        fullName: organization.fullName,
        description: organization.description,
        mission: organization.mission,
        vision: organization.vision,
        established: organization.established,
        heroImage: organization.banner,
        logo: organization.logo,
        color: {
          primary: organization.color.primary,
          secondary: organization.color.secondary,
        },
        achievements: organization.achievements ?? staticPage.achievements,
      }
    : null;

  const limit = 6;
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'org', orgId, limit],
    queryFn: () => eventAPI.getAll({ limit, status: 'published', ownerType: ContentOwnerType.ORGANIZATION, organizationId: orgId }),
    staleTime: 0,
  });
  const { data: announcementsData, isLoading: announcementsLoading } = useGetAnnouncements(1, limit, undefined, undefined, true, ContentOwnerType.ORGANIZATION, orgId);
  const { data: newsData, isLoading: newsLoading } = useNews(1, limit, NewsStatus.PUBLISHED, { ownerType: ContentOwnerType.ORGANIZATION, organizationId: orgId });

  const apiEvents = eventsData?.data?.events ?? [];
  const announcements = announcementsData?.data ?? [];
  const news = newsData?.news ?? [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !organization || !organizationPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Not Found</h1>
          <p className="text-muted-foreground">The organization you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  const { color, mission, vision, established, achievements, programs: activities, events: timelineEvents, benefits, joinInfo } = organizationPage;
  const values = organization.values;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <HeroSection org={organizationPage} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">

        {/* 1. About */}
        <section className="py-14 border-b border-border">
          <div className="max-w-3xl">
            <SectionHeader title="About" />
            <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground">
              {organizationPage.description}
            </p>
          </div>
        </section>

        {/* 2. Mission & Vision */}
        <section className="py-14 border-b border-border">
          <SectionHeader title="Mission &amp; Vision" subtitle="Core purpose and future direction" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-5xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: color.primary }}>Mission</p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{mission}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: color.secondary }}>Vision</p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{vision}</p>
            </div>
          </div>
        </section>

        {/* 3. Metadata row */}
        <section className="py-10 border-b border-border">
          <SectionHeader title="Overview" />
          <div className="grid grid-cols-3 gap-8 max-w-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Established</p>
              <p className="text-xl font-bold text-foreground">{established}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Core Values</p>
              <p className="text-xl font-bold text-foreground">{values?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Achievements</p>
              <p className="text-xl font-bold text-foreground">{achievements?.length ?? 0}</p>
            </div>
          </div>
          {values && values.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {values.map((v, i) => (
                <span key={i} className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/80 text-foreground border border-border/50">
                  {v}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* 4. Activities */}
        {activities && activities.length > 0 && (
          <section className="py-14 border-b border-border">
            <SectionHeader title="Activities" subtitle="Programs and initiatives" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {activities.map((a, i) => (
                <Card key={i} className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <CardContent>
                    <h3 className="text-base font-bold text-foreground">{a.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 5. Achievements */}
        {achievements && achievements.length > 0 && (
          <section className="py-14 border-b border-border">
            <SectionHeader title="Achievements" subtitle="Awards and recognition" />
            <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none">
              {achievements.map((a, i) => {
                const yearMatch = a.match(/\d{4}/);
                const year = yearMatch?.[0] ?? `#${i + 1}`;
                const label = a.replace(/\d{4}/g, '').replace(/\s+/g, ' ').trim();
                return (
                  <Card key={i} className="w-[150px] shrink-0 snap-start text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md">
                    <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-foreground">{year}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight line-clamp-3">{label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Benefits */}
        {benefits && benefits.length > 0 && (
          <section className="py-14 border-b border-border">
            <SectionHeader title="Benefits" subtitle="Why join this organization" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
              {benefits.map((b, i) => (
                <Card key={i} className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <CardContent className="flex items-start gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{b}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 7. Events Timeline */}
        {timelineEvents && timelineEvents.length > 0 && (
          <section className="py-14 border-b border-border">
            <SectionHeader title="Events Timeline" subtitle="Key dates and gatherings" />
            <div className="space-y-0 max-w-3xl">
              {timelineEvents.map((event, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-background group-hover:scale-125 transition-transform duration-300" />
                    {i < timelineEvents.length - 1 && <div className="w-0.5 flex-1 bg-border group-hover:bg-primary/30 transition-colors duration-300" />}
                  </div>
                  <div className="flex-1 pb-10 group-hover:translate-x-1 transition-transform duration-300">
                    <Badge variant="outline" className="text-[10px] uppercase mb-1.5">{event.frequency}</Badge>
                    <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                    <p className="text-base text-muted-foreground mt-1.5 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Events Carousel */}
        <section className="py-14 border-b border-border">
          <SectionHeader title="Upcoming Events" />
          {eventsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading events...</div>
          ) : apiEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events available at this time.</p>
          ) : (
            <div className="max-w-2xl">
              <EventCarousel events={apiEvents.slice(0, 5)} />
            </div>
          )}
        </section>

        {/* 9. Announcements */}
        <section className="py-14 border-b border-border">
          <SectionHeader title="Announcements" subtitle="Latest updates" />
          {announcementsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements available.</p>
          ) : (
            <div className="space-y-4 max-w-2xl">
              {announcements.slice(0, 5).map((a: Announcement) => (
                <Card key={a._id} className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-6">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <h4 className="mb-1 text-base font-bold text-foreground">{a.title}</h4>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{a.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 10. News */}
        <section className="py-14 border-b border-border">
          <SectionHeader title="Latest News" subtitle="Recent articles" />
          {newsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading news...</div>
          ) : news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No news available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
              {news.slice(0, 4).map((item: News) => (
                <Card key={item._id} className="border-t-2 border-t-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <CardContent>
                    <Badge variant="outline" className="mb-2 text-[10px] uppercase">News</Badge>
                    <h4 className="mb-1 text-lg font-bold text-foreground">{item.title}</h4>
                    <p className="line-clamp-3 text-base text-muted-foreground">{item.excerpt ?? item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 11. Team */}
        {organization.members && organization.members.length > 0 && (
          <section className="py-14 border-t border-border">
            <SectionHeader title="Team" subtitle="Meet the people behind it" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {organization.members.slice(0, 8).map((member: OrganizationMember) => (
                <Card key={member.id} className="text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <CardContent>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-base font-bold text-muted-foreground">
                      {member.name?.charAt(0) ?? '?'}
                    </div>
                    <p className="text-base font-semibold text-foreground">{member.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{member.position}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 12. Join Us */}
        {joinInfo && (
          <section className="py-14">
            <SectionHeader title="Join Us" subtitle="Become a member" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {joinInfo.requirements && joinInfo.requirements.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">Requirements</p>
                  <ul className="space-y-2">
                    {joinInfo.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {joinInfo.process && joinInfo.process.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">Process</p>
                  <ul className="space-y-2">
                    {joinInfo.process.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {joinInfo.contact && (
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">Contact</p>
                  <p className="text-sm text-muted-foreground">{joinInfo.contact}</p>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
