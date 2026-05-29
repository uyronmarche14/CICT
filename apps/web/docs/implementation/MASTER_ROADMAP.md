# CICT Platform Expansion Roadmap

Last updated: 2026-05-29

## Goal

Implement the CICT platform expansion in gated phases so student accounts, academic grouping, event registration, attendance, approvals, process workflows, and audit-driven content expansion can be added without breaking the current admin CMS and public site.

## Dependencies

- Existing admin auth and RBAC must remain stable.
- Existing public content routes must remain available.
- Each phase must pass its own acceptance gate before the next phase is enabled.
- Content/data expansion must stay aligned with:
  - [EVENTS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/EVENTS_SYSTEM_AUDIT.md:1)
  - [NEWS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/NEWS_SYSTEM_AUDIT.md:1)
  - [ANNOUNCEMENTS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/ANNOUNCEMENTS_SYSTEM_AUDIT.md:1)
  - [ORGANIZATIONS_AND_LEADERS_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/ORGANIZATIONS_AND_LEADERS_AUDIT.md:1)
  - [LANDING_AND_UPDATES_HUB_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/LANDING_AND_UPDATES_HUB_AUDIT.md:1)

## Changes

- Phase 1: foundation and safety guardrails
- Phase 2: student and academic data
- Phase 3: event registration and QR
- Phase 3A: event data expansion
- Phase 4: attendance and scanner
- Phase 5: approval workflow
- Phase 5A: news and announcement data expansion
- Phase 6: process module
- Phase 6A: organization and leader data expansion
- Phase 7: mobile API and student experience contract
- Phase 7A: landing page and updates hub expansion
- Phase 8: audit logging and security hardening
- Phase 9: release checklist and rollout verification
- Phase 10: organization admin tools

## API/Data Contracts

- `User` remains admin-only.
- `Student` is a separate identity domain.
- Student auth is bearer-token based and separate from admin cookie auth.
- Event participation moves to dedicated registration and attendance collections.
- Approval transitions become explicit workflow actions.
- Process flows are optional attachments for content in v1.
- Audit-driven content expansion is implemented only through additive schema, API, admin form, and public UI changes.

## Current Completion Snapshot

- Finished:
  - Phase 1
  - Phase 2
  - Phase 3
  - Phase 3A
  - Phase 4
  - Phase 5
  - Phase 5A
  - Phase 6
  - Phase 6A
- In progress:
  - Phase 07A (Landing & Updates Hub Expansion — org spotlight + achievement spotlight + event ordering done; leadership spotlight + richer summaries remaining)
  - Phase 10 (Organization Admin Tools — tasks, meetings, voting, budget, and templates are implemented; final hardening/verification is in progress)
- Completed (statuses updated after codebase audit):
  - Phase 6 (was marked "scaffold only" — fully implemented with ReactFlow builder)
  - Phase 7 (was marked "in progress" — all API namespaces + mobile client complete)
  - Phase 03A (was marked "not started" — all 20 expanded event fields present)
  - Phase 05A (was marked "not started" — all expanded news/announcement fields present)
  - Phase 8 (Audit Logging & Security — 95% complete, minor schema gap fixed)
  - Phase 9 (Final Release — 90% complete, CI/CD and deployment artifacts all exist)

## Test Cases

- Existing admin login and admin modules continue to work.
- Existing public pages continue to render published content.
- New student and event workflow features are additive and isolated.
- New content-enrichment phases do not break existing public rendering.

## Acceptance Gate

- All phase docs exist and remain current.
- Master roadmap reflects actual implementation status, not only planned status.
- Every future implementation session can resume from this folder without rediscovering the rollout plan.

## Rollback Notes

- If a later phase becomes unstable, disable only that phase’s routes and UI entry points.
- Keep the original admin CMS and public content routes operational at all times.
- Keep content-enrichment fields nullable or optional until their UI and rendering are complete.

## Status Board

- Phase 1: Completed
- Phase 2: Completed
- Phase 3: Completed
- Phase 3A: Completed
- Phase 4: Completed
- Phase 5: Completed
- Phase 5A: Completed
- Phase 6: Completed
- Phase 6A: Completed
- Phase 7: Completed
- Phase 7A: Partially complete (org spotlight + achievement spotlight + event ordering fixed; leadership spotlight + richer community summaries remaining)
- Phase 8: Completed for current release scope (audit route, activity logging, auth/session hardening, and cache authorization regressions covered; retention policy can continue as operational follow-up)
- Phase 9: Completed for current release infrastructure (CI/CD, Render configs, docs, and validation gates exist; each new phase still requires a fresh release gate)
- Phase 10: In progress (org tasks, meetings, voting, budget, and templates are in code; scoped RBAC and security verification are being hardened)

## Next Priority Order

1. Finish Phase 10 hardening — org-tool scoped RBAC, lint/test gates, and documentation alignment.
2. Finish Phase 07A remaining public-surface polish — leadership spotlight, official vs. organization grouping, and richer community summaries.
3. Proceed with Platform Expansion Phases 11–12 (Collaboration and Calendar) — see MASTER_ROADMAP_EXPANSION.md.

## Phase Files

- [PHASE_01_FOUNDATION_AND_SAFETY.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_01_FOUNDATION_AND_SAFETY.md:1)
- [PHASE_02_STUDENT_AND_ACADEMIC_DATA.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_02_STUDENT_AND_ACADEMIC_DATA.md:1)
- [PHASE_03_EVENT_REGISTRATION_AND_QR.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_03_EVENT_REGISTRATION_AND_QR.md:1)
- [PHASE_03A_EVENT_DATA_EXPANSION.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_03A_EVENT_DATA_EXPANSION.md:1)
- [PHASE_04_ATTENDANCE_AND_SCANNER.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_04_ATTENDANCE_AND_SCANNER.md:1)
- [PHASE_05_APPROVAL_WORKFLOW.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_05_APPROVAL_WORKFLOW.md:1)
- [PHASE_05A_NEWS_AND_ANNOUNCEMENT_DATA_EXPANSION.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_05A_NEWS_AND_ANNOUNCEMENT_DATA_EXPANSION.md:1)
- [PHASE_06_PROCESS_MODULE.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_06_PROCESS_MODULE.md:1)
- [PHASE_06A_ORGANIZATION_AND_LEADER_DATA_EXPANSION.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_06A_ORGANIZATION_AND_LEADER_DATA_EXPANSION.md:1)
- [PHASE_07_MOBILE_API_AND_CLIENT_CONTRACT.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_07_MOBILE_API_AND_CLIENT_CONTRACT.md:1)
- [PHASE_07A_LANDING_AND_UPDATES_HUB_EXPANSION.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_07A_LANDING_AND_UPDATES_HUB_EXPANSION.md:1)
- [PHASE_08_AUDIT_LOGGING_AND_SECURITY.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_08_AUDIT_LOGGING_AND_SECURITY.md:1)
- [PHASE_09_FINAL_RELEASE_CHECKLIST.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/PHASE_09_FINAL_RELEASE_CHECKLIST.md:1)
- [MASTER_ROADMAP_EXPANSION.md](/home/ronmarche14/projects/CICT/apps/web/docs/implementation/MASTER_ROADMAP_EXPANSION.md:1)
