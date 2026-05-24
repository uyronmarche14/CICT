'use client';

import { MediaAsset } from '@/types';
import { uploadsAPI } from '@/lib/api/uploads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MoveDown, MoveUp, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { sanitizeCoverAndGallery } from '@/lib/media';

interface GalleryManagerProps {
  label?: string;
  gallery: MediaAsset[];
  coverImage?: MediaAsset;
  onChange: (gallery: MediaAsset[]) => void;
  onDuplicateRemoval?: (count: number) => void;
}

export function GalleryManager({
  label = 'Gallery',
  gallery,
  coverImage,
  onChange,
  onDuplicateRemoval,
}: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedImages = await uploadsAPI.uploadImages(Array.from(files));
      const nextGallery = [
        ...gallery,
        ...uploadedImages.map((image, index) => ({
          ...image,
          sortOrder: gallery.length + index,
        })),
      ];
      const { gallery: sanitizedGallery, removedDuplicates } = sanitizeCoverAndGallery(
        coverImage,
        nextGallery
      );
      if (removedDuplicates > 0) {
        onDuplicateRemoval?.(removedDuplicates);
      }
      onChange(sanitizedGallery);
    } catch (error) {
      console.error('Failed to upload gallery images:', error);
    } finally {
      setUploading(false);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= gallery.length) return;

    const nextGallery = [...gallery];
    const [item] = nextGallery.splice(index, 1);
    nextGallery.splice(nextIndex, 0, item);
    onChange(nextGallery.map((image, sortOrder) => ({ ...image, sortOrder })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id={`${label}-upload`}
            onChange={(event) => handleUpload(event.target.files)}
          />
          <Button asChild variant="outline" size="sm" disabled={uploading}>
            <label htmlFor={`${label}-upload`} className="cursor-pointer gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Images
            </label>
          </Button>
        </div>
      </div>

      {gallery.length > 0 ? (
        <div className="space-y-3">
          {gallery.map((image, index) => (
            <div key={`${image.imageId || image.imageUrl}-${index}`} className="rounded-lg border p-3">
              <div className="grid gap-4 md:grid-cols-[120px_1fr_auto]">
                <div className="overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.imageUrl} alt={image.alt} className="h-28 w-full object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`alt-${index}`}>Alt text</Label>
                    <Input
                      id={`alt-${index}`}
                      value={image.alt}
                      onChange={(event) =>
                        onChange(
                          gallery.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, alt: event.target.value } : item
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`caption-${index}`}>Caption</Label>
                    <Input
                      id={`caption-${index}`}
                      value={image.caption ?? ''}
                      onChange={(event) =>
                        onChange(
                          gallery.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, caption: event.target.value } : item
                          )
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveItem(index, -1)}>
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveItem(index, 1)}>
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => onChange(gallery.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Upload one or more images to build a gallery.
        </div>
      )}
    </div>
  );
}
