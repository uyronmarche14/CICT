import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import NewsDetailClient from './news-detail-client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/news/${id}`, { next: { revalidate: 60 } });
    const json = await res.json();
    const news = json.data;
    return {
      title: `${news.title} | CICT News`,
      description: news.excerpt || '',
      openGraph: {
        title: news.title,
        description: news.excerpt,
        images: news.coverImage?.imageUrl ? [{ url: news.coverImage.imageUrl }] : [],
      },
    };
  } catch {
    return { title: 'News | CICT' };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <NewsDetailClient id={id} />
    </Suspense>
  );
}
