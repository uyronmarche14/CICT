import { describe, expect, it } from 'vitest';
import {
  normalizeGalleryExcludingCover,
  normalizeSpeakerItems,
  normalizeOfficerItems,
  normalizeAttachmentItems,
  normalizeAwardItems,
  normalizeReferenceLinks,
  normalizeSections,
} from './content';

describe('normalizeGalleryExcludingCover', () => {
  it('removes a gallery item when it matches the cover image by imageId', () => {
    const gallery = normalizeGalleryExcludingCover(
      [
        { imageId: 'cover-1', imageUrl: 'https://example.com/cover.jpg', alt: 'Cover' },
        { imageId: 'gallery-1', imageUrl: 'https://example.com/gallery.jpg', alt: 'Gallery' },
      ],
      { imageId: 'cover-1', imageUrl: 'https://example.com/cover.jpg', alt: 'Cover', sortOrder: 0 }
    );

    expect(gallery).toHaveLength(1);
    expect(gallery[0]?.imageId).toBe('gallery-1');
    expect(gallery[0]?.sortOrder).toBe(0);
  });

  it('removes duplicate gallery items and preserves unique supporting media', () => {
    const gallery = normalizeGalleryExcludingCover([
      { imageUrl: 'https://example.com/one.jpg', alt: 'One' },
      { imageUrl: 'https://example.com/one.jpg', alt: 'Duplicate one' },
      { imageUrl: 'https://example.com/two.jpg', alt: 'Two' },
    ]);

    expect(gallery).toHaveLength(2);
    expect(gallery.map((asset) => asset.imageUrl)).toEqual([
      'https://example.com/one.jpg',
      'https://example.com/two.jpg',
    ]);
    expect(gallery.map((asset) => asset.sortOrder)).toEqual([0, 1]);
  });

  it('handles non-array input gracefully', () => {
    const result = normalizeGalleryExcludingCover(null);
    expect(result).toEqual([]);
  });

  it('removes a gallery item when it matches the cover image by assetFingerprint', () => {
    const gallery = normalizeGalleryExcludingCover(
      [
        {
          imageId: 'gallery-copy',
          imageUrl: 'https://example.com/cover-copy.jpg',
          assetFingerprint: 'same-file:1024:image/jpeg',
          alt: 'Duplicate file',
        },
        {
          imageId: 'gallery-unique',
          imageUrl: 'https://example.com/unique.jpg',
          assetFingerprint: 'unique-file:2048:image/jpeg',
          alt: 'Unique file',
        },
      ],
      {
        imageId: 'cover-asset',
        imageUrl: 'https://example.com/cover.jpg',
        assetFingerprint: 'same-file:1024:image/jpeg',
        alt: 'Cover',
        sortOrder: 0,
      }
    );

    expect(gallery).toHaveLength(1);
    expect(gallery[0]?.imageId).toBe('gallery-unique');
  });
});

describe('normalizeSpeakerItems', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeSpeakerItems(null)).toEqual([]);
    expect(normalizeSpeakerItems(undefined)).toEqual([]);
    expect(normalizeSpeakerItems('string')).toEqual([]);
  });

  it('filters out invalid items', () => {
    const result = normalizeSpeakerItems([
      { name: 'John Doe', title: 'Speaker' },
      { title: 'No Name' },
      {},
      null,
      'string',
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('John Doe');
    expect(result[0]?.title).toBe('Speaker');
  });

  it('trims whitespace from strings', () => {
    const result = normalizeSpeakerItems([
      { name: '  Jane Doe  ', title: '  Professor  ' },
    ]);
    expect(result[0]?.name).toBe('Jane Doe');
    expect(result[0]?.title).toBe('Professor');
  });

  it('extracts organization and photo', () => {
    const result = normalizeSpeakerItems([
      { name: 'Jane Doe', organization: 'MIT', photo: { imageUrl: 'https://example.com/photo.jpg' } },
    ]);
    expect(result[0]?.organization).toBe('MIT');
    expect(result[0]?.photo?.imageUrl).toBe('https://example.com/photo.jpg');
  });
});

describe('normalizeOfficerItems', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeOfficerItems(null)).toEqual([]);
  });

  it('requires both position and name', () => {
    const result = normalizeOfficerItems([
      { position: 'President', name: 'Alice' },
      { position: 'VP', name: '' },
      { name: 'Bob' },
      { position: 'Treasurer' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.position).toBe('President');
    expect(result[0]?.name).toBe('Alice');
  });

  it('trims whitespace', () => {
    const result = normalizeOfficerItems([
      { position: '  Secretary  ', name: '  Charlie  ' },
    ]);
    expect(result[0]?.position).toBe('Secretary');
    expect(result[0]?.name).toBe('Charlie');
  });

  it('extracts optional photo', () => {
    const result = normalizeOfficerItems([
      { position: 'President', name: 'Alice', photo: { imageUrl: 'https://example.com/pres.jpg' } },
    ]);
    expect(result[0]?.photo?.imageUrl).toBe('https://example.com/pres.jpg');
  });
});

