import Link from 'next/link';
import { Frown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center text-center max-w-md gap-6">
        <div className="p-4 rounded-full bg-primary/10">
          <Frown className="w-12 h-12 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Check the URL or navigate to a known page.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/" className={buttonVariants({ size: 'default' })}>
            Go Home
          </Link>
          <Link href="/events" className={buttonVariants({ variant: 'outline', size: 'default' })}>
            Browse Events
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/60 pt-4">
          CICT &middot; College of Information and Communications Technology
        </p>
      </div>
    </div>
  );
}
