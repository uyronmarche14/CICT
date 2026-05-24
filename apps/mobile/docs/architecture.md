# Architecture

## Visual System Boundary

- Architecture and visual identity are separate concerns.
- The current implementation scaffold is functionally valid, but its token file is not yet brand-aligned with the web app.
- Future UI refactors must follow:
  - `docs/design-system.md`
  - `docs/brand-parity.md`
  - `docs/materials.md`
- This phase intentionally does not redesign screens yet; it prepares the source material and contributor rules for that later pass.

## Routing

- Expo Router drives navigation from the `app/` directory.
- `app/(auth)` contains unauthenticated routes.
- `app/(tabs)` contains authenticated student routes.
- Root layout bootstraps auth, then routes the user into auth or app tabs.

## State Strategy

- TanStack React Query handles server state and cache invalidation.
- Zustand stores session state only: tokens, student identity, and bootstrap status.
- Local component state is preferred for UI-only concerns.

## API/Data Flow

1. App bootstraps tokens from SecureStore.
2. If tokens exist, the app requests the student profile.
3. Authenticated routes fetch student events, attendance, and profile through centralized API services.
4. Public home-feed content is loaded from published news and public announcements.
5. Token refresh is handled centrally by the Axios client.

## Feature Boundaries

- `features/auth`: login and session bootstrap behavior
- `features/profile`: student profile data access
- `features/announcements`: student home updates feed
- `features/events`: event list, detail, registration, QR flows
- `features/attendance`: attendance history
- `features/settings`: logout and app settings

## Scaling Guidance

- Add future routes first under `app/`, then place data and orchestration in the matching `src/features/*` directory.
- Keep service files thin and endpoint-focused.
- If shared types grow, split `src/types/` by domain instead of creating one large index file.
- Before major UI work, replace the current temporary mobile tokens with a web-aligned brand token layer rather than styling screens ad hoc.
