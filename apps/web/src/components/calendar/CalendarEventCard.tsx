import { cn } from '@/lib/utils';
import type { CalendarItem } from '@cict/contracts/types';

const typeStyles: Record<string, { bg: string; text: string; dot: string }> = {
  event: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  meeting: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  task: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  vote: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  resource: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
};

export function CalendarEventCard({ item, compact }: { item: CalendarItem; compact?: boolean }) {
  const style = typeStyles[item.sourceType] || typeStyles.event;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs truncate cursor-pointer', style.bg, style.text)}>
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
        <span className="truncate">{item.title}</span>
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className="block group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', style.dot)} />
        <span className={cn('text-[11px] font-medium uppercase tracking-wider', style.text)}>
          {item.sourceType}
        </span>
        {item.status && (
          <span className="text-[10px] text-muted-foreground ml-auto">{item.status}</span>
        )}
      </div>
      <h4 className="text-sm font-semibold leading-snug mb-1.5 group-hover:text-primary transition-colors">
        {item.title}
      </h4>
      {item.organizationName && (
        <p className="text-xs text-muted-foreground mb-1">{item.organizationName}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {item.endsAt ? ` — ${new Date(item.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
      </p>
    </a>
  );
}
