import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { PublicOrganizationPageClient } from './org-detail-client';

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/organizations/${id}`, { next: { revalidate: 60 } });
    const json = await res.json();
    const org = json.data;

    return {
      title: `${org.name} | CICT`,
      description: org.seoDescription || org.description || '',
      openGraph: {
        title: org.name,
        description: org.seoDescription || org.description,
        images: org.logo ? [{ url: org.logo }] : [],
      },
    };
  } catch {
    return { title: 'Organization | CICT' };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Fallback />}>
      <PublicOrganizationPageClient id={id} />
    </Suspense>
  );
}
