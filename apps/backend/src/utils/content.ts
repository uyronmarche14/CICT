import {
  IContentSection,
  IEventScheduleItem,
  IMediaAsset,
  ISpeakerItem,
  IAttachmentItem,
  IOfficerItem,
  IAwardItem,
  IReferenceLink,
} from '../types';

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const buildLegacyPlainText = (bodyHtml: string): string => stripHtml(bodyHtml);

export const normalizeMediaAsset = (
  value: unknown,
  fallback?: { imageUrl?: string; imageId?: string; assetFingerprint?: string }
): IMediaAsset | undefined => {
  if (value && typeof value === 'object') {
    const asset = value as Record<string, unknown>;
    const imageUrl = typeof asset.imageUrl === 'string' ? asset.imageUrl : fallback?.imageUrl;
    if (!imageUrl) {
      return undefined;
    }

    return {
      imageUrl,
      imageId: typeof asset.imageId === 'string' ? asset.imageId : fallback?.imageId,
      assetFingerprint:
        typeof asset.assetFingerprint === 'string'
          ? asset.assetFingerprint
          : fallback?.assetFingerprint,
      alt:
        typeof asset.alt === 'string' && asset.alt.trim().length > 0
          ? asset.alt.trim()
          : 'Uploaded image',
      caption:
        typeof asset.caption === 'string' && asset.caption.trim().length > 0
          ? asset.caption.trim()
          : undefined,
      sortOrder: typeof asset.sortOrder === 'number' ? asset.sortOrder : 0,
    };
  }

  if (fallback?.imageUrl) {
    return {
      imageUrl: fallback.imageUrl,
      imageId: fallback.imageId,
      assetFingerprint: fallback.assetFingerprint,
      alt: 'Uploaded image',
      sortOrder: 0,
    };
  }

  return undefined;
};

export const normalizeGallery = (value: unknown): IMediaAsset[] => {
  return normalizeGalleryExcludingCover(value);
};

const isSameMediaAsset = (left: IMediaAsset, right: IMediaAsset) => {
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

export const normalizeGalleryExcludingCover = (
  value: unknown,
  coverImage?: IMediaAsset
): IMediaAsset[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const assets: IMediaAsset[] = [];

  value.forEach((item, index) => {
    const asset = normalizeMediaAsset(item);
    if (!asset) {
      return;
    }

    assets.push({
      ...asset,
      sortOrder: typeof asset.sortOrder === 'number' ? asset.sortOrder : index,
    });
  });

  const uniqueGallery: IMediaAsset[] = [];

  for (const asset of assets) {
    if (coverImage && isSameMediaAsset(asset, coverImage)) {
      continue;
    }

    if (uniqueGallery.some((existingAsset) => isSameMediaAsset(existingAsset, asset))) {
      continue;
    }

    uniqueGallery.push(asset);
  }

  return uniqueGallery.map((asset, index) => ({
    ...asset,
    sortOrder: index,
  }));
};

export const normalizeSections = (value: unknown): IContentSection[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const section = item as Record<string, unknown>;
      const heading = typeof section.heading === 'string' ? section.heading.trim() : '';
      if (!heading) {
        return undefined;
      }

      const style =
        section.style === 'callout' || section.style === 'checklist'
          ? section.style
          : 'default';

      const items = Array.isArray(section.items)
        ? section.items.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        : [];

      const rawImage = section.image;
      const image = rawImage && typeof rawImage === 'object'
        ? normalizeMediaAsset(rawImage)
        : undefined;

      const rawLink = section.link;
      let link: { url: string; label: string } | undefined;
      if (rawLink && typeof rawLink === 'object') {
        const linkObj = rawLink as Record<string, unknown>;
        const url = typeof linkObj.url === 'string' ? linkObj.url.trim() : '';
        const label = typeof linkObj.label === 'string' ? linkObj.label.trim() : '';
        if (url && label) {
          link = { url, label };
        }
      }

      const rawEmbed = section.embed;
      let embed: { type: 'video' | 'map' | 'form'; url: string } | undefined;
      if (rawEmbed && typeof rawEmbed === 'object') {
        const embedObj = rawEmbed as Record<string, unknown>;
        const embedType = embedObj.type;
        const url = typeof embedObj.url === 'string' ? embedObj.url.trim() : '';
        if (url && (embedType === 'video' || embedType === 'map' || embedType === 'form')) {
          embed = { type: embedType, url };
        }
      }

      return {
        heading,
        style,
        bodyHtml: typeof section.bodyHtml === 'string' ? section.bodyHtml : '',
        items,
        image,
        link,
        embed,
      } as IContentSection;
    })
    .filter((section): section is IContentSection => Boolean(section));
};

