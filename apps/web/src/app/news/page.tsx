import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import NewsListClient from './news-list-client';

export const metadata: Metadata = {
  title: 'News & Updates | CICT',
  description: 'Stay informed with the latest CICT news, announcements, and organization updates.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <NewsListClient />
    </Suspense>
  );
}
