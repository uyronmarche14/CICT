'use client';

import { Event } from '@/lib/api/event';
import { StudentRegistration, studentEventAPI } from '@/lib/api/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Info, CheckCircle, QrCode, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appToast } from '@/lib/app-toast';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
  registration?: StudentRegistration | null;
}

export function EventCard({ event, registration }: EventCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isPast = new Date(event.endDate) < new Date();
  const isRegistered = registration && (registration.status === 'registered' || registration.status === 'checked_in');
  const isCancelled = registration?.status === 'cancelled';

  const registerMutation = useMutation({
    mutationFn: () => studentEventAPI.register(event._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'registrations'] });
      appToast.success('Registered!', 'You joined this event.', { label: 'Show QR Code', onClick: () => router.push(`/student/events/${event._id}/qr`) });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Registration Failed', error?.response?.data?.message || 'Could not register.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => studentEventAPI.cancelRegistration(event._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'registrations'] });
      appToast.success('Registration Cancelled', 'Your spot in this event has been freed.', { label: 'Re-register', onClick: () => registerMutation.mutate() });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Cancellation Failed', error?.response?.data?.message || 'Could not cancel.');
    },
  });

  const handleCardClick = () => {
    router.push(`/events/${event._id}`);
  };

  return (
    <Card
      className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative h-48 w-full bg-gray-100">
        {event.coverImage?.imageUrl || event.imageUrl ? (
          <Image
            src={event.coverImage?.imageUrl || event.imageUrl || ''}
            alt={event.coverImage?.alt || event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/20">
            <Calendar className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
          {isRegistered && (
            <Badge className={registration?.status === 'checked_in' ? 'bg-blue-600' : 'bg-green-600'}>
              {registration?.status === 'checked_in' ? 'Checked In' : 'Registered'}
            </Badge>
          )}
          {isCancelled && (
            <Badge variant="secondary">Cancelled</Badge>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
            {getOwnershipLabel(event)}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div>
            <Badge variant="outline" className="mb-2">
              {format(new Date(event.startDate), 'MMM dd, yyyy')}
            </Badge>
            <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {event.excerpt || event.description || event.bodyHtml.replace(/<[^>]+>/g, ' ')}
        </p>
        <div className="space-y-2 text-sm text-foreground/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
            <span className="text-muted-foreground">·</span>
            <span>{format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{event.registeredCount ?? 0}{event.maxAttendees > 0 ? ` / ${event.maxAttendees}` : ''} registered</span>
          </div>
        </div>
        {event.gallery?.length ? (
          <p className="text-xs text-muted-foreground">
            {event.gallery.length} gallery image{event.gallery.length > 1 ? 's' : ''}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="pt-4 border-t">
        {isRegistered ? (
          <div className="w-full flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/student/events/${event._id}/qr`}>
                <QrCode className="w-4 h-4 mr-2" /> QR Code
              </Link>
            </Button>
            {registration?.status === 'registered' && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          </div>
        ) : !isPast && registration === undefined ? (
          <Button className="w-full" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/events/${event._id}`); }}>
            <Info className="w-4 h-4 mr-2" />
            View Details
          </Button>
        ) : !isPast && event.isRegistrationOpen && registration === null ? (
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              registerMutation.mutate();
            }}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Register Now
          </Button>
        ) : (
          <Button className="w-full" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/events/${event._id}`); }}>
            <Info className="w-4 h-4 mr-2" />
            {isPast ? 'View Event Summary' : !event.isRegistrationOpen ? 'View Details' : 'View Details'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}