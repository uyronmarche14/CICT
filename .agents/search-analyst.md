# Search & Analysis Agent

Explores the codebase, traces dependencies, and maps feature impact before edits.

## Repo map

- `cictv4/src/app` for routes
- `cictv4/src/components` for UI
- `cictv4/src/hooks` and `src/lib` for data flow
- `cict-backend/src/routes`, `controllers`, `models`, `middleware` for API flow

## Best uses

- find all usages of a route, type, or permission
- confirm whether a feature is already implemented
- compare frontend assumptions to backend reality
- locate shared editorial or admin patterns

## Useful search targets

- permissions in `cictv4/src/types/index.ts` and `cict-backend/src/types/index.ts`
- route handlers in `cict-backend/src/routes`
- admin module visibility in `use-permissions.ts`
- content rendering via `StructuredContent` and `ScrollingGallery`
- updates hub logic in `use-updates-hub.ts` and `updates-hub.ts`
