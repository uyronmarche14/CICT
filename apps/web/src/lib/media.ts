import { MediaAsset } from '@/types';

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
