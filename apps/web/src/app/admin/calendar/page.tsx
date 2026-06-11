'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api/axios';
import type { CalendarItem } from '@cict/contracts/types';
import { format } from 'date-fns';

function getMonthDays(year: number, month: number): Date[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days: Date[] = [];
  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(new Date(year, month, -startDay + i + 1));
  }
  for (let i = 1; i <= end.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

function getItemsForDate(items: CalendarItem[], date: Date): CalendarItem[] {
  return items.filter((item) => {
    const d = new Date(item.startsAt);
    return d.getFullYear() === date.getFullYear() &&
           d.getMonth() === date.getMonth() &&
           d.getDate() === date.getDate();
  });
}

const typeColors: Record<string, string> = {
  event: 'bg-blue-500', meeting: 'bg-green-500',
  task: 'bg-amber-500', vote: 'bg-purple-500',
  resource: 'bg-red-500',
};

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const { data, isLoading } = useQuery({
    queryKey: ['calendar-feed', monthStart.toISOString(), monthEnd.toISOString()],
    queryFn: async () => {
      const { data: res } = await api.get('/calendar/feed', {
        params: {
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
          limit: 200,
        },
      });
      return (res.data as { items: CalendarItem[]; total: number }).items;
    },
    staleTime: 120_000,
  });

  const items = data ?? [];
  const days = getMonthDays(year, month);
  const today = new Date();
  const selectedItems = selectedDate ? getItemsForDate(items, selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {days.map((day, i) => {
                  const dayItems = getItemsForDate(items, day);
                  const isToday = day.toDateString() === today.toDateString();
                  const isCurrentMonth = day.getMonth() === month;
                  const isSelected = selectedDate?.toDateString() === day.toDateString();

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-1 rounded-lg border text-left transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'
                      } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center' : ''}`}>
                        {day.getDate()}
                      </span>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayItems.slice(0, 3).map((item) => (
                          <div key={item.id} className={`w-2 h-2 rounded-full ${typeColors[item.sourceType] || 'bg-gray-400'}`} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Agenda Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a day'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items for this date.</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <a key={item.id} href={item.href} className="block p-3 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${typeColors[item.sourceType] || 'bg-gray-400'}`} />
                        <Badge variant="outline" className="text-[10px]">{item.sourceType}</Badge>
                      </div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(item.startsAt), 'h:mm a')}
                        {item.endsAt ? ` — ${format(new Date(item.endsAt), 'h:mm a')}` : ''}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
