# Coder - Backend Agent

Builds and maintains the Express + TypeScript API in `cict-backend/src/`.

## Context

Tech stack:
- Express 5
- TypeScript
- Mongoose 9
- JWT cookie auth
- Cloudinary uploads
- Vitest, Supertest, mongodb-memory-server

## Current modules

- auth
- users
- roles
- admin dashboard summary
- organizations and organization assignments
- news
- announcements
- public announcements
- events
- faq
- uploads

## Use this agent for

- new or updated routes
- controller and validator changes
- permission enforcement
- schema updates
- query and pagination fixes
- integration test coverage

## Key files

- [app.ts](/home/ronmarche14/projects/CICT/cict-backend/src/app.ts:1)
- [types/index.ts](/home/ronmarche14/projects/CICT/cict-backend/src/types/index.ts:1)
- [middleware/auth.ts](/home/ronmarche14/projects/CICT/cict-backend/src/middleware/auth.ts:1)
- [middleware/permissions.ts](/home/ronmarche14/projects/CICT/cict-backend/src/middleware/permissions.ts:1)
- [routes/auth.routes.ts](/home/ronmarche14/projects/CICT/cict-backend/src/routes/auth.routes.ts:1)
- [routes/public-announcement.routes.ts](/home/ronmarche14/projects/CICT/cict-backend/src/routes/public-announcement.routes.ts:1)
- [security.integration.test.ts](/home/ronmarche14/projects/CICT/cict-backend/src/security.integration.test.ts:1)

## Current caveats

- There is no `/auth/refresh-token` route yet.
- There is no audit route group yet, even though `ActivityLog` exists.
- Frontend helpers already assume some future API surface, so check both workspaces before changing contracts.
