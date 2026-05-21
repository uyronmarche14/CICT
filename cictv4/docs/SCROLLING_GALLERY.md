# Scrolling Gallery

Last updated: 2026-05-20

## Component

The gallery lives at [ScrollingGallery.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/ScrollingGallery.tsx:1).

## Current behavior

- breaks out of the page container to full viewport width
- splits incoming images into three rows
- duplicates each row set to create an infinite-scroll illusion
- uses `next-cloudinary` for image rendering
- applies accent-colored borders and hover overlays

## Props

```ts
interface ScrollingGalleryProps {
  images: string[];
  accentColor: string;
}
```

## Current usage

The component is reused by:
- member detail pages
- news detail pages
- announcement detail pages
- event detail pages

## Implementation notes

- The gallery is purely presentational.
- It expects ready-to-render image URLs.
- Animation uses component-local keyframes instead of a shared animation utility.
- Hover pauses the marquee effect on pointer devices.

## Current caveats

- Alt text is generic because only image URLs are passed in.
- Reduced-motion handling is not built into the component yet.
- The header text inside the gallery is fixed to “Gallery”, so pages needing different section copy would need an extension.
