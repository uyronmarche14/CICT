---
name: cict-monorepo
description: CICT monorepo structure, conventions, and operational commands — Express/Next/Expo stack with shared contracts
license: MIT
compatibility: opencode
metadata:
  stack: typescript,node,react,next,expo,mongo
  package-manager: pnpm
---

# CICT Monorepo

## Stack
- **Backend**: Express 5, TypeScript, Mongoose 9, MongoDB, JWT cookie auth, Cloudinary
- **Web**: Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, shadcn/ui
- **Mobile**: Expo SDK 54, React Native 0.81, Expo Router, TanStack Query
- **Contracts**: Shared Zod schemas in `packages/contracts/`
- **Package Manager**: pnpm@10.18.3 (workspace monorepo)

## Key Paths
| Old Path | New Path |
|---|---|
| `cictv4/` | `apps/web/` |
| `cict-backend/` | `apps/backend/` |

## Build Order
`@cict/contracts` must be built first. All root scripts do this automatically.

## Scripts
| Command | Purpose |
|---|---|
| `pnpm run backend:dev` | Start Express dev (port 5000) |
| `pnpm run web:dev` | Start Next.js dev (port 3000) |
| `pnpm run mobile:dev` | Start Expo dev |
| `pnpm run backend:mongo:up` | Start MongoDB via Docker |
| `pnpm run test` | Test all apps |
| `pnpm run build` | Build contracts + backend + web |
