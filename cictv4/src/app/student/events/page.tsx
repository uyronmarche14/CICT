'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentEventAPI } from '@/lib/api/student';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function StudentEventsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['student', 'events'],
    queryFn: studentEventAPI.getEligibleEvents,
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: string) => studentEventAPI.register(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'events'] });
      toast.success('Successfully registered for the event!');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to register');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => studentEventAPI.cancelRegistration(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'events'] });
      toast.success('Registration cancelled');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to cancel');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load events. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Events</h1>
        <p className="text-muted-foreground text-sm">Browse and register for upcoming events</p>
      </div>

      {(!events || events.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No upcoming events available for you at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const reg = event.registration;
            const isRegistered = reg && (reg.status === 'registered' || reg.status === 'checked_in');

            return (
              <Card key={event._id} className="overflow-hidden">
                <div className="md:flex">
                  {event.coverImage?.imageUrl && (
                    <div className="md:w-48 h-32 md:h-auto relative bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.coverImage.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-1">{event.excerpt}</p>
                        </div>
                        {isRegistered ? (
                          <Badge className="bg-green-600 shrink-0">Registered</Badge>
                        ) : reg?.status === 'cancelled' ? (
                          <Badge variant="secondary" className="shrink-0">Cancelled</Badge>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.startDate), 'MMM dd, h:mm a')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {event.registeredCount ?? 0}{event.maxAttendees > 0 ? ` / ${event.maxAttendees}` : ''}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/student/events/${event._id}`)}
                      >
                        View Details
                      </Button>
                      {isRegistered ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/student/events/${event._id}/qr`)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Show QR
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            disabled={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate(event._id)}
                          >
                            {cancelMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                            Cancel
                          </Button>
                        </>
                      ) : reg?.status !== 'cancelled' ? (
                        <Button
                          size="sm"
                          disabled={registerMutation.isPending || !event.isRegistrationOpen}
                          onClick={() => registerMutation.mutate(event._id)}
                        >
                          {registerMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          {event.isRegistrationOpen ? 'Register' : 'Closed'}
                        </Button>
                      ) : null}
                    </CardFooter>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
