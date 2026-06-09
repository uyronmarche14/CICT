'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, Share2, Loader2, ExternalLink, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNewsById } from '@/hooks/use-news-by-id';
import { useNews } from '@/hooks/use-news';
import { NewsStatus } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { StructuredContent } from '@/components/StructuredContent';
import ScrollingGallery from '@/components/ScrollingGallery';
import { getOwnershipLabel } from '@/lib/content-ownership';
import { getFeatureBadge, getContentStatusBadge } from '@/utils/badge-helpers';

export default function NewsDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const { data: article, isLoading, error } = useNewsById(id);
  const { data: relatedData } = useNews(1, 3, NewsStatus.PUBLISHED);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/news')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  const authorDisplay = article.authorDisplayName ||
    (typeof article.author === 'object'
      ? `${article.author.firstName} ${article.author.lastName}`
      : 'CICT');

  const relatedArticles = relatedData?.news.filter(a => a._id !== id).slice(0, 3) || [];

  const heroImage = article.coverImage?.imageUrl || article.imageUrl;
  const articleBody = article.bodyHtml || article.content || '';
  const galleryImages = article.gallery?.map((image) => image.imageUrl) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-balance text-4xl font-bold lg:text-5xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
          {article.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          <Badge variant="outline">
            {getOwnershipLabel(article)}
          </Badge>
          {article.category && <Badge variant="secondary">{article.category}</Badge>}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{authorDisplay}</span>
            {article.authorRole && <span className="text-xs text-muted-foreground">({article.authorRole})</span>}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {article.publishedAt
                ? format(new Date(article.publishedAt), 'MMMM d, yyyy')
                : format(new Date(article.createdAt), 'MMMM d, yyyy')
              }
            </span>
          </div>
          {article.readingTime && <span className="text-muted-foreground">{article.readingTime} min read</span>}
          {getFeatureBadge(article.featured)}
        </div>

        {heroImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={article.coverImage?.alt || article.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="text-xl text-muted-foreground mb-8 font-medium leading-relaxed">
          {article.excerpt}
        </div>

        <StructuredContent bodyHtml={articleBody} sections={article.sections} className="mb-12" />

        {galleryImages.length > 0 ? (
          <div className="mb-12">
            <ScrollingGallery images={galleryImages} accentColor="#2563eb" />
          </div>
        ) : null}

        {article.tags && article.tags.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {article.referenceLinks && article.referenceLinks.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">References</h3>
            <div className="space-y-2">
              {article.referenceLinks.map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" />
                  {ref.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {article.attachmentItems && article.attachmentItems.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Attachments</h3>
            <div className="space-y-2">
              {article.attachmentItems.map((att, i) => (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 p-3 rounded-lg border hover:bg-secondary/20 transition-colors">
                  <Paperclip className="w-4 h-4 text-primary" />
                  <span className="font-medium">{att.label}</span>
                  {att.fileSize && <span className="text-xs text-muted-foreground ml-auto">({(att.fileSize / 1024).toFixed(0)} KB)</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        {article.sourceUrl && (
          <div className="mb-12">
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="w-3 h-3" />
              View original source
            </a>
          </div>
        )}

        <div className="flex items-center gap-4 py-6 border-t border-b border-border/50 mb-12">
          <span className="text-sm font-semibold text-foreground">Share this article:</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title,
                  text: article.excerpt,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => {
                const relatedAuthor = typeof related.author === 'object'
                  ? `${related.author.firstName} ${related.author.lastName}`
                  : 'CICT';

                return (
                  <Link
                    key={related._id}
                    href={`/news/${related._id}`}
                    className="group block"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                      {related.coverImage?.imageUrl || related.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={related.coverImage?.imageUrl || related.imageUrl}
                          alt={related.coverImage?.alt || related.title}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    {getContentStatusBadge(related.status)}
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      By {relatedAuthor}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
