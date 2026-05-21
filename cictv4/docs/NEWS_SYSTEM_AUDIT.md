# News System Audit

Last updated: 2026-05-20

## Purpose

This document summarizes the current news feature set and the missing metadata and functions needed for a more complete campus and organization news system.

## Current news surfaces

- Public list page: `/news`
- Public detail page: `/news/[id]`
- Admin news management: `/admin/news`
- Backend model/controller/routes: `cict-backend/src/models/News.ts`, `cict-backend/src/controllers/news.controller.ts`, `cict-backend/src/routes/news.routes.ts`

## What already works

- News supports:
  `title`, `content`, `excerpt`, `tags`, `sections`, `coverImage`, `gallery`, `ownerType`, `organizationId`, `status`, `publishedAt`, and archive state.
- Admin ownership handling already supports official and organization-scoped content.
- Public article pages already render long-form content, related media, author context, and publish date.
- Admin news pages already include search plus ownership filters, which is ahead of some other modules.

## Current code anchors

- Public list page: `/home/ronmarche14/projects/CICT/cictv4/src/app/news/page.tsx`
- Public detail page: `/home/ronmarche14/projects/CICT/cictv4/src/app/news/[id]/page.tsx`
- Admin news page: `/home/ronmarche14/projects/CICT/cictv4/src/app/admin/news/page.tsx`
- Admin form: `/home/ronmarche14/projects/CICT/cictv4/src/components/admin/NewsForm.tsx`
- Backend model: `/home/ronmarche14/projects/CICT/cict-backend/src/models/News.ts`
- Backend controller: `/home/ronmarche14/projects/CICT/cict-backend/src/controllers/news.controller.ts`

## Current gaps

### 1. Article metadata is still basic

The current schema covers the main article body well enough, but not the richer editorial metadata that makes a news system easier to manage and easier to browse.

### 2. Related articles are not truly related

The current detail page fetches a few published articles and excludes the current one, but it does not compute relatedness using tags, category, organization, or topic overlap.

### 3. Public discovery is still shallow

The public news page mainly supports pagination. It does not yet provide stronger discovery controls such as category, tag, organization, or featured collections.

### 4. News is not strongly connected to the rest of the dynamic system

The model does not yet provide clean linking to events, leader transitions, organization milestones, or featured editorial groupings. That makes the content system feel flatter than it should.

## Missing data to add next

- `category`
- `featured`
- `pinned`
- `sourceUrl`
- `referenceLinks`
- `attachmentItems`
- `readingTime`
- `authorDisplayName`
- `authorRole`
- `associatedEventId`
- `associatedOrganizationId`
- `spotlightLabel`
- `seoDescription`
- `canonicalSlug`
- `relatedArticleIds`

## Missing functions

- Category-based browsing
- Tag-based browsing
- Organization-based news filtering on the public side
- Featured or pinned article support
- Smarter related-article recommendations
- Better internal linking between news, events, organizations, and announcements
- Editorial highlight blocks for the landing page and updates hub

## Priority recommendations

1. Add category and featured/pinned support first.
2. Improve related-article logic using tags and ownership.
3. Add public filters so organization news stays easy to find.
4. Link news records more directly to events and organization milestones.
