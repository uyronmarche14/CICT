# Phase 1: Foundation and Safety

## Goal

Lock the compatibility and security boundaries before enabling new student and workflow features.

## Current Status

Completed.

- `User` remains admin-only.
- Student auth was added as a separate domain.
- Existing public and admin routes remained intact through the first expansion passes.
- New student, registration, and approval features were added additively rather than by replacing the CMS foundation.

## Dependencies

- Current admin login, RBAC, and content CRUD are already working.
- New student features must be added beside current admin features, not inside them.

## Changes

- Keep `User` as admin-only.
- Keep `OrganizationAssignment` as admin/org-staff only.
- Treat `Event.attendees` as legacy display state.
- Keep current public routes stable:
  - `/news`
  - `/announcements`
  - `/events`
  - `/organization/[id]`
  - `/member/[id]`
- Add new modules using separate routes, models, and permissions where required.

## API/Data Contracts

- Admin auth stays cookie-based.
- Student auth is separate and bearer-based.
- Existing publish/archive/cancel/complete endpoints stay unchanged until approval rules explicitly wrap them.

## Test Cases

- Admin login still works.
- Admin dashboard still loads.
- Existing user, role, organization, news, announcement, and event pages still load.
- Public pages still render current published content.

## Acceptance Gate

- No regression in existing admin or public flows.
- New work is additive and behind its own routes and UI.

## Rollback Notes

- Revert only newly added modules and routes if instability appears.
- Do not revert or rewrite the current admin auth and content foundation during this phase.
