import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { EventDetailsPageClient } from './event-detail-client';

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/events/${id}`, { next: { revalidate: 60 } });
    const json = await res.json();
    const event = json.data.event;

    return {
      title: `${event.title} | CICT`,
      description: event.excerpt || event.description || '',
      openGraph: {
        title: event.title,
        description: event.excerpt || event.description,
        images: event.coverImage?.imageUrl || event.imageUrl ? [{ url: event.coverImage?.imageUrl || event.imageUrl }] : [],
      },
    };
  } catch {
    return { title: 'Event | CICT' };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Fallback />}>
      <EventDetailsPageClient id={id} />
    </Suspense>
  );
}
