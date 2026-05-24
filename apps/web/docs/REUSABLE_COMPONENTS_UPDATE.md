# Reusable Components Guide

Last updated: 2026-05-20

## Overview

The frontend has settled around a handful of reusable content and section primitives. These are the best starting points when building or refactoring public pages.

## Primary shared components

### `PublicSectionHeader`

File:
- [PublicSectionHeader.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/sections/landingpage/PublicSectionHeader.tsx:1)

Use it for:
- public page section intros
- gradient title consistency
- eyebrow + title + description layouts
- optional action area layouts

### `StructuredContent`

File:
- [StructuredContent.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/StructuredContent.tsx:1)

Use it for:
- rendering HTML article bodies
- rendering additional callout or checklist sections
- keeping news, announcement, and event detail pages visually consistent

### `ScrollingGallery`

File:
- [ScrollingGallery.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/ScrollingGallery.tsx:1)

Use it for:
- full-bleed media strips
- member, news, event, and announcement galleries
- accent-colored media presentation

### Detail page wrappers

Files:
- [DetailPageCTA.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/sections/DetailPageCTA.tsx:1)
- [DetailPageFooter.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/sections/DetailPageFooter.tsx:1)

Use them for:
- public-detail page endings
- keeping CTA language and visual treatment aligned

## Current styling conventions

- Gradient titles: `bg-gradient-to-r from-foreground to-primary`
- Rounded cards and soft borders for editorial content
- Cloudinary media through `next-cloudinary` where possible
- Organization-specific accent color passed as props for themed detail views

## Where these components are used

- landing page sections
- updates hub
- member detail page
- news detail page
- event detail page
- announcement detail page
