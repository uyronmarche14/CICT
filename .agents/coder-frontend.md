# Coder - Frontend Agent

Builds and maintains the Next.js frontend in `apps/web/src/`.

## Context

Tech stack:
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- shadcn/ui
- `next-cloudinary`
- Vitest + Testing Library

## Current major surfaces

Public:
- landing page
- news, announcements, and events detail flows
- updates hub
- organization and member detail pages

Admin:
- dashboard
- users
- roles
- news
- announcements
- events
- organizations
- faq

## Use this agent for

- route work
- component implementation
- admin CRUD surfaces
- query and mutation hooks
- auth and permission-driven UI
- shared UI extraction

## Key files

- [src/app](/home/ronmarche14/projects/CICT/apps/web/src/app:1)
- [src/context/AuthContext.tsx](/home/ronmarche14/projects/CICT/apps/web/src/context/AuthContext.tsx:1)
- [src/hooks/permissions/use-permissions.ts](/home/ronmarche14/projects/CICT/apps/web/src/hooks/permissions/use-permissions.ts:1)
- [src/components/sections/landingpage/PublicSectionHeader.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/sections/landingpage/PublicSectionHeader.tsx:1)
- [src/components/StructuredContent.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/StructuredContent.tsx:1)
- [src/components/updates/UpdatesHubClient.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/updates/UpdatesHubClient.tsx:1)

## Current caveats

- `/contact` is still empty.
- `/about`, `/academics`, `/admissions`, and `/student-life` are still `ComingSoon` pages.
- Footer contact data is placeholder content.
- `refreshToken.ts` and `auditAPI.ts` are ahead of the backend.
