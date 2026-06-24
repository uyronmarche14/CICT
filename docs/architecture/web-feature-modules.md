# Web Feature Module Boundaries

The web app should keep route files thin. Pages in `apps/web/src/app` compose layout, read route params, and connect feature components; reusable data access and workflow behavior belongs in `apps/web/src/features`.

## Import Rules

- Pages, components, and hooks must not import `@/lib/api/axios` directly.
- API calls should live in `features/*/api.ts` or existing `lib/api/*` service wrappers.
- Shared query hooks should live beside the feature API that owns the data.
- Pages must not import another page or route segment directly. Move shared code into `features`, `components`, `hooks`, or `lib`.

## Current Feature Targets

- `features/admin-content`: news, announcements, events workflow/list APIs.
- `features/auth`: admin auth page API boundary.
- `features/calendar`: admin and organization calendar feed APIs.
- `features/organizations-admin`: organization admin assignment, student search, org file/quota APIs.
- `features/student-organizations`: student-facing organization listing.
- `features/updates`: public updates hub feed API.

This boundary is intentionally light: it prevents new page-level API coupling without forcing a full rewrite of existing UI composition.
