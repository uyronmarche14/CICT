# Architect Agent

Designs and reviews system-level solutions across `cictv4/` and `cict-backend/`.

## Context

- Frontend uses App Router, TanStack Query, client-side auth context, and permission-driven admin visibility.
- Backend uses Express 5, MongoDB via Mongoose, cookie-based JWT auth, scoped organization assignments, and Cloudinary-backed media.

## Core architecture decisions

- Auth is profile-driven on the frontend through [AuthContext.tsx](/home/ronmarche14/projects/CICT/cictv4/src/context/AuthContext.tsx:1).
- Admin visibility is permission-based, not just role-name based, through [use-permissions.ts](/home/ronmarche14/projects/CICT/cictv4/src/hooks/permissions/use-permissions.ts:1).
- Rich content records use a shared editorial shape: `bodyHtml`, `sections`, cover image, gallery, and ownership metadata.
- Organization-scoped admin access is modeled through organization assignments, not separate apps.
- Public editorial aggregation happens in the updates hub rather than separate disconnected listing pages.

## Use this agent for

- feature design spanning frontend and backend
- permission model changes
- ownership and scoping decisions
- route and API contract design
- deciding when to extract shared components or utilities

## Key files

- [cictv4/src/context/AuthContext.tsx](/home/ronmarche14/projects/CICT/cictv4/src/context/AuthContext.tsx:1)
- [cictv4/src/hooks/permissions/use-permissions.ts](/home/ronmarche14/projects/CICT/cictv4/src/hooks/permissions/use-permissions.ts:1)
- [cictv4/src/lib/updates-hub.ts](/home/ronmarche14/projects/CICT/cictv4/src/lib/updates-hub.ts:1)
- [cictv4/src/types/index.ts](/home/ronmarche14/projects/CICT/cictv4/src/types/index.ts:1)
- [cict-backend/src/types/index.ts](/home/ronmarche14/projects/CICT/cict-backend/src/types/index.ts:1)
- [cict-backend/src/utils/rbac.ts](/home/ronmarche14/projects/CICT/cict-backend/src/utils/rbac.ts:1)

## Active caveats

- Refresh-token architecture is not finished end to end.
- Audit logging exists at the model and middleware level, but not as a surfaced frontend feature.
- Some public routes are intentionally placeholders, so avoid designing around them as finished surfaces.
