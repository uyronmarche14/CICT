import { describe, expect, it } from 'vitest';
import { sanitizeCoverAndGallery } from './media';

describe('sanitizeCoverAndGallery', () => {
  it('removes gallery items that duplicate the cover image', () => {
    const result = sanitizeCoverAndGallery(
      { imageId: 'cover-1', imageUrl: 'https://example.com/cover.jpg', alt: 'Cover', sortOrder: 0 },
      [
        { imageId: 'cover-1', imageUrl: 'https://example.com/cover.jpg', alt: 'Cover duplicate', sortOrder: 0 },
        { imageId: 'gallery-1', imageUrl: 'https://example.com/gallery.jpg', alt: 'Gallery', sortOrder: 1 },
      ]
    );

    expect(result.removedDuplicates).toBe(1);
    expect(result.gallery).toHaveLength(1);
    expect(result.gallery[0]?.imageId).toBe('gallery-1');
    expect(result.gallery[0]?.sortOrder).toBe(0);
  });

  it('deduplicates gallery items even when no cover image is present', () => {
    const result = sanitizeCoverAndGallery(undefined, [
      { imageUrl: 'https://example.com/one.jpg', alt: 'One', sortOrder: 0 },
      { imageUrl: 'https://example.com/one.jpg', alt: 'Duplicate one', sortOrder: 1 },
      { imageUrl: 'https://example.com/two.jpg', alt: 'Two', sortOrder: 2 },
    ]);

    expect(result.removedDuplicates).toBe(1);
    expect(result.gallery.map((asset) => asset.imageUrl)).toEqual([
      'https://example.com/one.jpg',
      'https://example.com/two.jpg',
    ]);
    expect(result.gallery.map((asset) => asset.sortOrder)).toEqual([0, 1]);
  });

  it('removes a gallery item that matches the cover image by assetFingerprint', () => {
    const result = sanitizeCoverAndGallery(
      {
        imageId: 'cover-asset',
        imageUrl: 'https://example.com/cover.jpg',
        assetFingerprint: 'same-file:1024:image/jpeg',
        alt: 'Cover',
        sortOrder: 0,
      },
      [
        {
          imageId: 'gallery-copy',
          imageUrl: 'https://example.com/cover-copy.jpg',
          assetFingerprint: 'same-file:1024:image/jpeg',
          alt: 'Copy',
          sortOrder: 0,
        },
        {
          imageId: 'gallery-unique',
          imageUrl: 'https://example.com/unique.jpg',
          assetFingerprint: 'unique-file:2048:image/jpeg',
          alt: 'Unique',
          sortOrder: 1,
        },
      ]
    );

    expect(result.removedDuplicates).toBe(1);
    expect(result.gallery).toHaveLength(1);
    expect(result.gallery[0]?.imageId).toBe('gallery-unique');
  });
});
