'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterValues {
  fiscalYear: string;
  semester: string;
}

interface Props {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

const SEMESTER_OPTIONS = [
  { value: '1st', label: '1st Semester' },
  { value: '2nd', label: '2nd Semester' },
  { value: 'Summer', label: 'Summer' },
];

export function FiscalSemesterFilter({ values, onChange }: Props) {
  const hasFilters = values.fiscalYear || values.semester;

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Fiscal Year (e.g. 2025-2026)"
        value={values.fiscalYear}
        onChange={(e) => onChange({ ...values, fiscalYear: e.target.value })}
        className="w-44 h-8 text-xs"
      />
      <Select
        value={values.semester}
        onValueChange={(v) => onChange({ ...values, semester: v })}
      >
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Semester" />
        </SelectTrigger>
        <SelectContent>
          {SEMESTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange({ fiscalYear: '', semester: '' })}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
