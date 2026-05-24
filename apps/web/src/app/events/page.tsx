'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventAPI } from '@/lib/api/event';
import { studentRegistrationAPI, StudentRegistration } from '@/lib/api/student';
import { EventCard } from '@/components/events/EventCard';
import MeshGradientBg from '@/components/ripplebg';
import { Loader2 } from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';

export default function EventsPage() {
  const { isAuthenticated: isStudent } = useStudentAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => eventAPI.getAll({ status: 'published', upcoming: true }),
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

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <MeshGradientBg variant="subtle" className="fixed inset-0" interactive={false} />
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">
            Upcoming Events
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our workshops, seminars, and gatherings to learn, connect, and grow.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Failed to load events. Please try again later.
          </div>
        ) : data?.data.events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No upcoming events at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                registration={registrationMap.get(event._id) ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}