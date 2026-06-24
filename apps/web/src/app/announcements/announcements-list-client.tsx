'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Bell, Calendar, Loader2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { getPriorityBadge } from '@/utils/badge-helpers';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle, type ViewMode } from '@/components/ui/ViewToggle';

export default function AnnouncementsListClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('card');

  const { data, isLoading, error } = useGetAnnouncements(page, 9, search || undefined, undefined, true);
  const announcements = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-display font-black lg:text-5xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            Official notices, reminders, and public updates from CICT and its student organizations.
          </p>
        </div>

        {/* Search + View Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search announcements..." className="w-full sm:max-w-xs" />
          <div className="sm:ml-auto">
            <ViewToggle value={view} onChange={setView} />
          </div>
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
        ) : view === 'card' ? (
          /* Card View */
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {announcements.map((announcement) => (
              <Link key={announcement._id} href={`/announcements/${announcement._id}`} className="group block">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {(announcement.coverImage?.imageUrl || announcement.imageUrl) && (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img src={announcement.coverImage?.imageUrl || announcement.imageUrl}
                        alt={announcement.coverImage?.alt || announcement.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      {getPriorityBadge(announcement.priority)}
                      <Badge variant="outline">{getOwnershipLabel(announcement)}</Badge>
                    </div>
                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">{announcement.title}</h2>
                    <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(announcement.publishedAt ?? announcement.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="line-clamp-4 flex-1 text-sm text-muted-foreground">
                      {(announcement.content ?? announcement.bodyHtml ?? '').replace(/<[^>]+>/g, '')}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                      <Bell className="h-4 w-4" /> View announcement
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {announcements.map((a) => (
              <Link key={a._id} href={`/announcements/${a._id}`}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {getPriorityBadge(a.priority)}
                    <Badge variant="outline" className="text-[10px]">{getOwnershipLabel(a)}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(a.publishedAt ?? a.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">{a.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {(a.content ?? a.bodyHtml ?? '').replace(/<[^>]+>/g, '')}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="min-w-[36px]">{p}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
