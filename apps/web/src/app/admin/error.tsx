'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center text-center max-w-sm gap-5">
        <div className="p-3 rounded-full bg-destructive/10">
          <TriangleAlert className="w-10 h-10 text-destructive" />
        </div>

        <div className="space-y-1.5">
          <p className="text-3xl font-bold tracking-tight">500</p>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An error occurred in the admin panel. Try again or return to the dashboard.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button onClick={reset} size="sm">
            Try Again
          </Button>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground/40 font-mono">ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