export const normalizeSpeakerItems = (value: unknown): ISpeakerItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const raw = item as Record<string, unknown>;
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      if (!name) {
        return undefined;
      }

      return {
        name,
        title: typeof raw.title === 'string' ? raw.title.trim() : undefined,
        organization: typeof raw.organization === 'string' ? raw.organization.trim() : undefined,
        photo: normalizeMediaAsset(raw.photo),
      } as ISpeakerItem;
    })
    .filter((s): s is ISpeakerItem => Boolean(s));
};

export const normalizeOfficerItems = (value: unknown): IOfficerItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const raw = item as Record<string, unknown>;
      const position = typeof raw.position === 'string' ? raw.position.trim() : '';
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      if (!position || !name) {
        return undefined;
      }

      return {
        position,
        name,
        photo: normalizeMediaAsset(raw.photo),
      } as IOfficerItem;
    })
    .filter((o): o is IOfficerItem => Boolean(o));
};

export const normalizeAttachmentItems = (value: unknown): IAttachmentItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const raw = item as Record<string, unknown>;
      const label = typeof raw.label === 'string' ? raw.label.trim() : '';
      const url = typeof raw.url === 'string' ? raw.url.trim() : '';
      if (!label || !url) {
        return undefined;
      }

      return {
        label,
        url,
        fileType: typeof raw.fileType === 'string' ? raw.fileType : undefined,
        fileSize: typeof raw.fileSize === 'number' ? raw.fileSize : undefined,
      } as IAttachmentItem;
    })
    .filter((a): a is IAttachmentItem => Boolean(a));
};

export const normalizeAwardItems = (value: unknown): IAwardItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const raw = item as Record<string, unknown>;
      const title = typeof raw.title === 'string' ? raw.title.trim() : '';
      const recipient = typeof raw.recipient === 'string' ? raw.recipient.trim() : '';
      if (!title || !recipient) {
        return undefined;
      }

      return {
        title,
        recipient,
        category: typeof raw.category === 'string' ? raw.category.trim() : undefined,
        description: typeof raw.description === 'string' ? raw.description.trim() : undefined,
      } as IAwardItem;
    })
    .filter((a): a is IAwardItem => Boolean(a));
};

export const normalizeReferenceLinks = (value: unknown): IReferenceLink[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const raw = item as Record<string, unknown>;
      const label = typeof raw.label === 'string' ? raw.label.trim() : '';
      const url = typeof raw.url === 'string' ? raw.url.trim() : '';
      if (!label || !url) {
        return undefined;
      }

      return { label, url } as IReferenceLink;
    })
    .filter((r): r is IReferenceLink => Boolean(r));
};

export const normalizeSchedule = (value: unknown): IEventScheduleItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }

      const scheduleItem = item as Record<string, unknown>;
      const label = typeof scheduleItem.label === 'string' ? scheduleItem.label.trim() : '';
      const title = typeof scheduleItem.title === 'string' ? scheduleItem.title.trim() : '';
      if (!label || !title) {
        return undefined;
      }

      return {
        label,
        title,
        description:
          typeof scheduleItem.description === 'string' && scheduleItem.description.trim().length > 0
            ? scheduleItem.description.trim()
            : undefined,
      } as IEventScheduleItem;
    })
    .filter((item): item is IEventScheduleItem => Boolean(item));
};
