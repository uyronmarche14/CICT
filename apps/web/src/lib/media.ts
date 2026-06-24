import { MediaAsset } from '@/types';

export type ContentWithMedia = {
  title?: string;
  coverImage?: MediaAsset;
  imageUrl?: string;
  imageId?: string;
};

export type NormalizedContentMedia = {
  imageUrl?: string;
  imageId?: string;
  alt: string;
  source: 'coverImage' | 'legacy' | 'none';
};

export const normalizeContentMedia = (
  content: ContentWithMedia,
  fallbackAlt = 'Content image'
): NormalizedContentMedia => {
  if (content.coverImage?.imageUrl) {
    return {
      imageUrl: content.coverImage.imageUrl,
      imageId: content.coverImage.imageId,
      alt: content.coverImage.alt || content.title || fallbackAlt,
      source: 'coverImage',
    };
  }

  if (content.imageUrl) {
    return {
      imageUrl: content.imageUrl,
      imageId: content.imageId,
      alt: content.title || fallbackAlt,
      source: 'legacy',
    };
  }

  return {
    alt: content.title || fallbackAlt,
    source: 'none',
  };
};

const isSameMediaAsset = (left: MediaAsset, right: MediaAsset) => {
  if (left.imageId && right.imageId && left.imageId === right.imageId) {
    return true;
  }

  if (
    left.assetFingerprint &&
    right.assetFingerprint &&
    left.assetFingerprint === right.assetFingerprint
  ) {
    return true;
  }

  return left.imageUrl === right.imageUrl;
};

export const sanitizeCoverAndGallery = (
  coverImage: MediaAsset | undefined,
  gallery: MediaAsset[]
) => {
  const nextGallery: MediaAsset[] = [];
  let removedDuplicates = 0;

  for (const asset of gallery) {
    if (coverImage && isSameMediaAsset(asset, coverImage)) {
      removedDuplicates += 1;
      continue;
    }

    if (nextGallery.some((existingAsset) => isSameMediaAsset(existingAsset, asset))) {
      removedDuplicates += 1;
      continue;
    }

    nextGallery.push(asset);
  }

  return {
    gallery: nextGallery.map((asset, index) => ({
      ...asset,
      sortOrder: index,
    })),
    removedDuplicates,
  };
};
