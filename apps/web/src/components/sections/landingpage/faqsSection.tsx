'use client';

import { Loader2 } from 'lucide-react';
import { useFAQContent } from '@/hooks/use-faq-content';
import FAQSectionContent from './FAQSectionContent';

const FAQsSection = () => {
  const { data, isLoading, error } = useFAQContent();

  if (isLoading) {
    return (
      <section className="bg-background py-20">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return null;
  }

  return <FAQSectionContent data={data} />;
};

export default FAQsSection;
