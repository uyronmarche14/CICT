'use client';

import { useQuery } from '@tanstack/react-query';
import { studentRegistrationAPI, type StudentRegistration } from '@/lib/api/student';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Loader2, Calendar, MapPin, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function StudentRegistrationsPage() {
  const router = useRouter();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['student', 'registrations'],
    queryFn: studentRegistrationAPI.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRegistrations = registrations?.filter(
    (r) => r.status === 'registered' || r.status === 'checked_in'
  ) ?? [];

  const pastRegistrations = registrations?.filter(
    (r) => r.status === 'cancelled'
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Registrations</h1>
        <p className="text-muted-foreground text-sm">View and manage your event registrations</p>
      </div>

      {(!registrations || registrations.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground">
          <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No registrations yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/student/events')}>
            Browse Events
          </Button>
        </div>
      ) : (
        <>
          {activeRegistrations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Active</h2>
              {activeRegistrations.map((reg: StudentRegistration) => {
                const eventInfo = reg.eventId && typeof reg.eventId === 'object' ? reg.eventId as { _id: string; title: string; startDate: string; endDate: string; location: string; status: string } : null;
                return (
                  <Card key={reg._id} className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">{eventInfo?.title ?? 'Event'}</h3>
                          {eventInfo && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(eventInfo.startDate), 'MMM dd, h:mm a')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {eventInfo.location}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge className={reg.status === 'checked_in' ? 'bg-blue-600' : 'bg-green-600'}>
                              {reg.status}
                            </Badge>
                            <Badge variant="outline">{reg.source}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/student/events/${typeof reg.eventId === 'object' ? reg.eventId._id : reg.eventId}/qr`)}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {pastRegistrations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Cancelled</h2>
              {pastRegistrations.map((reg: StudentRegistration) => {
                const eventInfo = reg.eventId && typeof reg.eventId === 'object' ? reg.eventId as { _id: string; title: string; startDate: string; endDate: string; location: string; status: string } : null;
                return (
                  <Card key={reg._id} className="opacity-70">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">{eventInfo?.title ?? 'Event'}</h3>
                          {eventInfo && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(eventInfo.startDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                          <Badge variant="secondary" className="mt-1">Cancelled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
