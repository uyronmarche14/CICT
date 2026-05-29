---
name: cict-backend
description: CICT Express 5 backend — routes, models, middleware, auth, and MongoDB patterns
license: MIT
compatibility: opencode
---

# CICT Backend (`apps/backend/`)

## Stack
Express 5 + TypeScript + Mongoose 9 + MongoDB + JWT cookie auth

## Key Files
- `src/server.ts` — Entry point
- `src/app.ts` — Express app setup (middleware chain)
- `src/config/` — DB, Cloudinary, env config
- `src/models/` — Mongoose schemas
- `src/routes/` — API route handlers
- `src/controllers/` — Business logic
- `src/middleware/` — Auth, permissions, error handling
- `src/utils/` — Helpers (seed, RBAC, content, media)
- `src/types/index.ts` — Backend-specific types

## Auth Pattern
- JWT stored in httpOnly cookies
- `middleware/auth.ts` for authentication
- `middleware/permissions.ts` for RBAC
- Profile-driven permissions via `use-permissions.ts`

## Important
- Always build `@cict/contracts` first before any backend work
- Mongoose models should align with contract Zod schemas
