'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tab = 'details' | 'registrations' | 'attendance';

interface EventDetailHeaderProps {
  eventId: string;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  tabs: { key: Tab; label: string }[];
}

export function EventDetailHeader({ eventId, tab, onTabChange, tabs }: EventDetailHeaderProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </>
  );
}
