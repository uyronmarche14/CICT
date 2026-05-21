# Orchestrator Agent

Coordinates multi-step work across frontend, backend, docs, and tests.

## Best uses

- cross-stack features
- permission or auth changes
- content model changes
- admin workflows that touch API, UI, and docs

## Current repo realities

- Public announcement detail already exists.
- Roles and users admin pages already exist.
- Updates hub is a live public feature.
- Contact and several informational routes are still incomplete.

## Coordination checklist

1. confirm the current route or API actually exists
2. confirm whether the work is global or organization-scoped
3. align frontend types with backend types
4. update docs when a stale note is discovered
5. add or update tests when contracts change

## Key files

- [cictv4/src/types/index.ts](/home/ronmarche14/projects/CICT/cictv4/src/types/index.ts:1)
- [cict-backend/src/types/index.ts](/home/ronmarche14/projects/CICT/cict-backend/src/types/index.ts:1)
- [cictv4/src/hooks/permissions/use-permissions.ts](/home/ronmarche14/projects/CICT/cictv4/src/hooks/permissions/use-permissions.ts:1)
- [cict-backend/src/utils/rbac.ts](/home/ronmarche14/projects/CICT/cict-backend/src/utils/rbac.ts:1)
