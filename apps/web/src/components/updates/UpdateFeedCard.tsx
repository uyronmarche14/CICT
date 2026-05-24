'use client';

import Link from 'next/link';
import { ArrowRight, Bell, CalendarDays, MapPin, Newspaper } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/updates-hub';
import { cn } from '@/lib/utils';
import { type UpdateFeedItem } from '@/lib/updates-hub';

interface UpdateFeedCardProps {
  item: UpdateFeedItem;
}

const kindConfig = {
  news: {
    label: 'News',
    icon: Newspaper,
  },
  announcements: {
    label: 'Announcement',
    icon: Bell,
  },
  events: {
    label: 'Event',
    icon: CalendarDays,
  },
} as const;

export default function UpdateFeedCard({ item }: UpdateFeedCardProps) {
  const config = kindConfig[item.kind];
  const Icon = config.icon;
  const hasImage = !!item.image;

  return (
    <Link href={item.href} className="group block">
      <Card className="overflow-hidden rounded-xl border-border/30 bg-card/90 py-0 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">
        <CardContent className="p-0">
          <article
            className={cn(
              'grid gap-0',
              hasImage && 'md:grid-cols-[minmax(0,1fr)_240px] md:items-stretch'
            )}
          >
            <div className="flex flex-col justify-between space-y-4 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="gap-1 border-border/40 bg-muted/30 text-xs text-foreground/70">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                    {item.priorityOrType ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs capitalize border-border/40',
                          item.kind === 'announcements' &&
                            item.priorityOrType === 'urgent' &&
                            'bg-red-500/10 text-red-600 dark:text-red-400',
                          item.kind === 'announcements' &&
                            item.priorityOrType === 'high' &&
                            'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                          !(item.kind === 'announcements' && (item.priorityOrType === 'urgent' || item.priorityOrType === 'high')) &&
                            'bg-background/40 text-foreground/60'
                        )}
                      >
                        {item.priorityOrType}
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(item.displayDate)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-base font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {item.summary}
                  </p>
                </div>

                {item.meta.length > 0 ? (
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {item.meta.map((meta) => (
                      <div
                        key={`${item.kind}-${item.id}-${meta.label}`}
                        className="inline-flex items-center gap-1.5 text-xs text-foreground/70"
                      >
                        {meta.label === 'Location' ? (
                          <MapPin className="h-3 w-3 text-primary/60" />
                        ) : (
                          <CalendarDays className="h-3 w-3 text-primary/60" />
                        )}
                        <span>{meta.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/20 pt-4">
                <span className="text-xs text-muted-foreground">
                  {config.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-all duration-300">
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>

            {item.image ? (
              <div className="overflow-hidden bg-muted/30 md:border-l md:border-border/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image.src}
                  alt={item.image.alt}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] md:h-full"
                  loading="lazy"
                />
              </div>
            ) : null}
          </article>
        </CardContent>
      </Card>
    </Link>
  );
}
