'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CldImage } from 'next-cloudinary';
import { Calendar, Newspaper, Megaphone, Clock, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/hooks/useOrganizations';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { useNews } from '@/hooks/use-news';
import { eventAPI, type Event } from '@/lib/api/event';
import { ContentOwnerType, NewsStatus } from '@/types';
import type { Announcement, News, OrganizationMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const TABS = [
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'news', label: 'News', icon: Newspaper },
];

interface OrganizationShowcaseProps {
  organizationId: string;
}

export default function OrganizationShowcase({ organizationId }: OrganizationShowcaseProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [tabPaused, setTabPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const { organization, loading } = useOrganization(organizationId);

  const orgId = organizationId;
  const limit = 4;

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'org', orgId, limit],
    queryFn: () =>
      eventAPI.getAll({ limit, status: 'published', ownerType: ContentOwnerType.ORGANIZATION, organizationId: orgId }),
    staleTime: 0,
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useGetAnnouncements(
    1, limit, undefined, undefined, true, ContentOwnerType.ORGANIZATION, orgId
  );

  const { data: newsData, isLoading: newsLoading } = useNews(
    1, limit, NewsStatus.PUBLISHED, { ownerType: ContentOwnerType.ORGANIZATION, organizationId: orgId }
  );

  const events = eventsData?.data?.events ?? [];
  const announcements = announcementsData?.data ?? [];
  const news = newsData?.news ?? [];

  // Auto-rotation
  useEffect(() => {
    if (tabPaused) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          const idx = TABS.findIndex((t) => t.id === activeTab);
          setActiveTab(TABS[(idx + 1) % TABS.length].id);
          return 0;
        }
        return p + 1;
      });
    }, 120);
    return () => clearInterval(t);
  }, [activeTab, tabPaused]);

  useEffect(() => {
    setProgress(0);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const { color, name, fullName, description, banner, logo, mission, vision } = organization;

  const renderContent = () => {
    if (activeTab === 'events') {
      if (eventsLoading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading events...</div>;
      if (events.length === 0) return <p className="text-sm text-muted-foreground">No events available.</p>;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event: Event) => (
            <div key={event._id} className="rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <Badge variant="outline" className="text-[10px] uppercase mb-2">Event</Badge>
              <h4 className="font-bold text-foreground text-base mb-1">{event.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{event.excerpt ?? event.description}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="default" className="gap-1.5 h-8 text-xs" asChild>
                  <Link href={`/events/${event._id}`}>
                    <ExternalLink className="w-3 h-3" /> Register
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" className="gap-1 h-8 text-xs" asChild>
                  <Link href={`/events/${event._id}`}>
                    Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'announcements') {
      if (announcementsLoading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading announcements...</div>;
      if (announcements.length === 0) return <p className="text-sm text-muted-foreground">No announcements available.</p>;
      return (
        <div className="space-y-3">
          {announcements.map((a: Announcement) => (
            <div key={a._id} className="rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <Badge variant="outline" className="text-[10px] uppercase mb-2">Announcement</Badge>
              <h4 className="font-bold text-foreground text-base mb-1">{a.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'news') {
      if (newsLoading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading news...</div>;
      if (news.length === 0) return <p className="text-sm text-muted-foreground">No news available.</p>;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {news.map((item: News) => (
            <div key={item._id} className="rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <Badge variant="outline" className="text-[10px] uppercase mb-2">News</Badge>
              <h4 className="font-bold text-foreground text-base mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt ?? item.content}</p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full p-8 md:p-10 lg:p-12">
      {/* Title + Description */}
      <div className="flex items-start gap-5 mb-8">
        {logo && (
          <div className="shrink-0 relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-background shadow-md">
            <img src={logo} alt={name} className="h-12 w-12 sm:h-14 sm:w-14 object-contain" />
          </div>
        )}
        <div className="min-w-0">
          <Badge
            className="px-3 py-1.5 text-sm font-semibold border-0 mb-3"
            style={{ backgroundColor: color.primary, color: '#fff' }}
          >
            {name}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {fullName}
          </h2>
        </div>
      </div>

      {/* Full-width banner image */}
      <div className="relative h-80 sm:h-96 lg:h-[500px] rounded-xl overflow-hidden mb-10 shadow-xl ring-1 ring-border/10">
        <CldImage
          src={banner}
          alt={`${name} banner`}
          fill
          className={cn(
            "object-cover transition-all duration-700 ease-out",
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          sizes="100vw"
          onLoad={() => setImageLoaded(true)}
          priority
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* About */}
      <div className="max-w-3xl mb-10">
        <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {/* Mission | Vision - clean 50/50 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: color.primary }}>Mission</p>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{mission}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: color.secondary }}>Vision</p>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{vision}</p>
        </div>
      </div>

      {/* Org metadata */}
      <div className="grid grid-cols-3 gap-8 border-t border-border pt-6 mb-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Established</p>
          <p className="text-base font-bold text-foreground">{organization.established}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Core Values</p>
          <p className="text-base font-bold text-foreground">{organization.values?.length ?? 0}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Achievements</p>
          <p className="text-base font-bold text-foreground">{organization.achievements?.length ?? 0}</p>
        </div>
      </div>

      {/* Officer Roster */}
      {organization.members && organization.members.length > 0 && (
        <div className="border-t border-border pt-8 mb-8">
          <div className="h-px w-6 bg-primary/30 mb-3" />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">Officers &amp; Advisers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {organization.members.slice(0, 8).map((member: OrganizationMember) => (
              <div key={member.id} className="rounded-xl border border-border p-5 text-center hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 bg-card">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 overflow-hidden flex items-center justify-center">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-muted-foreground">
                      {member.name?.charAt(0) ?? '?'}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-foreground text-base">{member.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar + Content tabs */}
      <div className="flex flex-col md:flex-row gap-0 border-t border-border pt-8">
        <aside
          className="md:w-[180px] md:shrink-0 md:border-r md:border-border md:pr-4 md:space-y-1 mb-4 md:mb-0"
          onMouseEnter={() => setTabPaused(true)}
          onMouseLeave={() => setTabPaused(false)}
        >
          <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 md:pl-8 lg:pl-10">
          {/* Tab header - mobile only (desktop uses sidebar) */}
          <div className="md:hidden flex items-center gap-3 mb-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 text-sm transition-all ${
                    activeTab === tab.id ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> Auto-rotating
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-muted rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
          </div>

          {renderContent()}
        </section>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-10">
        <a
          href={`/organization/${organization.id}`}
          className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:gap-3"
          style={{ backgroundColor: color.primary }}
        >
          <span>Explore {name}</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
