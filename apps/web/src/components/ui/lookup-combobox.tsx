'use client';

import { useEffect, useMemo, useState } from 'react';
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
  clearable?: boolean;
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
  clearable?: boolean;
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
  clearable = true,
}: LookupComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cachedSelectedItem, setCachedSelectedItem] = useState<LookupItem | undefined>();

  const { data, isFetching } = useQuery({
    queryKey: lookupKey(kind, search, params),
    queryFn: () => lookupsAPI.get(kind, { ...params, search, limit: params?.limit ?? 25 }),
    enabled: open && !disabled,
    staleTime: 30_000,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const { data: selectedData } = useQuery({
    queryKey: lookupKey(kind, `selected:${value ?? ''}`, { ...params, ids: value }),
    queryFn: () => lookupsAPI.get(kind, { ...params, ids: value, limit: 1 }),
    enabled: !!value && !disabled,
    staleTime: 60_000,
  });

  useEffect(() => {
    const hydrated = selectedData?.items?.[0];
    if (hydrated) {
      setCachedSelectedItem(hydrated);
    }
  }, [selectedData?.items]);

  const selectedItem = useMemo(
    () => items.find((item) => item.value === value || item.id === value) ?? cachedSelectedItem,
    [cachedSelectedItem, items, value]
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
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {clearable && value ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                className="rounded-sm opacity-60 hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  setCachedSelectedItem(undefined);
                  onChange('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    setCachedSelectedItem(undefined);
                    onChange('');
                  }
                }}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
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
	                      setCachedSelectedItem(item);
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
  clearable = true,
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

  const { data: selectedData } = useQuery({
    queryKey: lookupKey(kind, `selected:${value.join(',')}`, { ...params, ids: value }),
    queryFn: () => lookupsAPI.get(kind, { ...params, ids: value, limit: Math.max(value.length, 1) }),
    enabled: value.length > 0 && !disabled,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!selectedData?.items?.length) {
      return;
    }
    setSelectedItems((current) => {
      const next = { ...current };
      selectedData.items.forEach((item) => {
        next[item.value] = item;
      });
      return next;
    });
  }, [selectedData?.items]);

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
              {clearable ? (
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
              ) : null}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
