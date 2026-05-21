# Public Content System

Last updated: 2026-05-20

## Overview

`cictv4` now exposes a broader public content system than the older “news only” label suggests. The current public content surface includes:
- news
- announcements
- events
- the unified updates hub

## Public routes

- `/news` and `/news/[id]`
- `/announcements` and `/announcements/[id]`
- `/events` and `/events/[id]`
- `/updates`

Route files live under [src/app](/home/ronmarche14/projects/CICT/cictv4/src/app:1).

## Shared content model

News, announcements, and events all use similar building blocks:
- rich body HTML
- optional `sections`
- cover image
- gallery media
- ownership metadata (`system` or `organization`)

Key shared rendering pieces:
- [StructuredContent.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/StructuredContent.tsx:1)
- [ScrollingGallery.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/ScrollingGallery.tsx:1)
- [content-ownership.ts](/home/ronmarche14/projects/CICT/cictv4/src/lib/content-ownership.ts:1)

## Updates hub

The updates hub at `/updates` is the current aggregation layer for public content.

Primary files:
- [UpdatesHubClient.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/updates/UpdatesHubClient.tsx:1)
- [use-updates-hub.ts](/home/ronmarche14/projects/CICT/cictv4/src/hooks/use-updates-hub.ts:1)
- [updates-hub.ts](/home/ronmarche14/projects/CICT/cictv4/src/lib/updates-hub.ts:1)

Current capabilities:
- category filtering
- official vs community scope filtering
- organization filtering
- search query syncing through URL params
- mixed feed ordering across news, announcements, and events

## Admin surfaces

The admin app currently includes content management pages for:
- news
- announcements
- events
- organizations
- FAQ

Key routes:
- [admin/news/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/admin/news/page.tsx:1)
- [admin/announcements/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/admin/announcements/page.tsx:1)
- [admin/events/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/admin/events/page.tsx:1)
- [admin/organizations/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/admin/organizations/page.tsx:1)
- [admin/faq/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/admin/faq/page.tsx:1)

## Known integration gaps

- `refreshToken.ts` still points to `/auth/refresh-token`, but the backend does not define that route.
- `auditAPI.ts` exists on the frontend, but the backend currently has no matching audit route group.
- The public contact route is not yet part of this content workflow.
