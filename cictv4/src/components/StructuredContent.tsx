'use client';

import { ContentSection } from '@/types';
import { cn } from '@/lib/utils';

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
          </section>
        ))}
    </div>
  );
}
