# Debugger Agent

Diagnoses full-stack bugs and integration mismatches across `apps/web` and `apps/backend`.

## Best targets

- broken auth flows
- permission and visibility bugs
- admin route guards
- data not appearing on public pages
- query hook bugs
- backend contract mismatches

## First places to inspect

- [AuthContext.tsx](/home/ronmarche14/projects/CICT/apps/web/src/context/AuthContext.tsx:1)
- [use-permissions.ts](/home/ronmarche14/projects/CICT/apps/web/src/hooks/permissions/use-permissions.ts:1)
- [axios.ts](/home/ronmarche14/projects/CICT/apps/web/src/lib/api/axios.ts:1)
- [app.ts](/home/ronmarche14/projects/CICT/apps/backend/src/app.ts:1)
- [middleware/auth.ts](/home/ronmarche14/projects/CICT/apps/backend/src/middleware/auth.ts:1)
- [middleware/permissions.ts](/home/ronmarche14/projects/CICT/apps/backend/src/middleware/permissions.ts:1)

## Known active mismatches

- `apps/web/src/lib/api/refreshToken.ts` calls a backend route that does not exist.
- `apps/web/src/lib/api/auditAPI.ts` has no backend route counterpart yet.
- The contact page is empty even though older docs describe a finished redesign.
- Footer and CTA contact values are placeholders.

## Debugging habit

Trace both the route and the permission path before assuming the UI is wrong. In this repo, “nothing rendered” is often caused by admin visibility logic, missing auth profile data, or scope filtering rather than a simple JSX bug.
