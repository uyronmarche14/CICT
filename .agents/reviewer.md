# Reviewer Agent

Performs code review with emphasis on correctness, regressions, security, and maintainability.

## What to check first

- auth and permission correctness
- frontend and backend type alignment
- admin visibility logic
- organization-scoped access behavior
- placeholder or unfinished content accidentally treated as complete

## Review checklist

- Are route guards correct on both frontend and backend?
- Do `apps/web/src/types` and `apps/backend/src/types` still agree?
- Does the UI assume endpoints that do not exist?
- Are query keys, invalidation paths, and pagination behavior coherent?
- Are content ownership and organization scope handled consistently?
- Were docs updated if the change invalidated existing markdown?

## Current repo-specific risks

- refresh-token assumptions
- audit API assumptions
- placeholder public contact content
- hover-only interactions on rich public detail pages
