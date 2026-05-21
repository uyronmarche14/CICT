'use client';

import { EventScheduleItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface EventScheduleEditorProps {
  schedule: EventScheduleItem[];
  onChange: (schedule: EventScheduleItem[]) => void;
}

export function EventScheduleEditor({ schedule, onChange }: EventScheduleEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Event Schedule</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...schedule, { label: '', title: '', description: '' }])
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Schedule Item
        </Button>
      </div>

      {schedule.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Add agenda blocks like registration, keynote, workshop, or closing program.
        </div>
      ) : (
        schedule.map((item, index) => (
          <div key={`${item.label}-${index}`} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_auto]">
            <Input
              value={item.label}
              onChange={(event) =>
                onChange(
                  schedule.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, label: event.target.value } : entry
                  )
                )
              }
              placeholder="9:00 AM"
            />
            <Input
              value={item.title}
              onChange={(event) =>
                onChange(
                  schedule.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, title: event.target.value } : entry
                  )
                )
              }
              placeholder="Registration"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-600"
              onClick={() => onChange(schedule.filter((_, entryIndex) => entryIndex !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Input
              className="md:col-span-3"
              value={item.description ?? ''}
              onChange={(event) =>
                onChange(
                  schedule.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, description: event.target.value } : entry
                  )
                )
              }
              placeholder="Optional details"
            />
          </div>
        ))
      )}
    </div>
  );
}
