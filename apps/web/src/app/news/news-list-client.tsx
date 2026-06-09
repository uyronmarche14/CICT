'use client';

import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useNews } from '@/hooks/use-news';
import { NewsStatus } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { getOwnershipLabel } from '@/lib/content-ownership';

export default function NewsListClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useNews(page, 12, NewsStatus.PUBLISHED);

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-balance text-4xl font-bold lg:text-6xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
            News & Updates
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest news, events, and announcements from CICT
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Failed to load news articles</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.news.map((article) => {
                const author = typeof article.author === 'object' 
                  ? `${article.author.firstName} ${article.author.lastName}`
                  : 'CICT';

                return (
                  <Link
                    key={article._id}
                    href={`/news/${article._id}`}
                    className="group block"
                  >
                    <article className="h-full flex flex-col rounded-2xl border border-border/50 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {article.coverImage?.imageUrl || article.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={article.coverImage?.imageUrl || article.imageUrl}
                            alt={article.coverImage?.alt || article.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-background/90 backdrop-blur-sm">
                            {article.status}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                            {getOwnershipLabel(article)}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col p-6">
                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {article.publishedAt 
                                ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                                : format(new Date(article.createdAt), 'MMM d, yyyy')
                              }
                            </span>
                          </div>
                          <span>•</span>
                          <span>{author}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {article.gallery?.length ? (
                          <p className="text-xs text-muted-foreground mb-4">
                            {article.gallery.length} supporting image
                            {article.gallery.length > 1 ? 's' : ''}
                          </p>
                        ) : null}

                        {/* Read More */}
                        <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          <span>Read More</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Empty State */}
            {data.news.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No news articles found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
