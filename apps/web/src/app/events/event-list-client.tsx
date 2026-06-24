'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { eventAPI } from '@/lib/api/event';
import { studentRegistrationAPI, StudentRegistration } from '@/lib/api/student';
import { EventCard } from '@/components/events/EventCard';
import { EventCarousel } from '@/components/events/EventCarousel';
import MeshGradientBg from '@/components/ripplebg';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle, type ViewMode } from '@/components/ui/ViewToggle';
import { useStudentAuth } from '@/context/StudentAuthContext';

export default function EventListClient() {
  const { isAuthenticated: isStudent } = useStudentAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [view, setView] = useState<ViewMode>('card');

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 'published', timeFilter, page],
    queryFn: () => eventAPI.getAll({
      status: 'published',
      upcoming: timeFilter === 'upcoming' ? true : undefined,
      page,
      limit: 12,
      search: search || undefined,
    }),
    staleTime: 0,
  });

  const { data: registrations } = useQuery({
    queryKey: ['student', 'registrations'],
    queryFn: () => studentRegistrationAPI.getAll(),
    enabled: isStudent,
  });

  const registrationMap = useMemo(() => {
    if (!registrations) return new Map<string, StudentRegistration>();
    const map = new Map<string, StudentRegistration>();
    registrations.forEach((reg) => {
      const eventId = typeof reg.eventId === 'string' ? reg.eventId : (reg.eventId as { _id: string })._id;
      map.set(eventId, reg);
    });
    return map;
  }, [registrations]);

  const events = data?.data?.events ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <MeshGradientBg variant="subtle" className="fixed inset-0" interactive={false} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-3">Events</h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Join our workshops, seminars, and gatherings to learn, connect, and grow.
          </p>
        </div>

        {/* Search + Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search events..." className="w-full sm:max-w-xs" />
          <div className="flex items-center gap-2">
            <select
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value as 'upcoming' | 'past' | 'all'); setPage(1); }}
              className="h-10 rounded-full bg-muted/50 border border-border px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All events</option>
            </select>
          </div>
          <div className="sm:ml-auto">
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">Failed to load events.</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No events found.</div>
        ) : view === 'card' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} registration={registrationMap.get(event._id) ?? null} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {events.map((event) => (
              <a key={event._id} href={`/events/${event._id}`}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/50 transition-colors">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary text-center leading-tight px-1">
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${event.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {event.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{event.location}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{event.excerpt}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pagination.pages).map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="min-w-[36px]">{p}</Button>
              </span>
            ))}
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
