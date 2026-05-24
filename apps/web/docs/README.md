# CICT Frontend Docs

Last updated: 2026-05-20

## Purpose

This folder documents the current `apps/web` frontend, especially the public editorial surfaces and the reusable UI patterns behind them. Several older markdown files here started as one-off change logs; they have now been trimmed down into current-state references.

## Current product snapshot

### Public routes

- `/`
- `/news` and `/news/[id]`
- `/announcements` and `/announcements/[id]`
- `/events` and `/events/[id]`
- `/updates`
- `/organization/[id]`
- `/member/[id]`

### Public placeholders or incomplete pages

- `/about`
- `/academics`
- `/admissions`
- `/student-life`
- `/contact`

### Student portal routes

- `/student/login`
- `/student/events`
- `/student/events/[id]`
- `/student/events/[id]/qr`
- `/student/registrations`

### Admin routes

- `/admin/dashboard`
- `/admin/login`
- `/admin/users`
- `/admin/roles`
- `/admin/news`
- `/admin/announcements`
- `/admin/events`
- `/admin/organizations`
- `/admin/faq`
- `/admin/logs`
- `/admin/students`
- `/admin/students/settings`
- `/admin/processes`

## Canonical docs in this folder

- [implementation/MASTER_ROADMAP.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/MASTER_ROADMAP.md:1)
  This now links the completed, in-progress, scaffold-only, and audit-driven expansion phases.
- [NEWS_SYSTEM_IMPLEMENTATION.md](/home/ronmarche14/projects/CICT/apps/web/docs/NEWS_SYSTEM_IMPLEMENTATION.md:1)
- [EVENTS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/EVENTS_SYSTEM_AUDIT.md:1)
- [NEWS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/NEWS_SYSTEM_AUDIT.md:1)
- [ANNOUNCEMENTS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/ANNOUNCEMENTS_SYSTEM_AUDIT.md:1)
- [ORGANIZATIONS_AND_LEADERS_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/ORGANIZATIONS_AND_LEADERS_AUDIT.md:1)
- [LANDING_AND_UPDATES_HUB_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/LANDING_AND_UPDATES_HUB_AUDIT.md:1)
- [REUSABLE_COMPONENTS_UPDATE.md](/home/ronmarche14/projects/CICT/apps/web/docs/REUSABLE_COMPONENTS_UPDATE.md:1)
- [MEMBER_PAGE_IMPROVEMENTS.md](/home/ronmarche14/projects/CICT/apps/web/docs/MEMBER_PAGE_IMPROVEMENTS.md:1)
- [SCROLLING_GALLERY.md](/home/ronmarche14/projects/CICT/apps/web/docs/SCROLLING_GALLERY.md:1)
- [TIMELINE_FEATURE.md](/home/ronmarche14/projects/CICT/apps/web/docs/TIMELINE_FEATURE.md:1)
- [CONTACT_FOOTER_REDESIGN.md](/home/ronmarche14/projects/CICT/apps/web/docs/CONTACT_FOOTER_REDESIGN.md:1)

## Known active gaps

- The contact page does not yet implement the UI previously described in older docs.
- Footer contact and social links still use placeholder values.
- `refreshToken.ts` targets a backend route that does not exist.
- `auditAPI.ts` exists on the frontend, but there is no matching backend audit route group yet.

## Recommended doc maintenance rule

Prefer documenting current behavior and remaining gaps over keeping long historical change logs. When a file becomes mostly historical, reduce it to a short archival pointer instead of letting it drift away from the code.
