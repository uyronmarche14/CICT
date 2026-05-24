# CICT Mobile — Agent Guide

## Purpose

`apps/mobile` is the student mobile client for CICT. Its job is to give students a reliable mobile workflow for attendance, event discovery, registration, and student-facing updates while reusing the existing backend.

Its visual identity must stay aligned with the web app brand system from `apps/web`, while adapting layouts and interaction density for mobile.

## V1 Scope

In scope:
- Student login and session restore
- Student profile
- Home/dashboard
- Announcements or updates feed
- Event list and event detail
- Event registration and cancellation
- Event QR pass
- Attendance history
- Settings/logout

Out of scope:
- Admin CMS flows
- Staff scanning mode
- Direct reuse of `apps/web` components or feature modules
- Large backend redesigns

## Architecture Rules

- Keep all mobile-specific code inside `apps/mobile`.
- Treat `apps/backend` as the source of truth.
- Treat `@cict/contracts` as the shared API contract source of truth.
- Organize code by feature and responsibility, not by file type alone.
- Keep UI primitives reusable and small.
- Prefer clean, direct modules over clever abstractions.

## Visual Source Of Truth

- The web app brand system is the visual source of truth.
- Start with:
  - `/home/ronmarche14/projects/CICT/apps/web/src/app/globals.css`
  - `/home/ronmarche14/projects/CICT/apps/web/tailwind.config.js`
- Mobile must inherit the same:
  - primary purple
  - secondary pink
  - accent teal
  - `Inter` body typography
  - `Blockletter` display typography
  - rounded shadcn-like control feel

## Mobile Adaptation Rule

- Match the brand, not the desktop layout.
- Do not recreate web sections literally when a mobile-first composition is better.
- Home/dashboard and event-feature surfaces may be visually louder.
- Attendance, profile, settings, and forms should remain calmer and utility-first.

## Folder Placement

- `app/` contains routes only.
- `src/features/` contains feature hooks and feature-specific orchestration.
- `src/components/` contains reusable UI and shared render pieces.
- `src/services/api/` contains API clients only.
- `src/services/storage/` contains persistence helpers only.
- `src/store/` contains lightweight app state.
- `docs/` must be updated when behavior or structure meaningfully changes.
- `assets/fonts/` contains approved mobile font assets copied from web brand materials when needed.

## API Integration Rules

- Reuse student and public endpoints first.
- Document any backend gap before changing backend code.
- Keep auth refresh logic centralized in the API client.
- Never use browser-only storage patterns for tokens.

## Token Handling

- Persist tokens with Expo SecureStore.
- Keep in-memory auth state in the mobile app store.
- Clear session immediately when refresh fails.

## Documentation Expectations

When adding features, update:
- `README.md` if setup or scripts change
- `docs/architecture.md` if data flow or module boundaries change
- `docs/api-integration.md` if endpoints or auth behavior change
- `docs/roadmap.md` if new priorities shift future work
- `docs/design-system.md` if tokens, typography, component rules, or interaction tone change
- `docs/brand-parity.md` if the mapping from web brand to mobile changes
- `docs/materials.md` when copying or introducing brand assets

## Reuse Rule For `apps/web`

You may reference `apps/web` for behavior and endpoint understanding, but do not copy files directly unless the code is intentionally adapted for mobile and cleaned up for React Native constraints.

For visual work specifically:

- You may copy approved assets such as fonts into `apps/mobile/assets`
- You may not copy web React components as a shortcut for mobile UI
- Any copied material must be documented in `docs/materials.md`
