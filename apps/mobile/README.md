# CICT Mobile

Student-facing Expo React Native app for CICT. This app lives at `apps/mobile`, reuses `apps/backend` as its system of record, and shares API contracts through `@cict/contracts`.

Its UI is being prepared to follow the existing CICT web brand system rather than a separate mobile-only visual identity.

## What It Covers

- Student authentication
- Student profile
- Home dashboard with updates
- Eligible event browsing
- Event registration and cancellation
- Event QR attendance pass
- Attendance history
- Settings and logout

## Stack

- Expo + React Native + TypeScript
- Expo Router
- TanStack React Query
- Axios
- React Hook Form + Zod
- Expo SecureStore
- Zustand

## Local Setup

1. Install workspace dependencies from the repo root:
   `pnpm install`
2. Copy env:
   `cp .env.example .env`
3. Set `EXPO_PUBLIC_API_URL` to your reachable backend URL.
4. Start the backend from the repo root with `pnpm run backend:dev`.
5. Start the app:
   `pnpm run mobile:dev`

## Recommended Phone Testing Setup

If Expo is running in WSL and the phone cannot reach your local backend IP, use the repo helper:

1. Start the backend normally.
2. From the repo root run:
   `pnpm run backend:tunnel`
3. Copy the `https://...trycloudflare.com` URL that appears.
4. Set:
   `EXPO_PUBLIC_API_URL=<that-url>/api`
5. Restart Expo:
   `cd apps/mobile && pnpm exec expo start --tunnel -c`

This keeps Expo in WSL while making the backend reachable from the phone.

## Key Rules

- Do not import business logic from `apps/web`.
- Reuse backend APIs instead of recreating backend behavior in mobile.
- Reuse shared API types from `@cict/contracts`.
- Keep new work feature-oriented and documented.
- Treat the web brand system as the mobile visual source of truth.

## Brand Preparation

This phase includes mobile brand-system preparation only:

- brand documentation
- contributor rules
- copied heading font material for later Expo loading

It does not yet include the full mobile UI refactor.

See [AGENTS.md](/home/ronmarche14/projects/CICT/apps/mobile/AGENTS.md) and the files in [docs](/home/ronmarche14/projects/CICT/apps/mobile/docs) for contributor guidance.
