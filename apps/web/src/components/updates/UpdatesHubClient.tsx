'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Loader2,
  Newspaper,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PublicSectionHeader from '@/components/sections/landingpage/PublicSectionHeader';
import UpdateFeedCard from '@/components/updates/UpdateFeedCard';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useUpdatesHub } from '@/hooks/use-updates-hub';
import { cn } from '@/lib/utils';
import {
  createUpdatesHubSearchParams,
  filterOrganizationsWithActivity,
  formatDate,
  getKindLabel,
  parseUpdatesHubFilters,
  type UpdatesHubFilters,
  UPDATES_HUB_CATEGORY_OPTIONS,
  UPDATES_HUB_SCOPE_OPTIONS,
} from '@/lib/updates-hub';

const sidebarButtonClass =
  'w-full justify-start rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium transition-all';

const mobileFilterButtonClass =
  'rounded-full border px-3 py-1 text-xs font-medium transition-all';

const railScrollClass =
  'xl:max-h-[calc(100vh-7.25rem)] xl:overflow-y-auto xl:pr-1';

const feedScrollClass =
  'space-y-4 xl:max-h-[calc(100vh-7.25rem)] xl:overflow-y-auto xl:pr-2';

export default function UpdatesHubClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseUpdatesHubFilters(searchParams),
    [searchParams]
  );
  const [searchDraft, setSearchDraft] = useState(filters.q ?? '');

  useEffect(() => {
    setSearchDraft(filters.q ?? '');
  }, [filters.q]);

  const {
    visibleItems,
    totalLoadedItems,
    visibleCount,
    hasMore,
    isInitialLoading,
    isFetchingMore,
    error,
    loadMore,
    topPriorityAnnouncement,
    upcomingEvent,
    latestOfficialUpdate,
    activeOrganizations,
    availableOrganizationIds,
  } = useUpdatesHub(filters);
  const { organizations, loading: organizationsLoading } = useOrganizations();

  const availableOrganizations = useMemo(
    () => filterOrganizationsWithActivity(organizations, availableOrganizationIds),
    [availableOrganizationIds, organizations]
  );

  const updateFilters = (patch: Partial<UpdatesHubFilters>) => {
    const nextParams = createUpdatesHubSearchParams({
      ...filters,
      ...patch,
      org:
        patch.scope === 'official'
          ? undefined
          : patch.org !== undefined
            ? patch.org || undefined
            : filters.org,
    });

    router.replace(
      nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname,
      { scroll: false }
    );
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ q: searchDraft || undefined });
  };

  const clearAllFilters = () => {
    setSearchDraft('');
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    filters.category !== 'all' || filters.scope !== 'all' || !!filters.org || !!filters.q;
  const showOrganizationFilters = filters.scope !== 'official';

  return (
    <main className="relative min-h-screen bg-background pb-16 pt-24 text-foreground md:pt-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-24 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 right-[-4%] h-80 w-80 rounded-full bg-secondary/8 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <PublicSectionHeader
          eyebrow="Updates Hub"
          title="Campus updates in one place"
          description="Browse public CICT news, announcements, events, and organization activity through one cleaner, easier-to-scan feed."
          className="max-w-4xl"
          titleClassName="text-3xl md:text-4xl lg:text-[3.15rem]"
          descriptionClassName="text-base leading-8 md:text-lg"
        />

        <div className="grid gap-5 xl:min-h-[calc(100vh-16rem)] xl:grid-cols-[200px_minmax(0,1fr)_240px] xl:items-start">
          {/* ── Left sidebar ── */}
          <aside className={cn('space-y-4 xl:sticky xl:top-24 xl:self-start', railScrollClass)}>
            {/* Categories */}
            <Card className="rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/40 px-4 py-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 p-2">
                {UPDATES_HUB_CATEGORY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ category: option.value })}
                    className={cn(
                      sidebarButtonClass,
                      filters.category === option.value
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Scope — desktop only */}
            <Card className="hidden rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur xl:flex xl:flex-col">
              <CardHeader className="border-b border-border/40 px-4 py-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 p-2">
                {UPDATES_HUB_SCOPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        scope: option.value,
                        org: option.value === 'official' ? undefined : filters.org,
                      })
                    }
                    className={cn(
                      sidebarButtonClass,
                      filters.scope === option.value
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Organizations — desktop only */}
            {showOrganizationFilters ? (
              <Card className="hidden rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur xl:flex xl:flex-col">
                <CardHeader className="border-b border-border/40 px-4 py-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ org: undefined })}
                    className={cn(
                      sidebarButtonClass,
                      !filters.org
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    All organizations
                  </Button>
                  {organizationsLoading ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      Loading…
                    </div>
                  ) : availableOrganizations.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-muted-foreground">
                      No organization activity yet.
                    </p>
                  ) : (
                    availableOrganizations.map((organization) => (
                      <Button
                        key={organization.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFilters({ org: organization.id, scope: 'community' })}
                        className={cn(
                          sidebarButtonClass,
                          filters.org === organization.id
                            ? 'bg-primary/10 text-foreground'
                            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        )}
                      >
                        {organization.name}
                      </Button>
                    ))
                  )}
                </CardContent>
              </Card>
            ) : null}
          </aside>

          {/* ── Main feed ── */}
          <section className={feedScrollClass}>
            {/* Mobile filters */}
            <Card className="rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur xl:hidden">
              <CardContent className="space-y-3 px-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {UPDATES_HUB_SCOPE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateFilters({
                          scope: option.value,
                          org: option.value === 'official' ? undefined : filters.org,
                        })
                      }
                      className={cn(
                        mobileFilterButtonClass,
                        filters.scope === option.value
                          ? 'border-primary/20 bg-primary text-primary-foreground'
                          : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {UPDATES_HUB_CATEGORY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilters({ category: option.value })}
                      className={cn(
                        mobileFilterButtonClass,
                        filters.category === option.value
                          ? 'border-primary/20 bg-primary text-primary-foreground'
                          : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                {showOrganizationFilters && availableOrganizations.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilters({ org: undefined })}
                      className={cn(
                        mobileFilterButtonClass,
                        !filters.org
                          ? 'border-primary/20 bg-primary text-primary-foreground'
                          : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      All orgs
                    </Button>
                    {availableOrganizations.map((organization) => (
                      <Button
                        key={organization.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFilters({ org: organization.id, scope: 'community' })}
                        className={cn(
                          mobileFilterButtonClass,
                          filters.org === organization.id
                            ? 'border-primary/20 bg-primary text-primary-foreground'
                            : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/40'
                        )}
                      >
                        {organization.name}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Search + meta bar */}
            <Card className="rounded-2xl border-border/60 bg-card/90 py-0 shadow-sm backdrop-blur">
              <CardContent className="space-y-4 px-4 py-4 sm:px-5">
                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchDraft}
                      onChange={(event) => setSearchDraft(event.target.value)}
                      placeholder="Search updates…"
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" className="sm:w-28">
                    Search
                  </Button>
                  {filters.q ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSearchDraft('');
                        updateFilters({ q: undefined });
                      }}
                    >
                      Clear
                    </Button>
                  ) : null}
                </form>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{visibleCount} visible · {totalLoadedItems} loaded</span>
                  {hasActiveFilters ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      Reset filters
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Feed */}
            {error ? (
              <Card className="rounded-2xl border-destructive/30 bg-card/90 py-0 shadow-sm">
                <CardContent className="flex flex-col items-start gap-4 px-6 py-6">
                  <p className="text-sm text-muted-foreground">
                    We couldn&apos;t load the updates feed right now.
                  </p>
                  <Button variant="outline" onClick={() => router.refresh()}>
                    Try again
                  </Button>
                </CardContent>
              </Card>
            ) : isInitialLoading ? (
              <Card className="rounded-2xl border-border/60 bg-card/90 py-0 shadow-sm">
                <CardContent className="flex min-h-[320px] items-center justify-center px-6 py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : visibleItems.length === 0 ? (
              <Card className="rounded-2xl border-border/60 bg-card/90 py-0 shadow-sm">
                <CardContent className="flex flex-col items-start gap-3 px-6 py-10">
                  <h2 className="text-lg font-semibold text-foreground">No updates match this view</h2>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Try changing the category, scope, or clearing the current filters.
                  </p>
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Reset the feed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {visibleItems.map((item) => (
                    <UpdateFeedCard key={`${item.kind}:${item.id}`} item={item} />
                  ))}
                </div>

                {hasMore ? (
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={() => { void loadMore(); }}
                      variant="outline"
                      size="lg"
                      disabled={isFetchingMore}
                    >
                      {isFetchingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading more
                        </>
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </section>

          {/* ── Right rail ── */}
          <aside className={cn('space-y-4 xl:sticky xl:top-24 xl:self-start', railScrollClass)}>
            {/* Top Priority Announcement */}
            <Card className="rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/40 px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  Top Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                {topPriorityAnnouncement ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {topPriorityAnnouncement.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {topPriorityAnnouncement.type}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {topPriorityAnnouncement.title}
                    </h3>
                    <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                      {(topPriorityAnnouncement.content ?? topPriorityAnnouncement.bodyHtml ?? '')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(topPriorityAnnouncement.publishedAt ?? topPriorityAnnouncement.createdAt)}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 text-xs">
                      <Link href={`/announcements/${topPriorityAnnouncement._id}`}>
                        View announcement
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No active public announcements yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Event */}
            <Card className="rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/40 px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  Upcoming Event
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                {upcomingEvent ? (
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-[10px]">
                      {formatDate(upcomingEvent.startDate)}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {upcomingEvent.title}
                    </h3>
                    <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                      {upcomingEvent.excerpt || upcomingEvent.description || 'Join the next CICT activity.'}
                    </p>
                    <div className="space-y-0.5 text-[10px] text-muted-foreground">
                      <div>{upcomingEvent.location}</div>
                      <div>{new Date(upcomingEvent.startDate).toLocaleString()}</div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 text-xs">
                      <Link href={`/events/${upcomingEvent._id}`}>
                        View event
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No upcoming public events scheduled.</p>
                )}
              </CardContent>
            </Card>

            {/* Latest Official Update */}
            <Card className="rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/40 px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Latest Official
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                {latestOfficialUpdate ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {getKindLabel(latestOfficialUpdate.kind)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">CICT</Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {latestOfficialUpdate.title}
                    </h3>
                    <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                      {latestOfficialUpdate.summary}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(latestOfficialUpdate.displayDate)}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 text-xs">
                      <Link href={latestOfficialUpdate.href}>
                        Open update
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Official updates will appear once public content is published.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active Organizations */}
            <Card className="rounded-2xl border-border/60 bg-card/85 py-0 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/40 px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Active Orgs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pt-4 pb-4">
                {activeOrganizations.length > 0 ? (
                  activeOrganizations.map((organization) => (
                    <Link
                      key={organization.organizationId}
                      href={`/organization/${organization.organizationId}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-background"
                    >
                      <div>
                        <h3 className="text-xs font-semibold text-foreground">
                          {organization.organizationName}
                        </h3>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {organization.itemCount} update{organization.itemCount > 1 ? 's' : ''} · {formatDate(organization.latestActivityDate)}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Organization activity will appear once community updates are published.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mobile quick links */}
            <div className="grid gap-3 xl:hidden">
              <Button asChild variant="outline" size="sm" className="justify-between">
                <Link href="/news">
                  News
                  <Newspaper className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-between">
                <Link href="/announcements">
                  Announcements
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}