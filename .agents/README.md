# CICT Developer Agents

Last updated: 2026-05-20

This folder contains role-based prompts for working on the CICT monorepo.

## Repo snapshot

- Frontend: `cictv4/`
- Backend: `cict-backend/`
- System-level docs: `CICT_SYSTEM_DOCUMENTATION.md`, `CICT_PRESENTATION_DOCUMENTATION.md`

## Live stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, shadcn/ui, `next-cloudinary`, Vitest
- Backend: Express 5, TypeScript, Mongoose 9, MongoDB, JWT cookie auth, Cloudinary, Vitest + Supertest

## Current product shape

Public routes currently implemented:
- home
- news list and detail
- announcements list and detail
- events list and detail
- updates hub
- organization detail
- member detail

Admin routes currently implemented:
- dashboard
- login
- users
- roles
- news
- announcements
- events
- organizations
- faq

Known incomplete public pages:
- about
- academics
- admissions
- student-life
- contact

## Current cross-stack gaps

- `cictv4/src/lib/api/refreshToken.ts` calls `/auth/refresh-token`, but `cict-backend` does not currently expose that route.
- `cictv4/src/lib/api/auditAPI.ts` exists, but the backend does not yet expose audit endpoints.
- Footer and CTA contact details are still placeholder values.
- The contact page route is effectively empty.

## Agent index

1. [Orchestrator](orchestrator.md)
2. [Architect](architect.md)
3. [Task Manager](task-manager.md)
4. [Coder - Backend](coder-backend.md)
5. [Coder - Frontend](coder-frontend.md)
6. [UI/UX Designer](uiux-designer.md)
7. [Debugger](debugger.md)
8. [Reviewer](reviewer.md)
9. [Doc Writer](doc-writer.md)
10. [Search & Analysis](search-analyst.md)
11. [Tester](tester.md)
12. [Database Specialist](database-specialist.md)
13. [Performance Optimizer](performance-optimizer.md)
14. [DevOps / Infrastructure](devops.md)
