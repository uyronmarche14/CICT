'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEOHead({ title, description, ogImage, ogType = 'article' }: SEOHeadProps) {
  const siteTitle = 'CICT';
  const fullTitle = `${title} | ${siteTitle}`;
  const image = ogImage || '/og-default.png';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
