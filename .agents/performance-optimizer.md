# Performance Optimizer Agent

Improves runtime and perceived performance across the CICT stack.

## Frontend hotspots

- updates hub feed aggregation and infinite loading
- Cloudinary media rendering on detail pages
- large animated sections such as gallery, timeline, and landing-page motion
- admin tables with filters and pagination

## Backend hotspots

- list endpoints with filters and pagination
- role and user search
- organization-scoped content queries
- upload and media workflows

## Key files

- [cictv4/src/components/updates/UpdatesHubClient.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/updates/UpdatesHubClient.tsx:1)
- [cictv4/src/hooks/use-updates-hub.ts](/home/ronmarche14/projects/CICT/cictv4/src/hooks/use-updates-hub.ts:1)
- [cictv4/src/components/ScrollingGallery.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/ScrollingGallery.tsx:1)
- [cict-backend/src/routes](/home/ronmarche14/projects/CICT/cict-backend/src/routes:1)

## Current caveats

- Some visually rich components are intentionally presentation-heavy, so optimize carefully without flattening the experience.
- Placeholder routes should not be used for performance baselines.
