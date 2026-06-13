import { cn } from '@/lib/utils';
import type { CalendarItem } from '@cict/contracts/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const typeColors: Record<string, string> = {
  event: 'bg-blue-400', meeting: 'bg-emerald-400',
  task: 'bg-amber-400', vote: 'bg-purple-400', resource: 'bg-rose-400',
};

function getMonthDays(year: number, month: number): Date[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days: Date[] = [];
  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) days.push(new Date(year, month, -startDay + i + 1));
  for (let i = 1; i <= end.getDate(); i++) days.push(new Date(year, month, i));
  return days;
}

function getItemsForDate(items: CalendarItem[], date: Date): CalendarItem[] {
  return items.filter((item) => {
    const d = new Date(item.startsAt);
    return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  });
}

interface CalendarGridProps {
  items: CalendarItem[];
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({ items, currentDate, selectedDate, onSelectDate }: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);
  const rowCount = Math.ceil(days.length / 7);
  const today = new Date();

  return (
    <div className="flex flex-col rounded-xl border bg-card overflow-hidden h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 shrink-0 border-b bg-muted/30">
        {DAYS.map((d) => (
          <div key={d} className="py-2.5 text-xs font-semibold text-muted-foreground text-center tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells grid */}
      <div
        className="grid flex-1"
        style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
      >
        {days.map((day, i) => {
          const dayItems = getItemsForDate(items, day);
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === month;
          const isSelected = selectedDate?.toDateString() === day.toDateString();

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={cn(
                'flex flex-col p-1.5 border-r border-b transition-colors duration-100 text-left',
                'hover:bg-muted/40 focus:outline-none',
                isSelected && 'bg-primary/5',
                !isCurrentMonth && 'opacity-25',
                i % 7 === 6 && 'border-r-0',
                Math.floor(i / 7) === rowCount - 1 && 'border-b-0',
              )}
            >
              <span className={cn(
                'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full font-medium shrink-0',
                isToday && 'bg-primary text-primary-foreground font-bold',
                isSelected && !isToday && 'text-primary font-semibold',
                !isToday && !isSelected && 'text-foreground',
              )}>
                {day.getDate()}
              </span>
              {isCurrentMonth && (
                <div className="flex-1 min-w-0 mt-0.5 space-y-px overflow-hidden">
                  {dayItems.slice(0, 4).map((item) => (
                    <span
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); window.location.href = item.href; }}
                      className="flex items-center gap-1 px-0.5 text-[10px] truncate cursor-pointer text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted/50"
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', typeColors[item.sourceType] || 'bg-gray-400')} />
                      {item.title}
                    </span>
                  ))}
                  {dayItems.length > 4 && (
                    <span className="text-[9px] text-muted-foreground pl-2">+{dayItems.length - 4}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
