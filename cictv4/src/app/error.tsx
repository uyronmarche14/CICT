'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center text-center max-w-md gap-6">
        <div className="p-4 rounded-full bg-destructive/10">
          <TriangleAlert className="w-12 h-12 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">500</h1>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. Our team has been notified. Please try again or return home.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={reset} size="default">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="default">
              Go Home
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground/40 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
