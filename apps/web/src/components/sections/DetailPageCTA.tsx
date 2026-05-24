'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface DetailPageCTAProps {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  contactEmail?: string;
  additionalLinks?: Array<{
    icon?: React.ReactNode;
    label: string;
    href: string;
  }>;
}

export default function DetailPageCTA({
  title,
  subtitle,
  description,
  primaryButtonText = 'Contact Us',
  primaryButtonHref,
  contactEmail = 'cict@university.edu',
  additionalLinks = []
}: DetailPageCTAProps) {
  const router = useRouter();

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {subtitle}
          </p>
          <h2 className="text-balance text-4xl font-bold lg:text-5xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border border-border/50">
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {title}
            </h3>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {primaryButtonHref && (
                <a
                  href={primaryButtonHref}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-white/90 text-primary font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-5 h-5" />
                  {primaryButtonText}
                </a>
              )}
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="px-8 py-4 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 font-semibold"
              >
                Back to Home
              </Button>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-white/90">
                Have questions? We&apos;re here to help!
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {contactEmail}
                </a>
                {additionalLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
