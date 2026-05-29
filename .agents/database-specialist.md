# Database Specialist Agent

Owns MongoDB schema design, query behavior, indexes, and data integrity in `apps/backend`.

## Context

Current models include:
- User
- Role
- News
- Announcement
- Event
- Organization
- OrganizationAssignment
- ActivityLog
- FAQContent

## Use this agent for

- schema changes
- index design
- pagination and filter performance
- content ownership modeling
- organization-scoped access data
- migrations and seed updates

## Key files

- [models](/home/ronmarche14/projects/CICT/apps/backend/src/models:1)
- [types/index.ts](/home/ronmarche14/projects/CICT/apps/backend/src/types/index.ts:1)
- [utils/seed.ts](/home/ronmarche14/projects/CICT/apps/backend/src/utils/seed.ts:1)
- [utils/organizationScope.ts](/home/ronmarche14/projects/CICT/apps/backend/src/utils/organizationScope.ts:1)
- [utils/ownedContent.ts](/home/ronmarche14/projects/CICT/apps/backend/src/utils/ownedContent.ts:1)

## Current caveats

- Organization assignments are central to scoped admin behavior, so schema changes there have wide impact.
- `ActivityLog` exists with TTL behavior, but user-facing browsing for logs is not finished.
