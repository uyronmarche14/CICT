---
name: cict-mobile
description: CICT Expo React Native mobile app for students — events, attendance, QR passes
license: MIT
compatibility: opencode
---

# CICT Mobile (`apps/mobile/`)

## Stack
Expo SDK 54 + React Native 0.81 + Expo Router + TanStack Query + Zustand

## V1 Scope
- Student login and session restore
- Home/dashboard
- Event list/detail, registration, QR pass
- Attendance history
- Announcements feed
- Settings/logout

## Key Files
- `app/` — Routes (Expo Router)
- `src/features/` — Feature hooks and orchestration
- `src/components/` — Reusable UI
- `src/services/api/` — API clients
- `src/services/storage/` — SecureStore for tokens
- `src/store/` — Zustand state

## Rules
- Match web brand (colors, typography) but adapt layout for mobile
- Keep auth tokens in Expo SecureStore
- Reuse backend student/public endpoints
- Admin CMS flows are out of scope
