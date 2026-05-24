'use client';

import Link from 'next/link';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center text-center max-w-sm gap-5">
        <div className="p-3 rounded-full bg-primary/10">
          <Frown className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-1.5">
          <p className="text-3xl font-bold tracking-tight">404</p>
          <p className="text-lg font-semibold">Page not found</p>
          <p className="text-sm text-muted-foreground">
            This student page doesn&apos;t exist. Check the URL or browse your events.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Link href="/student/events">
            <Button size="sm">My Events</Button>
          </Link>
          <Link href="/student/registrations">
            <Button variant="outline" size="sm">
              My Registrations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
