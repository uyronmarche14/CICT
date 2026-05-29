---
name: cict-web
description: CICT Next.js 15 web frontend — app router, components, data fetching, and admin flows
license: MIT
compatibility: opencode
---

# CICT Web (`apps/web/`)

## Stack
Next.js 15 (app router) + React 19 + TypeScript + Tailwind CSS 4 + TanStack Query + shadcn/ui

## Key Files
- `src/app/` — Routes (app router)
- `src/components/` — Reusable UI components
- `src/components/admin/` — Admin-specific components
- `src/hooks/` — Custom React hooks
- `src/lib/` — API client, utilities
- `src/context/` — React context (AuthContext)
- `src/types/` — Re-exported from @cict/contracts

## Patterns
- React Server Components by default, Client Components when interactivity needed
- TanStack Query for data fetching and caching
- Zustand for lightweight client state
- shadcn/ui for component primitives (Radix-based)
- next-cloudinary for image optimization

## Brand
Primary purple, secondary pink, accent teal, Inter body, Blockletter display
