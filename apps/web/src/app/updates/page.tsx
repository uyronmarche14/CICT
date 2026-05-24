import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

import UpdatesHubClient from '@/components/updates/UpdatesHubClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Updates Hub | CICT',
  description:
    'Browse a unified stream of CICT news, announcements, events, and organization updates.',
};

function UpdatesHubFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background pt-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function UpdatesPage() {
  return (
    <Suspense fallback={<UpdatesHubFallback />}>
      <UpdatesHubClient />
    </Suspense>
  );
}
