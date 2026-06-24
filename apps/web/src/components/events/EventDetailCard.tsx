'use client';

import { Calendar, MapPin, Users, ExternalLink, Share2, Clock, Building2, UserCheck, CheckCircle2, XCircle, Timer, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Event } from '@/lib/api/event';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'bg-primary/10 text-primary border-primary/20',
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    completed: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  };
  const label: Record<string, string> = {
    published: 'Upcoming',
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return (
    <Badge variant="outline" className={cn('text-[10px] uppercase', styles[status] || styles.published)}>
      {label[status] || status}
    </Badge>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm text-muted-foreground">
      <span className="w-4 h-4 mt-0.5 shrink-0 text-primary">{icon}</span>
      <div>
        <span className="font-medium text-foreground">{label}:</span> {value}
      </div>
    </div>
  );
}

interface EventDetailCardProps {
  event: Event;
}

export function EventDetailCard({ event }: EventDetailCardProps) {
  const coverSrc = event.imageUrl || event.coverImage?.imageUrl;
  const slug = event._id;
  const eventStatus = event.status === 'published' ? 'upcoming' : event.status;

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
      {/* Cover image */}
      {coverSrc ? (
        <div className="relative h-48 sm:h-56 md:h-64 bg-muted">
          <img src={coverSrc} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={eventStatus} />
          </div>
        </div>
      ) : (
        <div className="relative h-28 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-primary/40" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={eventStatus} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 md:p-8 space-y-5">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(event.startDate)} · {formatTime(event.startDate)}
            {event.endDate && event.endDate !== event.startDate && (
              <span className="text-muted-foreground font-normal">
                — {formatTime(event.endDate)}
              </span>
            )}
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mt-2 leading-tight">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {event.location}
          </p>
        </div>

        {/* Detail rows */}
        <div className="space-y-2.5 border-t border-border pt-5">
          {event.organizationName && (
            <DetailRow icon={<Building2 className="w-4 h-4" />} label="Organized by" value={event.organizationName} />
          )}
          {event.audience && (
            <DetailRow icon={<Users className="w-4 h-4" />} label="Audience" value={event.audience} />
          )}
          {event.registeredCount !== undefined && (
            <DetailRow icon={<UserCheck className="w-4 h-4" />} label="Participants" value={`${event.registeredCount}${event.maxAttendees ? ` / ${event.maxAttendees}` : ''}`} />
          )}
          {event.registrationDeadline && (
            <DetailRow icon={<Timer className="w-4 h-4" />} label="Registration closes" value={formatDate(event.registrationDeadline)} />
          )}
        </div>

        {/* Description */}
        {(event.excerpt || event.description) && (
          <div className="border-t border-border pt-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {event.excerpt || event.description}
            </p>
          </div>
        )}

        {/* Registration / QR info (conditional) */}
        {event.isRegistrationOpen && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Registration Open
            </p>
            {event.registrationDeadline && (
              <p className="text-xs text-muted-foreground">Closes {formatDate(event.registrationDeadline)}</p>
            )}
            {event.maxAttendees && (
              <p className="text-xs text-muted-foreground">
                {event.registeredCount ?? 0} / {event.maxAttendees} slots filled
              </p>
            )}
          </div>
        )}

        {event.allowWalkIns && (
          <div className="rounded-lg bg-muted/50 border border-border p-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Walk-ins Allowed
            </p>
            <p className="text-xs text-muted-foreground mt-1">On-site registration available at the venue.</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {event.isRegistrationOpen && event.registrationUrl && (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Register
              </Button>
            </a>
          )}
          {event.contactEmail && (
            <a href={`mailto:${event.contactEmail}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                Contact
              </Button>
            </a>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigator.share?.({ title: event.title, text: event.excerpt })}>
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 ml-auto" asChild>
            <Link href={`/events/${event._id}`}>
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
