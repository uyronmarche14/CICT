'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface HistoryEntry {
  status: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entries: HistoryEntry[];
  title?: string;
}

export function StatusHistoryTimeline({ open, onOpenChange, entries, title = 'Status History' }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Track of all status changes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-0">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No history recorded yet.</p>
          ) : (
            entries.map((entry, i) => (
              <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                  {i < entries.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{entry.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.changedAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                  {entry.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.reason}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
