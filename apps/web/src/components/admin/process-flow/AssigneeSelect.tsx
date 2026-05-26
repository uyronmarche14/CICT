'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search, UserPlus } from 'lucide-react';

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
          <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
            <UserPlus className="h-3.5 w-3.5 mr-2" />
            {value.length === 0 ? 'Assign people...' : `${value.length} assigned`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-2" align="start">
          <div className="flex items-center gap-2 border-b pb-2 mb-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="h-7 text-xs border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-[200px]">
            {users.map((user) => {
              const selected = value.some((a) => a.id === user.id);
              const displayName = `${user.firstName} ${user.lastName}`;
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id, displayName)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${
                    selected ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-medium shrink-0">
                    {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                    {user.lastName?.charAt(0)?.toUpperCase() || ''}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="truncate font-medium">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {selected && <span className="text-[10px] text-primary font-medium">✓</span>}
                </button>
              );
            })}
            {users.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
            )}
          </ScrollArea>
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
