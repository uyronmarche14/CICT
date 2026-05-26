'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEOHead({ title, description, ogImage, ogType = 'article' }: SEOHeadProps) {
  useEffect(() => {
    const rootTitle = document.title.includes('|') ? document.title.split('|')[1]?.trim() : 'CICT';
    document.title = `${title} | ${rootTitle || 'CICT'}`;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMeta = (name: string, property = false) => {
      const attr = property ? 'property' : 'name';
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) el.remove();
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    } else {
      removeMeta('description');
      removeMeta('og:description', true);
      removeMeta('twitter:description');
    }

    const ogImg = ogImage || '/og-default.png';
    setMeta('og:title', title, true);
    setMeta('og:type', ogType, true);
    setMeta('twitter:title', title);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('og:image', ogImg, true);
    setMeta('twitter:image', ogImg);

    return () => {
      document.title = rootTitle;
      removeMeta('description');
      removeMeta('og:description', true);
      removeMeta('og:title', true);
      removeMeta('og:type', true);
      removeMeta('og:image', true);
      removeMeta('twitter:description');
      removeMeta('twitter:title');
      removeMeta('twitter:card');
      removeMeta('twitter:image');
    };
  }, [title, description, ogImage, ogType]);

  return null;
}
