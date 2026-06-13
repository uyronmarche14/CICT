import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarItem } from '@cict/contracts/types';
import { format } from 'date-fns';

const typeLabels: Record<string, string> = { event: 'Events', meeting: 'Meetings', task: 'Tasks', vote: 'Votes', resource: 'Resources' };
const typeDots: Record<string, string> = { event: 'bg-blue-400', meeting: 'bg-emerald-400', task: 'bg-amber-400', vote: 'bg-purple-400', resource: 'bg-rose-400' };

interface CalendarSidebarProps {
  items: CalendarItem[];
  selectedDate: Date | null;
  upcomingItems: CalendarItem[];
  typeCounts: Record<string, number>;
  totalItems: number;
}

export function CalendarSidebar({ items, selectedDate, upcomingItems, typeCounts, totalItems }: CalendarSidebarProps) {
  const today = new Date();
  const displayDate = selectedDate || today;

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* Selected day detail */}
      <Card className="flex-1 rounded-xl border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
        <CardHeader className="border-b border-border/40 pb-3 shrink-0">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(displayDate, 'EEE, MMM d')}
            </span>
            <Badge variant="secondary" className="text-[10px]">{items.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 flex-1 overflow-y-auto min-h-0">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20" />
              </div>
              <p className="text-xs text-muted-foreground">Nothing scheduled</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {items.map((item) => (
                <a key={item.id} href={item.href}
                  className="group block p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-150"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', typeDots[item.sourceType] || 'bg-gray-400')} />
                    <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1">{item.title}</span>
                  </div>
                  <div className="flex items-center justify-between ml-3.5">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {format(new Date(item.startsAt), 'h:mm a')}
                      {item.endsAt ? ` — ${format(new Date(item.endsAt), 'h:mm a')}` : ''}
                    </p>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming section */}
      <Card className="rounded-xl border-border/60 bg-card/90 backdrop-blur-sm shrink-0">
        <CardHeader className="border-b border-border/40 pb-2.5">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Upcoming — Next 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-3">
          {upcomingItems.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-2 text-center">No upcoming events</p>
          ) : (
            <div className="space-y-1">
              {upcomingItems.map((item) => (
                <a key={item.id} href={item.href}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-muted/40 transition-colors"
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', typeDots[item.sourceType] || 'bg-gray-400')} />
                  <span className="truncate text-muted-foreground">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
                    {format(new Date(item.startsAt), 'EEE d')}
                  </span>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-1.5 shrink-0">
        {Object.entries(typeCounts).slice(0, 4).map(([type, count]) => (
          <div key={type} className={cn('flex items-center gap-1.5 px-2 py-1.5 rounded-lg', 'bg-muted/30')}>
            <span className={cn('w-2 h-2 rounded-full', typeDots[type] || 'bg-gray-400')} />
            <span className="text-[11px] text-muted-foreground">{typeLabels[type] || type}</span>
            <span className="text-[11px] font-semibold ml-auto">{count}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/30 col-span-2">
          <span className="text-[11px] text-muted-foreground">Total this month</span>
          <span className="text-[11px] font-semibold ml-auto">{totalItems}</span>
        </div>
      </div>
    </div>
  );
}
