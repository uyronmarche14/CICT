'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?tab=admin');
  }, [router]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas">
      <Loader2 className="size-8 animate-spin text-primary" />
    </main>
  );
}
