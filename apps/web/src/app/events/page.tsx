import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import EventListClient from './event-list-client';

export const metadata: Metadata = {
  title: 'Events | CICT',
  description: 'Browse upcoming and past CICT events, workshops, and activities.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <EventListClient />
    </Suspense>
  );
}
