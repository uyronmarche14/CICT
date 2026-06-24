'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNews } from '@/hooks/use-news';
import { NewsStatus } from '@/types';
import { format } from 'date-fns';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle, type ViewMode } from '@/components/ui/ViewToggle';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { normalizeContentMedia } from '@/features/media';

export default function NewsListClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ownerType, setOwnerType] = useState<string>('');
  const [view, setView] = useState<ViewMode>('card');

  const { data, isLoading, error } = useNews(page, 12, NewsStatus.PUBLISHED, {
    search: search || undefined,
    ownerType: (ownerType || undefined) as 'system' | 'organization' | undefined,
  });

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-balance text-4xl font-display font-black lg:text-5xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-3">
            News & Updates
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Stay informed with the latest news, events, and announcements from CICT
          </p>
        </div>

        {/* Search + Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search news..." className="w-full sm:max-w-xs" />
          <div className="flex items-center gap-2">
            <Select
              value={ownerType || 'all'}
              onValueChange={(value) => {
                setOwnerType(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[180px] rounded-full bg-muted/50">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="system">CICT Official</SelectItem>
                  <SelectItem value="organization">Organizations</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:ml-auto">
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Failed to load news articles</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {data.news.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No news articles found.</p>
              </div>
            ) : view === 'card' ? (
              /* Card View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.news.map((article) => {
                  const author = typeof article.author === 'object'
                    ? `${article.author.firstName} ${article.author.lastName}`
                    : 'CICT';
                  const media = normalizeContentMedia(article, article.title);
                  return (
                    <Link key={article._id} href={`/news/${article._id}`} className="group block">
                      <article className="h-full flex flex-col rounded-2xl border border-border/50 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          {media.imageUrl ? (
                            <img src={media.imageUrl} alt={media.alt}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-muted-foreground">
                              <Calendar className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className="bg-background/90 backdrop-blur-sm text-xs">{article.status}</Badge>
                            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-xs">{getOwnershipLabel(article)}</Badge>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col p-5">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(article.publishedAt ?? article.createdAt), 'MMM d, yyyy')}
                            </span>
                            <span>•</span>
                            <span>{author}</span>
                          </div>
                          <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h2>
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{article.excerpt}</p>
                          <div className="flex items-center gap-2 text-primary font-medium text-sm mt-4 group-hover:gap-3 transition-all">
                            <span>Read More</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {data.news.map((article) => {
                  const author = typeof article.author === 'object'
                    ? `${article.author.firstName} ${article.author.lastName}`
                    : 'CICT';
                  const media = normalizeContentMedia(article, article.title);
                  return (
                    <Link key={article._id} href={`/news/${article._id}`}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-muted/50 transition-colors">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {media.imageUrl ? (
                          <img src={media.imageUrl} alt={media.alt} className="w-full h-full object-cover" />
                        ) : (
                          <Calendar className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="text-[10px] uppercase">{getOwnershipLabel(article)}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(article.publishedAt ?? article.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">{article.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{article.excerpt}</p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 pt-1">{author}</div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="min-w-[36px]">
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
