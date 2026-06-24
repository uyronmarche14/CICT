import { Suspense } from 'react';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

import OrganizationsListClient from './organizations-list-client';

export const metadata: Metadata = {
  title: 'Student Organizations | CICT',
  description: 'Explore public CICT student organizations and their communities.',
};

function OrganizationsFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<OrganizationsFallback />}>
      <OrganizationsListClient />
    </Suspense>
  );
}
