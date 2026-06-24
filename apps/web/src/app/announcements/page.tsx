import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AnnouncementsListClient from './announcements-list-client';

export const metadata: Metadata = {
  title: 'Announcements | CICT',
  description: 'Official notices, reminders, and public updates from CICT and its student organizations.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <AnnouncementsListClient />
    </Suspense>
  );
}
