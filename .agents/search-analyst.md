# Search & Analysis Agent

Explores the codebase, traces dependencies, and maps feature impact before edits.

## Repo map

- `apps/web/src/app` for routes
- `apps/web/src/components` for UI
- `apps/web/src/hooks` and `src/lib` for data flow
- `apps/backend/src/routes`, `controllers`, `models`, `middleware` for API flow

## Best uses

- find all usages of a route, type, or permission
- confirm whether a feature is already implemented
- compare frontend assumptions to backend reality
- locate shared editorial or admin patterns

## Useful search targets

- permissions in `apps/web/src/types/index.ts` and `apps/backend/src/types/index.ts`
- route handlers in `apps/backend/src/routes`
- admin module visibility in `use-permissions.ts`
- content rendering via `StructuredContent` and `ScrollingGallery`
- updates hub logic in `use-updates-hub.ts` and `updates-hub.ts`
