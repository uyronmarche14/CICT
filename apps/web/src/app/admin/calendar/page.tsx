'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { calendarFeatureAPI } from '@/features/calendar/api';

const ALL_TYPES = ['event', 'meeting', 'task', 'vote', 'resource'];

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(ALL_TYPES));

  useEffect(() => { setSelectedDate(new Date()); }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['calendar-feed', monthStart.toISOString(), monthEnd.toISOString()],
    queryFn: () =>
      calendarFeatureAPI.getAdminFeed({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        limit: 200,
      }),
    staleTime: 120_000,
  });

  const items = useMemo(() => data ?? [], [data]);

  const selectedItems = useMemo(() => {
    if (!selectedDate) return [];
    return items.filter((item) => {
      const d = new Date(item.startsAt);
      return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate();
    });
  }, [items, selectedDate]);

  const upcomingItems = useMemo(() => {
    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return items
      .filter((item) => new Date(item.startsAt) >= now && new Date(item.startsAt) <= next7)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .slice(0, 5);
  }, [items]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) { counts[item.sourceType] = (counts[item.sourceType] || 0) + 1; }
    return counts;
  }, [items]);

  const toggleType = (type: string) => {
    const next = new Set(activeTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setActiveTypes(next);
  };

  const filteredItems = items.filter((item) => activeTypes.has(item.sourceType));

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col px-3 pt-4">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => setCurrentDate(new Date(year, month - 1))}
        onNextMonth={() => setCurrentDate(new Date(year, month + 1))}
        onToday={() => setCurrentDate(new Date())}
        activeTypes={activeTypes}
        onToggleType={toggleType}
      />

      <div className="mt-4 flex-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p>Failed to load calendar data.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 h-full">
            <CalendarGrid
              items={filteredItems}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <CalendarSidebar
              items={selectedItems}
              selectedDate={selectedDate}
              upcomingItems={upcomingItems}
              typeCounts={typeCounts}
              totalItems={items.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
