'use client';

import { ContentSection } from '@/types';
import { cn } from '@/lib/utils';
import { ExternalLink, MapPin } from 'lucide-react';

interface StructuredContentProps {
  bodyHtml: string;
  sections?: ContentSection[];
  className?: string;
}

export function StructuredContent({
  bodyHtml,
  sections = [],
  className,
}: StructuredContentProps) {
  return (
    <div className={cn('space-y-8', className)}>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {sections
        .filter((section) => section.heading.trim().length > 0)
        .map((section, index) => (
          <section
            key={`${section.heading}-${index}`}
            className={cn(
              'rounded-2xl border p-6',
              section.style === 'callout' ? 'bg-primary/5 border-primary/20' : 'bg-background',
              section.style === 'checklist' ? 'bg-secondary/30' : ''
            )}
          >
            <h3 className="text-xl font-semibold mb-4">{section.heading}</h3>
            {section.bodyHtml ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
              />
            ) : null}
            {section.items && section.items.length > 0 ? (
              <ul className="mt-4 space-y-2 list-disc list-outside pl-5 text-muted-foreground">
                {section.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.image ? (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={section.image.imageUrl}
                  alt={section.image.alt || section.heading}
                  className="w-full object-cover max-h-96"
                />
              </div>
            ) : null}
            {section.link ? (
              <div className="mt-4">
                <a
                  href={section.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  {section.link.label || section.link.url}
                </a>
              </div>
            ) : null}
            {section.embed ? (
              <div className="mt-4">
                {section.embed.type === 'video' ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={section.embed.url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <a
                    href={section.embed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    View {section.embed.type === 'map' ? 'Map' : 'Form'}
                  </a>
                )}
              </div>
            ) : null}
          </section>
        ))}
    </div>
  );
}