describe('normalizeAttachmentItems', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeAttachmentItems(undefined)).toEqual([]);
  });

  it('requires both label and url', () => {
    const result = normalizeAttachmentItems([
      { label: 'Guidelines', url: 'https://example.com/guide.pdf' },
      { label: 'No URL' },
      { url: 'https://example.com/no-label.pdf' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.label).toBe('Guidelines');
    expect(result[0]?.url).toBe('https://example.com/guide.pdf');
  });

  it('extracts optional fileType and fileSize', () => {
    const result = normalizeAttachmentItems([
      { label: 'PDF', url: 'https://example.com/file.pdf', fileType: 'application/pdf', fileSize: 1024 },
    ]);
    expect(result[0]?.fileType).toBe('application/pdf');
    expect(result[0]?.fileSize).toBe(1024);
  });

  it('trims whitespace', () => {
    const result = normalizeAttachmentItems([
      { label: '  Doc  ', url: '  https://example.com/doc.pdf  ' },
    ]);
    expect(result[0]?.label).toBe('Doc');
    expect(result[0]?.url).toBe('https://example.com/doc.pdf');
  });
});

describe('normalizeAwardItems', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeAwardItems(null)).toEqual([]);
  });

  it('requires both title and recipient', () => {
    const result = normalizeAwardItems([
      { title: 'Best Leader', recipient: 'John' },
      { title: 'No Recipient' },
      { recipient: 'No Title' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Best Leader');
    expect(result[0]?.recipient).toBe('John');
  });

  it('extracts optional category and description', () => {
    const result = normalizeAwardItems([
      { title: 'Dean\'s List', recipient: 'Jane', category: 'Academic', description: 'Top 10%' },
    ]);
    expect(result[0]?.category).toBe('Academic');
    expect(result[0]?.description).toBe('Top 10%');
  });

  it('trims whitespace', () => {
    const result = normalizeAwardItems([
      { title: '  Award  ', recipient: '  Bob  ', category: '  General  ' },
    ]);
    expect(result[0]?.title).toBe('Award');
    expect(result[0]?.recipient).toBe('Bob');
    expect(result[0]?.category).toBe('General');
  });
});

describe('normalizeReferenceLinks', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeReferenceLinks(null)).toEqual([]);
  });

  it('requires both label and url', () => {
    const result = normalizeReferenceLinks([
      { label: 'Source 1', url: 'https://example.com/1' },
      { label: 'No URL' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.label).toBe('Source 1');
    expect(result[0]?.url).toBe('https://example.com/1');
  });

  it('trims whitespace', () => {
    const result = normalizeReferenceLinks([
      { label: '  Docs  ', url: '  https://example.com/docs  ' },
    ]);
    expect(result[0]?.label).toBe('Docs');
    expect(result[0]?.url).toBe('https://example.com/docs');
  });
});

describe('normalizeSections with extended fields', () => {
  it('normalizes section image', () => {
    const result = normalizeSections([
      { heading: 'Section 1', image: { imageUrl: 'https://example.com/img.jpg', alt: 'Image' } },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.image?.imageUrl).toBe('https://example.com/img.jpg');
    expect(result[0]?.image?.alt).toBe('Image');
  });

  it('normalizes section link', () => {
    const result = normalizeSections([
      { heading: 'Section 1', link: { url: 'https://example.com', label: 'Learn More' } },
    ]);
    expect(result[0]?.link?.url).toBe('https://example.com');
    expect(result[0]?.link?.label).toBe('Learn More');
  });

  it('requires both url and label for link', () => {
    const result = normalizeSections([
      { heading: 'S1', link: { url: 'https://example.com' } },
      { heading: 'S2', link: { label: 'Click' } },
    ]);
    expect(result[0]?.link).toBeUndefined();
    expect(result[1]?.link).toBeUndefined();
  });

  it('normalizes section embed (video)', () => {
    const result = normalizeSections([
      { heading: 'S1', embed: { type: 'video', url: 'https://youtube.com/watch?v=123' } },
    ]);
    expect(result[0]?.embed?.type).toBe('video');
    expect(result[0]?.embed?.url).toBe('https://youtube.com/watch?v=123');
  });

  it('normalizes section embed (map and form)', () => {
    const result = normalizeSections([
      { heading: 'S1', embed: { type: 'map', url: 'https://maps.google.com' } },
      { heading: 'S2', embed: { type: 'form', url: 'https://forms.google.com' } },
    ]);
    expect(result[0]?.embed?.type).toBe('map');
    expect(result[1]?.embed?.type).toBe('form');
  });

  it('rejects invalid embed type', () => {
    const result = normalizeSections([
      { heading: 'S1', embed: { type: 'invalid', url: 'https://example.com' } },
    ]);
    expect(result[0]?.embed).toBeUndefined();
  });

  it('processes all extended fields together', () => {
    const result = normalizeSections([
      {
        heading: 'Rich Section',
        bodyHtml: '<p>Content</p>',
        items: ['Item 1'],
        image: { imageUrl: 'https://example.com/img.jpg' },
        link: { url: 'https://example.com', label: 'Link' },
        embed: { type: 'video', url: 'https://youtube.com' },
      },
    ]);
    expect(result[0]?.heading).toBe('Rich Section');
    expect(result[0]?.image?.imageUrl).toBe('https://example.com/img.jpg');
    expect(result[0]?.link?.url).toBe('https://example.com');
    expect(result[0]?.embed?.type).toBe('video');
  });
});
