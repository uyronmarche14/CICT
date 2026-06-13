import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TYPE_FILTERS = [
  { key: 'event', label: 'Events', color: 'bg-blue-400' },
  { key: 'meeting', label: 'Meetings', color: 'bg-emerald-400' },
  { key: 'task', label: 'Tasks', color: 'bg-amber-400' },
  { key: 'vote', label: 'Votes', color: 'bg-purple-400' },
  { key: 'resource', label: 'Resources', color: 'bg-rose-400' },
] as const;

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  activeTypes: Set<string>;
  onToggleType: (type: string) => void;
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday, activeTypes, onToggleType }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{format(currentDate, 'MMMM yyyy')}</h1>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-lg text-xs font-medium" onClick={onToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_FILTERS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => onToggleType(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
              activeTypes.has(key)
                ? 'bg-accent text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', color, !activeTypes.has(key) && 'opacity-30')} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
