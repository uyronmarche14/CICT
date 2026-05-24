'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, QrCode, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventOverviewProps {
  event: {
    title: string;
    excerpt: string;
    startDate: string;
    endDate: string;
    location: string;
    registeredCount?: number;
    maxAttendees: number;
    status: string;
    isRegistrationOpen: boolean;
    allowWalkIns?: boolean;
    checkedInCount?: number;
  };
  eventId: string;
  onOpenQr: () => void;
}

export function EventOverview({ event, eventId, onOpenQr }: EventOverviewProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground mt-1">{event.excerpt}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="font-medium">
                {event.registeredCount ?? 0}{event.maxAttendees > 0 ? ` / ${event.maxAttendees}` : ''} registered
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Status: </span>
            <Badge>{event.status}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Registration: </span>
            <Badge variant={event.isRegistrationOpen ? 'default' : 'secondary'}>
              {event.isRegistrationOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Allow Walk-ins: </span>
            <Badge variant="outline">{event.allowWalkIns ? 'Yes' : 'No'}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Checked in: </span>
            <span className="font-medium">{event.checkedInCount ?? 0}</span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant="default" asChild>
            <Link href={`/admin/events/${eventId}/scan`}>
              <QrCode className="w-4 h-4 mr-2" /> Scan Attendance
            </Link>
          </Button>
          <Button variant="outline" onClick={onOpenQr}>
            <Download className="w-4 h-4 mr-2" /> Event QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
