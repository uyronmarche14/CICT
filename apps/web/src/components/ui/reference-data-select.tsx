'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferenceData } from '@/hooks/use-reference-data';
import { X } from 'lucide-react';

interface ReferenceDataOption {
  value: string;
  label: string;
}

interface ReferenceDataSelectProps {
  groupKey: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fallback?: ReferenceDataOption[];
  disabled?: boolean;
}

interface ReferenceDataMultiSelectProps {
  groupKey: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  fallback?: ReferenceDataOption[];
  disabled?: boolean;
}

const normalizeOptions = (items: ReferenceDataOption[], fallback: ReferenceDataOption[] = []) =>
  (items.length > 0 ? items : fallback).map((item) => ({
    value: item.value,
    label: item.label,
  }));

export function ReferenceDataSelect({
  groupKey,
  value,
  onChange,
  placeholder = 'Select option',
  fallback = [],
  disabled,
}: ReferenceDataSelectProps) {
  const { items } = useReferenceData(groupKey);
  const options = normalizeOptions(items, fallback);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ReferenceDataMultiSelect({
  groupKey,
  value,
  onChange,
  placeholder = 'Select options',
  fallback = [],
  disabled,
}: ReferenceDataMultiSelectProps) {
  const { items } = useReferenceData(groupKey);
  const options = normalizeOptions(items, fallback);
  const valueSet = new Set(value);

  const toggleValue = (nextValue: string) => {
    onChange(valueSet.has(nextValue)
      ? value.filter((item) => item !== nextValue)
      : [...value, nextValue]);
  };

  return (
    <div className="space-y-2">
      <Select value="" onValueChange={toggleValue} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={value.length === 0 ? placeholder : `${value.length} selected`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {valueSet.has(item.value) ? '[x] ' : ''}{item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1">
              {options.find((option) => option.value === item)?.label ?? item}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => onChange(value.filter((selected) => selected !== item))}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
