'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LookupItem, LookupKind, LookupParams, lookupsAPI } from '@/lib/api/lookups';
import { cn } from '@/lib/utils';

interface LookupComboboxProps {
  kind: LookupKind;
  value?: string;
  onChange: (value: string, item?: LookupItem) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  params?: LookupParams;
  disabled?: boolean;
  className?: string;
}

interface LookupMultiComboboxProps {
  kind: LookupKind;
  value: string[];
  onChange: (value: string[], items?: LookupItem[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  params?: LookupParams;
  disabled?: boolean;
  className?: string;
}

const lookupKey = (kind: LookupKind, search: string, params?: LookupParams) => [
  'lookup',
  kind,
  search,
  params,
] as const;

function LookupOption({
  item,
  selected,
}: {
  item: LookupItem;
  selected: boolean;
}) {
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.label}</span>
          {item.badge ? <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{item.badge}</Badge> : null}
        </div>
        {item.description ? (
          <span className="truncate text-xs text-muted-foreground">{item.description}</span>
        ) : null}
      </div>
      {selected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
    </>
  );
}

export function LookupCombobox({
  kind,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Search...',
  emptyLabel = 'No results found.',
  params,
  disabled,
  className,
}: LookupComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isFetching } = useQuery({
    queryKey: lookupKey(kind, search, params),
    queryFn: () => lookupsAPI.get(kind, { ...params, search, limit: params?.limit ?? 25 }),
    enabled: open && !disabled,
    staleTime: 30_000,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const selectedItem = useMemo(
    () => items.find((item) => item.value === value || item.id === value),
    [items, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className="min-w-0 truncate text-left">
            {selectedItem?.label ?? value ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>{isFetching ? 'Searching...' : emptyLabel}</CommandEmpty>
            <CommandGroup
              heading={
                data ? `${data.total} result${data.total === 1 ? '' : 's'} · ${data.activeCount} active` : undefined
              }
            >
              {items.map((item) => {
                const selected = item.value === value || item.id === value;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.description ?? ''}`}
                    onSelect={() => {
                      onChange(item.value, item);
                      setOpen(false);
                    }}
                  >
                    <LookupOption item={item} selected={selected} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {isFetching ? (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function LookupMultiCombobox({
  kind,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Search...',
  emptyLabel = 'No results found.',
  params,
  disabled,
  className,
}: LookupMultiComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, LookupItem>>({});

  const { data, isFetching } = useQuery({
    queryKey: lookupKey(kind, search, params),
    queryFn: () => lookupsAPI.get(kind, { ...params, search, limit: params?.limit ?? 25 }),
    enabled: open && !disabled,
    staleTime: 30_000,
  });

  const items = data?.items ?? [];
  const valueSet = new Set(value);

  const toggle = (item: LookupItem) => {
    const selected = valueSet.has(item.value);
    const nextValue = selected ? value.filter((id) => id !== item.value) : [...value, item.value];
    const nextItems = { ...selectedItems };

    if (selected) {
      delete nextItems[item.value];
    } else {
      nextItems[item.value] = item;
    }

    setSelectedItems(nextItems);
    onChange(nextValue, Object.values(nextItems));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn('w-full justify-between', className)}
          >
            <span className="min-w-0 truncate text-left">
              {value.length === 0 ? placeholder : `${value.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>{isFetching ? 'Searching...' : emptyLabel}</CommandEmpty>
              <CommandGroup
                heading={
                  data ? `${data.total} result${data.total === 1 ? '' : 's'} · ${data.activeCount} active` : undefined
                }
              >
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.description ?? ''}`}
                    onSelect={() => toggle(item)}
                  >
                    <LookupOption item={item} selected={valueSet.has(item.value)} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1 pr-1">
              {selectedItems[id]?.label ?? id}
              <button
                type="button"
                onClick={() => {
                  const nextItems = { ...selectedItems };
                  delete nextItems[id];
                  onChange(value.filter((item) => item !== id), Object.values(nextItems));
                  setSelectedItems(nextItems);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
