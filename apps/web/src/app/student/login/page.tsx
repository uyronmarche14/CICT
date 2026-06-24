'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function StudentLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    router.replace(`/login?tab=student${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`);
  }, [redirect, router]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas">
      <Loader2 className="size-8 animate-spin text-primary" />
    </main>
  );
}

export default function StudentLoginRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-canvas">
          <Loader2 className="size-8 animate-spin text-primary" />
        </main>
      }
    >
      <StudentLoginRedirect />
    </Suspense>
  );
}
