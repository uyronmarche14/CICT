# Announcements System Audit

Last updated: 2026-05-20

## Purpose

This document records the current announcement feature set and the key structure still missing for more specific organization and leadership announcement workflows.

## Current announcement surfaces

- Public list page: `/announcements`
- Public detail page: `/announcements/[id]`
- Admin announcement management: `/admin/announcements`
- Backend model/controller/routes: `apps/backend/src/models/Announcement.ts`, `apps/backend/src/controllers/announcement.controller.ts`, `apps/backend/src/routes/announcement.routes.ts`

## What already works

- Announcements already support:
  `title`, `content`, `priority`, `type`, `targetAudience`, `expiresAt`, `sections`, `coverImage`, `gallery`, `ownerType`, `organizationId`, `status`, and active/archive state.
- This is already a stronger content model than the current event and member admin flows in some areas.
- Admins can create organization-scoped and official announcements with audience and expiry controls.

## Current code anchors

- Public list page: `/home/ronmarche14/projects/CICT/apps/web/src/app/announcements/page.tsx`
- Public detail page: `/home/ronmarche14/projects/CICT/apps/web/src/app/announcements/[id]/page.tsx`
- Admin page: `/home/ronmarche14/projects/CICT/apps/web/src/app/admin/announcements/page.tsx`
- Admin form: `/home/ronmarche14/projects/CICT/apps/web/src/components/admin/AnnouncementForm.tsx`
- Frontend types: `/home/ronmarche14/projects/CICT/apps/web/src/types/index.ts`
- Backend model: `/home/ronmarche14/projects/CICT/apps/backend/src/models/Announcement.ts`

## Current gaps

### 1. Announcement types are still broad

The current types focus on generic content classes such as `general`, `academic`, `event`, and `emergency`. They do not yet cover common organization lifecycle announcements in a structured way.

### 2. Leadership transition announcements are not modeled

There is no dedicated structure for:

- New officers
- Election results
- Turnover announcements
- Recognition posts
- Recruitment notices

This makes leadership updates possible only as free-form body content instead of structured records that other pages can reuse.

### 3. Announcement content cannot power richer downstream UI yet

Because leadership- and organization-specific subtypes do not exist, the landing page, updates hub, and organization pages cannot safely build dedicated announcement widgets around those cases.

## Missing data to add next

- `subtype`
- `effectiveDate`
- `termStart`
- `termEnd`
- `relatedOrganizationId`
- `relatedEventId`
- `approvalSource`
- `contactName`
- `contactEmail`
- `ctaLabel`
- `ctaUrl`
- `officerItems`
- `outgoingOfficerItems`
- `awardItems`
- `attachmentItems`

## Missing functions

- Structured announcement templates for common organization workflows
- Leadership-transition announcement flow
- Recognition or achievement announcement flow
- Recruitment or call-for-members announcement flow
- Announcement CTA rendering for forms, documents, and related pages
- Better grouping in public feeds by subtype and organization context

## Priority recommendations

1. Add `subtype` support before adding more UI.
2. Create structured officer lists for election and turnover announcements.
3. Add CTA fields so announcements can point to forms, event pages, and documents.
4. Reuse structured announcement data in the landing page and updates hub.
