'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentEventAPI } from '@/lib/api/student';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { appToast } from '@/lib/app-toast';

export default function StudentEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id as string;

  const { data: events } = useQuery({
    queryKey: ['student', 'events'],
    queryFn: studentEventAPI.getEligibleEvents,
  });

  const event = events?.find((e) => e._id === eventId);

  const { data: registration } = useQuery({
    queryKey: ['student', 'registration', eventId],
    queryFn: () => studentEventAPI.getRegistration(eventId),
    enabled: !!eventId,
  });

  const registerMutation = useMutation({
    mutationFn: () => studentEventAPI.register(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'registration', eventId] });
      appToast.success('Registered!', 'You are now registered for this event.', { label: 'Show QR Code', onClick: () => router.push(`/student/events/${eventId}/qr`) });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Registration Failed', error?.response?.data?.message || 'Could not register for this event.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => studentEventAPI.cancelRegistration(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'registration', eventId] });
      appToast.success('Registration Cancelled', 'Your registration has been cancelled.', { label: 'Re-register', onClick: () => registerMutation.mutate() });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.error('Cancellation Failed', error?.response?.data?.message || 'Could not cancel registration.');
    },
  });

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/student/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const isRegistered = registration && (registration.status === 'registered' || registration.status === 'checked_in');
  const isCancelled = registration?.status === 'cancelled';
  const isPast = new Date(event.endDate) < new Date();

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/student/events')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
      </Button>

      <Card className="overflow-hidden">
        {event.coverImage?.imageUrl && (
          <div className="relative h-48 w-full bg-muted">
              <Image
              src={event.coverImage.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        <CardContent className="p-6 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              {isRegistered && <Badge className="bg-green-600">Registered</Badge>}
              {isCancelled && <Badge variant="secondary">Cancelled</Badge>}
            </div>
            <p className="text-muted-foreground">{event.excerpt}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(event.startDate), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium">
                  {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{event.location}</p>
                {event.venueDetails?.name && <p className="text-xs text-muted-foreground">{event.venueDetails.name}{event.venueDetails?.room ? ` · Room ${event.venueDetails.room}` : ''}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="font-medium">
                  {event.registeredCount ?? 0}{(event.maxAttendees ?? 0) > 0 ? ` / ${event.maxAttendees}` : ''}
                </p>
              </div>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {event.speakerItems && event.speakerItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Speakers</h3>
              <div className="space-y-2">
                {event.speakerItems.map((speaker, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{speaker.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{speaker.name}</p>
                      {speaker.title && <p className="text-xs text-muted-foreground">{speaker.title}{speaker.organization ? `, ${speaker.organization}` : ''}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.feeLabel && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.feeLabel}</Badge>
            </div>
          )}

          {(event.contactName || event.contactEmail) && (
            <div className="text-sm">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact</h3>
              {event.contactName && <p className="font-medium">{event.contactName}</p>}
              {event.contactEmail && <p className="text-muted-foreground">{event.contactEmail}</p>}
            </div>
          )}

          <div className="flex gap-3">
            {isRegistered ? (
              <>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => router.push(`/student/events/${event._id}/qr`)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Show QR Code
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500"
                  disabled={cancelMutation.isPending || isPast}
                  onClick={() => cancelMutation.mutate()}
                >
                  {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Cancel
                </Button>
              </>
            ) : isCancelled ? (
              <p className="text-sm text-muted-foreground">You cancelled your registration for this event.</p>
            ) : (
              <Button
                className="flex-1"
                disabled={registerMutation.isPending || !event.isRegistrationOpen || isPast}
                onClick={() => registerMutation.mutate()}
              >
                {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {event.isRegistrationOpen ? 'Register for this Event' : 'Registration Closed'}
              </Button>
            )}
          </div>

          {registration && !isPast && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">Registration Details</p>
              <p>Status: <strong>{registration.status}</strong></p>
              <p>Registered: {format(new Date(registration.registeredAt), 'MMM dd, yyyy h:mm a')}</p>
              <p>Source: {registration.source}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
