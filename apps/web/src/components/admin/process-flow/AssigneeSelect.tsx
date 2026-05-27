'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { X, UserPlus, Check } from 'lucide-react';

interface AssigneeSelectProps {
  value: Array<{ type: string; id: string; name?: string }>;
  onChange: (value: Array<{ type: string; id: string; name?: string }>) => void;
}

export function AssigneeSelect({ value, onChange }: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['users-for-assign', search],
    queryFn: () => usersAPI.getAll({ limit: 50, search: search || undefined }),
  });

  const users = data?.users || [];

  const toggleUser = useCallback(
    (userId: string, userName: string) => {
      const exists = value.some((a) => a.id === userId);
      if (exists) {
        onChange(value.filter((a) => a.id !== userId));
      } else {
        onChange([...value, { type: 'user', id: userId, name: userName }]);
      }
    },
    [value, onChange]
  );

  const removeUser = useCallback(
    (userId: string) => {
      onChange(value.filter((a) => a.id !== userId));
    },
    [value, onChange]
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs h-10" role="combobox" aria-expanded={open}>
            <UserPlus className="h-3.5 w-3.5 mr-2" />
            {value.length === 0 ? 'Assign people...' : `${value.length} assigned`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search users..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const selected = value.some((a) => a.id === user.id);
                  const displayName = `${user.firstName} ${user.lastName}`;
                  return (
                    <CommandItem
                      key={user.id}
                      value={`${displayName} ${user.email}`}
                      onSelect={() => {
                        toggleUser(user.id, displayName);
                      }}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-medium shrink-0 mr-2">
                        {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                        {user.lastName?.charAt(0)?.toUpperCase() || ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {selected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((a) => (
            <Badge key={a.id} variant="secondary" className="text-[10px] gap-1 pr-1">
              {a.name || a.id.slice(0, 8)}
              <button onClick={() => removeUser(a.id)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
