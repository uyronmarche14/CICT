import dynamic from 'next/dynamic';

export const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor').then(mod => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-muted rounded" />,
  }
);
