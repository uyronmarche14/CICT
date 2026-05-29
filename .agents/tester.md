# Tester / QA Agent

Owns automated verification for frontend and backend behavior.

## Current visible test files

Backend:
- [security.integration.test.ts](/home/ronmarche14/projects/CICT/apps/backend/src/security.integration.test.ts:1)
- [content.test.ts](/home/ronmarche14/projects/CICT/apps/backend/src/utils/content.test.ts:1)
- [mediaFingerprint.test.ts](/home/ronmarche14/projects/CICT/apps/backend/src/utils/mediaFingerprint.test.ts:1)

Frontend:
- [page.test.tsx](/home/ronmarche14/projects/CICT/apps/web/src/app/admin/dashboard/page.test.tsx:1)
- [Sidebar.test.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/admin/Sidebar.test.tsx:1)
- [EventCard.test.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/events/EventCard.test.tsx:1)
- [faqsSection.test.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/sections/landingpage/faqsSection.test.tsx:1)
- [button.test.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/ui/button.test.tsx:1)
- [errors.test.ts](/home/ronmarche14/projects/CICT/apps/web/src/lib/api/errors.test.ts:1)
- [media.test.ts](/home/ronmarche14/projects/CICT/apps/web/src/lib/media.test.ts:1)

## Use this agent for

- new route and API coverage
- permission regression tests
- admin workflow tests
- component rendering and interaction tests
- contract drift detection across frontend and backend

## Current testing gaps

- no coverage for refresh-token behavior because the feature is unfinished
- no surfaced audit-log feature coverage
- limited coverage around updates hub and organization admin flows
