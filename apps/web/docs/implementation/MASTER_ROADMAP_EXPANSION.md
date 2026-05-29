# CICT Platform Expansion Roadmap

Last updated: 2026-05-29

## Purpose

Track post-release platform expansion after the Phase 1-9 foundation. This file is the canonical follow-up referenced by `MASTER_ROADMAP.md`.

## Phase 10: Organization Admin Tools

**Status:** In progress, implementation present and hardening underway.

**Current scope:**
- Organization task boards
- Organization meetings with agendas, minutes, and action items
- Organization voting/elections
- Organization budget and transactions
- Global organization templates

**Code anchors:**
- Backend mounts: `apps/backend/src/app.ts`
- Backend routes: `apps/backend/src/routes/org-task.routes.ts`, `org-meeting.routes.ts`, `org-vote.routes.ts`, `org-budget.routes.ts`, `org-template.routes.ts`
- Backend services/models/validators: matching `org-*` files under `apps/backend/src`
- Frontend pages: `apps/web/src/app/admin/organizations/[id]/*`
- Frontend API clients: `apps/web/src/lib/api/org-*.ts`
- Shared permissions: `packages/contracts/src/index.ts`

**Hardening checklist:**
- Scoped organization admins can access only assigned organization tools.
- Global full admins can access all organization tools.
- Global templates remain protected by `MANAGE_ORG_TEMPLATES`.
- Frontend sidebar and sub-navigation hide tools without matching permission.
- Backend lint, typecheck, security tests, and web lint/typecheck pass.

## Phase 11: Collaboration

**Status:** Not started.

**Candidate scope:**
- Shared comments and activity threads
- Lightweight document/request collaboration
- Notification routing for org admins and students

**Prerequisite:** Phase 10 must be permission-safe and release-ready.

## Phase 12: Calendar

**Status:** Not started.

**Candidate scope:**
- Unified event, meeting, and academic calendar
- Calendar filtering by organization, student eligibility, and admin scope
- Export/share support where appropriate

**Prerequisite:** Phase 10 meetings and event registration flows must be stable.

## Verification Gate

Before marking a phase complete:
- Update shared contracts if the API surface changes.
- Add backend authorization tests for global and scoped users.
- Add frontend permission rendering tests when navigation changes.
- Run the full root validation suite relevant to changed apps.
