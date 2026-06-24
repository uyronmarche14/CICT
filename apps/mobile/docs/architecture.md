# Architecture

## Visual System Boundary

- Architecture and visual identity are separate concerns.
- The current implementation scaffold is functionally valid, with tokens brand-aligned to the web app (see `src/theme/tokens.ts`).
- Future UI refactors must follow:
  - `docs/design-system.md`
  - `docs/brand-parity.md`
  - `docs/materials.md`
- This phase intentionally does not redesign screens yet; it prepares the source material and contributor rules for that later pass.

## Routing

- Expo Router drives navigation from the `app/` directory.
- `app/(auth)` contains unauthenticated routes.
- `app/(tabs)` contains authenticated student routes.
- `app/(admin)` contains authenticated admin routes.
- `app/(admin)/scanner` contains the admin attendance scanner flow: event selector, camera scanner, manual entry, recent scans, and undo.
- Root layout bootstraps auth, then routes by session `actorType`.

## State Strategy

- TanStack React Query handles server state and cache invalidation.
- Zustand stores session state only: actor type, tokens, student identity or admin profile, and bootstrap status.
- Local component state is preferred for UI-only concerns.

## API/Data Flow

1. App bootstraps the versioned session from SecureStore.
2. Student sessions revalidate through `/student/profile`.
3. Admin sessions revalidate through `/auth/profile`.
4. Authenticated student routes fetch student events, attendance, and profile through centralized API services.
5. Authenticated admin routes are gated by backend RBAC data: permissions, visible modules, and scoped organization modules.
6. Token refresh is handled centrally by the Axios client and branches by session actor.
7. Admin scanner routes use `/admin/events/:id/attendance/*` and `/admin/events/:id/registrations/:regId/undo-checkin`; the web admin auth and student portal auth endpoints remain unchanged.

## Feature Boundaries

- `features/auth`: login and session bootstrap behavior
- `features/profile`: student profile data access
- `features/announcements`: student home updates feed
- `features/events`: event list, detail, registration, QR flows
- `features/scanner`: admin attendance scan, recent scan, and undo mutations
- `features/attendance`: attendance history
- `features/settings`: logout and app settings
- `utils/admin-access`: mobile admin tab gating from backend RBAC payloads
- `utils/auth-profile`: admin RBAC normalization and first-allowed-admin-route selection

## Scaling Guidance

- Add future routes first under `app/`, then place data and orchestration in the matching `src/features/*` directory.
- Keep service files thin and endpoint-focused.
- If shared types grow, split `src/types/` by domain instead of creating one large index file.
- Before major UI work, replace the current temporary mobile tokens with a web-aligned brand token layer rather than styling screens ad hoc.
