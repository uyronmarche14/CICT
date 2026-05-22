'use client';

import Link from 'next/link';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center text-center max-w-sm gap-5">
        <div className="p-3 rounded-full bg-primary/10">
          <Frown className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-1.5">
          <p className="text-3xl font-bold tracking-tight">404</p>
          <h2 className="text-lg font-semibold">Page not found</h2>
          <p className="text-sm text-muted-foreground">
            This admin page doesn&apos;t exist. Check the URL or go back to the dashboard.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Link href="/admin">
            <Button size="sm">Go to Dashboard</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
