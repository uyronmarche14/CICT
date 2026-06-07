# CICT Remediation Execution Plan

**Date:** June 7, 2026  
**Purpose:** Turn the audit/remediation findings into a practical, phase-by-phase, file-by-file execution checklist.  
**Current state:** Some Phase 0 and early Phase 1 fixes are already present in the working tree, but the full remediation is not complete.

---

## Status Legend

| Status | Meaning |
|---|---|
| `DONE-WT` | Done in the current working tree, not necessarily committed or deployed |
| `PENDING` | Needs code or documentation work |
| `EXTERNAL` | Requires dashboard, secret manager, deployment platform, or GitHub settings access |
| `MIGRATION` | Requires database backup, migration script, and rollback plan |
| `DEFERRED` | Not required to unblock security, revisit after core remediation |
| `VERIFY` | Needs tests, manual QA, or deployment verification |

---

## Execution Rules

1. Finish **Phase 0** before new feature work.
2. Do not print real secrets in terminal output, docs, screenshots, logs, PR comments, or chat.
3. Treat ignored env files as local/deployment configuration, not commit material.
4. For schema/data changes, create a database backup and rollback path before running migrations.
5. Run narrow verification first. Full lint/typecheck/build can happen only when requested or at the final gate.
6. Keep existing unrelated working-tree changes intact.

---

## Phase 0 — Critical Security

**Goal:** Remove active credential/auth risks and prevent the application from running with unsafe production configuration.

### 0.1 Secrets and Environment Values

| File / Location | Status | Required Action | Notes |
|---|---|---|---|
| `apps/backend/.env` | `EXTERNAL` | Replace placeholder auth secrets with strong unique values. Replace exposed service credentials after rotation. | Ignored file; do not commit. |
| `apps/backend/.env.development` | `PENDING` | Add missing student secrets and use dev-only random values. | Currently missing student JWT/QR/refresh values. |
| `apps/backend/.env.production` | `EXTERNAL` | Set `NODE_ENV=production`; add `STUDENT_REFRESH_SECRET`; replace all placeholder secrets; use rotated service credentials. | Prefer Render env vars over local production files. |
| `apps/backend/.env.staging` | `EXTERNAL` | Set `NODE_ENV=staging`; add `STUDENT_REFRESH_SECRET`; replace all placeholder secrets; use staging-only rotated credentials. | Keep staging secrets separate from production. |
| `apps/backend/.env.example` | `DONE-WT` | Keep placeholders only; includes `STUDENT_REFRESH_SECRET`. | Safe to commit. |
| Render production env | `EXTERNAL` | Confirm `NODE_ENV=production`, all generated secrets exist, and service credentials are rotated. | Render YAML already declares generated secret keys. |
| Render staging env | `EXTERNAL` | Confirm `NODE_ENV=staging`, all generated secrets exist, and staging DB/service credentials are rotated. | Use separate staging DB. |

### 0.2 Credential Rotation

| System | Status | Required Action | Verification |
|---|---|---|---|
| MongoDB Atlas production | `EXTERNAL` | Rotate exposed DB user password or create a new user and revoke the old one. | App connects with new credential; old credential fails. |
| MongoDB Atlas staging | `EXTERNAL` | Rotate staging DB user password or create a new user and revoke the old one. | Staging app connects with new credential; old credential fails. |
| Cloudinary | `EXTERNAL` | Rotate API secret. | Upload flow works with new secret. |
| Resend / SMTP | `EXTERNAL` | Rotate API key/password. | Password reset email sends with new credential. |
| Git history | `EXTERNAL` | Decide whether to purge committed secret history with `git filter-repo`. | Requires team coordination and force-push plan. |

### 0.3 Tracked Secret Redaction

| File | Status | Required Action | Notes |
|---|---|---|---|
| `docs/FULL_AUDIT_REPORT.md` | `DONE-WT` | Raw secret values redacted. | Verify before commit. |
| `docs/REMEDIATION_PLAN.md` | `DONE-WT` | Raw secret values redacted. | Verify before commit. |
| `docs/system-logic-connectivity-audit.md` | `DONE-WT` | Updated resolved stale findings. | Verify before commit. |
| `plans/frontend-remediation.md` | `DONE-WT` | Updated student-token finding status. | Verify before commit. |
| `plans/frontend-architecture-modernization.md` | `DONE-WT` | Updated student-token finding status. | Verify before commit. |

### 0.4 CSRF and CORS

| File | Status | Required Action | Verification |
|---|---|---|---|
| `apps/backend/src/middleware/csrf.ts` | `DONE-WT` | Blanket auth-route CSRF exemption narrowed to public auth routes. | Add tests in Phase 3. |
| `apps/backend/src/app.ts` | `DONE-WT` | `X-CSRF-Token` added to CORS allowed headers. | Browser preflight must allow protected mutating requests. |
| `apps/web/src/lib/api/axios.ts` | `VERIFY` | Admin client already uses CSRF cookie/header config. | Confirm protected admin mutations still work. |
| `apps/web/src/lib/api/student.ts` | `DONE-WT` | Student client now sends CSRF header from cookie. | Confirm student register/cancel/resign flows after login. |

### 0.5 Password Reset Token Logging

| File | Status | Required Action | Verification |
|---|---|---|---|
| `apps/backend/src/services/password-reset.service.ts` | `DONE-WT` | Raw reset token removed from log messages. | Add/adjust test or inspect logs during reset flow. |

### 0.6 Web Student Token Storage

| File | Status | Required Action | Verification |
|---|---|---|---|
| `apps/web/src/lib/api/student-membership.ts` | `DONE-WT` | Deleted localStorage Bearer-token client. | No source imports remain. |
| `apps/web/src/lib/api/student.ts` | `DONE-WT` | Membership API merged into cookie-based student client. | Student org/profile/membership pages load. |
| `apps/web/src/app/student/profile/page.tsx` | `DONE-WT` | Import changed to `student.ts`. | Profile membership section loads. |
| `apps/web/src/app/student/memberships/page.tsx` | `DONE-WT` | Import changed to `student.ts`. | Resign flow works. |
| `apps/web/src/app/student/organizations/page.tsx` | `DONE-WT` | Import changed to `student.ts`. | Apply/resign flow works. |
| `apps/web/src/lib/api/student.test.ts` | `DONE-WT` | Removed localStorage setup from test. | Run targeted web test when allowed. |
| `apps/backend/src/controllers/studentAuth.controller.ts` | `DEFERRED` | Consider splitting web/mobile login responses so web does not receive tokens in JSON while mobile still does. | Requires client contract decision. |

### Phase 0 Exit Criteria

- [ ] No placeholder secrets in deployed production/staging environments.
- [ ] Production uses `NODE_ENV=production`; staging uses `NODE_ENV=staging`.
- [ ] Exposed MongoDB/Cloudinary/Resend credentials rotated.
- [ ] Old credentials revoked.
- [ ] Tracked docs contain no real secret values.
- [ ] Password reset logs do not contain tokens.
- [ ] Web student source no longer uses localStorage tokens.
- [ ] CSRF-protected mutations work after login.

---

## Phase 1 — Structural Correctness

**Goal:** Remove stale code paths, fix schema drift, and reduce database/API inconsistency.

### 1.1 Dead Frontend API Helpers

| File | Status | Required Action | Notes |
|---|---|---|---|
| `apps/web/src/lib/api/refreshToken.ts` | `DONE-WT` | Deleted stale admin refresh helper. | Admin remains cookie-session based. |
| `apps/web/src/lib/api/media/getPresignedUrl.ts` | `DONE-WT` | Deleted stale S3 presigned URL helper. | Cloudinary upload path remains active. |
| `apps/web/src/lib/api/media/uploadToS3.ts` | `DONE-WT` | Deleted stale S3 upload helper. | No matching backend S3 route exists. |
| `apps/web/docs/NEWS_SYSTEM_IMPLEMENTATION.md` | `DONE-WT` | Updated stale refresh-token note. | Documentation sync. |

### 1.2 Remove Legacy `Organization.members`

| File | Status | Required Action | Risk |
|---|---|---|---|
| `apps/backend/src/models/Organization.ts` | `PENDING` | Remove `members: [{ type: Schema.Types.Mixed }]`. | Medium; check existing data first. |
| `apps/backend/src/types/index.ts` | `PENDING` | Remove or update `IOrganization.members`. | May affect backend compile. |
| `packages/contracts/src/index.ts` | `PENDING` | Remove or deprecate `members` from organization contract, or mark as legacy read-only if frontend still needs it. | High blast radius. |
| `apps/backend/src/db/migrations/003_remove_org_members.ts` | `MIGRATION` | Add migration to `$unset` legacy embedded members after backup. | Requires data backup. |
| `apps/web/src/**` | `VERIFY` | Search for `organization.members` usage before removing contract fields. | Avoid frontend regression. |

### 1.3 Reconcile `organizationId` Type

**Recommended target:** standardize organization-scoped feature models on the organization slug string if the content models already use slugs.

| File | Status | Required Action | Risk |
|---|---|---|---|
| `apps/backend/src/models/OrganizationMember.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string after migration design. | High. |
| `apps/backend/src/models/OrgTask.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/OrgMeeting.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/OrgBudget.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/OrgVote.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/OrgTransaction.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/OrgTaskForce.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/ResourceRequest.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/models/CollaborationSpace.ts` | `MIGRATION` | Change `organizationId` from ObjectId to slug string. | High. |
| `apps/backend/src/services/org-*.service.ts` | `PENDING` | Update queries/populates that assume ObjectId. | High. |
| `apps/backend/src/controllers/org-*.controller.ts` | `PENDING` | Ensure route params pass slug consistently. | High. |
| `apps/web/src/app/admin/organizations/[id]/**` | `VERIFY` | Confirm UI sends slug, not Mongo `_id`, after migration. | High. |
| `apps/backend/src/db/migrations/004_normalize_org_ids.ts` | `MIGRATION` | Create migration mapping `Organization._id` to `Organization.id`. | Requires dry run. |

### 1.4 Add Missing Indexes

| File | Status | Required Index | Purpose |
|---|---|---|---|
| `apps/backend/src/models/EventRegistration.ts` | `PENDING` | `{ studentId: 1, status: 1 }` | Student event listings. |
| `apps/backend/src/models/EventAttendanceLog.ts` | `PENDING` | `{ studentId: 1 }` | Student attendance history. |
| `apps/backend/src/models/Event.ts` | `PENDING` | `{ startDate: -1 }` | Upcoming/past event sorting. |
| `apps/backend/src/models/ActivityLog.ts` | `PENDING` | `{ organizationId: 1, createdAt: -1 }` | Org activity log filtering. |
| `apps/backend/src/models/User.ts` | `PENDING` | `{ role: 1, isActive: 1 }` | Admin user filtering. |
| `apps/backend/src/models/Announcement.ts` | `PENDING` | `{ organizationId: 1, publishedAt: -1 }` | Org announcement lists. |
| `apps/backend/src/models/News.ts` | `PENDING` | `{ organizationId: 1, publishedAt: -1 }` | Org news lists. |

### 1.5 Contracts Package Split

| File / Folder | Status | Required Action | Notes |
|---|---|---|---|
| `packages/contracts/src/index.ts` | `DEFERRED` | Split only after security/schema work stabilizes. | Large import churn. |
| `packages/contracts/src/types/*` | `PENDING` | Create when splitting. | Preserve root exports. |
| `packages/contracts/src/schemas/*` | `PENDING` | Create when splitting. | Keep backward compatibility. |
| `packages/contracts/package.json` | `PENDING` | Add subpath exports only after split. | Requires typecheck. |

### Phase 1 Exit Criteria

- [ ] No active frontend calls to nonexistent backend routes.
- [ ] No legacy `Organization.members` mixed field unless explicitly retained as a documented legacy field.
- [ ] `organizationId` type is consistent per module or documented with clear boundaries.
- [ ] Additive indexes are declared and deployed.
- [ ] Migration scripts are dry-run and rollback-tested before production.

---

## Phase 2 — Infrastructure and Deployment

**Goal:** Make deploys reliable and make security checks enforceable.

### 2.1 GitHub Actions Secrets

| Location | Status | Required Action |
|---|---|---|
| GitHub Actions secret `RENDER_STAGING_DEPLOY_HOOK` | `EXTERNAL` | Add or verify. |
| GitHub Actions secret `RENDER_PRODUCTION_DEPLOY_HOOK` | `EXTERNAL` | Add or verify. |
| GitHub Actions secret `RENDER_STAGING_URL` | `EXTERNAL` | Add or verify. |
| GitHub Actions secret `RENDER_PRODUCTION_URL` | `EXTERNAL` | Add or verify. |
| GitHub Actions secret `VERCEL_TOKEN` | `EXTERNAL` | Add or verify. |
| GitHub Actions secret `VERCEL_PROJECT_ID` | `EXTERNAL` | Add or verify. |
| GitHub Actions secret `VERCEL_PRODUCTION_URL` | `EXTERNAL` | Add or verify. |

### 2.2 Branch Protection

| Branch | Status | Required Rule |
|---|---|---|
| `main` | `EXTERNAL` | Require PR, approval, up-to-date branch, required checks, no direct push. |
| `staging` | `EXTERNAL` | Require PR, approval, up-to-date branch, required checks, no direct push. |

Required checks:
- `contracts-checks`
- `backend-checks`
- `frontend-checks`
- `mobile-checks`
- `security-audit`
- `secret-scan`
- `dependency-review`

### 2.3 CI Security Gates

| File | Status | Required Action | Notes |
|---|---|---|---|
| `.github/workflows/ci.yml` | `PENDING` | Remove `continue-on-error: true` from dependency audit when ready. | May initially fail until deps are cleaned. |
| `.github/workflows/ci.yml` | `PENDING` | Remove `continue-on-error: true` from Gitleaks when history is clean. | Do after secret rotation/history decision. |
| `.github/workflows/ci.yml` | `DONE` | pnpm caching already exists via `actions/setup-node`. | No caching task needed. |

### 2.4 Mobile Build Pipeline

| File | Status | Required Action |
|---|---|---|
| `apps/mobile/app.json` | `PENDING` | Replace `REPLACE_WITH_EXPO_PROJECT_ID` with actual Expo project ID. |
| `apps/mobile/eas.json` | `PENDING` | Add EAS build profiles for development, preview, and production. |
| `.github/workflows/deploy-production.yml` | `DEFERRED` | Add EAS build/submit only after Expo project is configured. |

### 2.5 Frontend Deployment Configuration

| File | Status | Required Action |
|---|---|---|
| `apps/web/next.config.ts` | `DEFERRED` | Consider API rewrites only if SSR/CORS deployment needs it. |
| `apps/web/vercel.json` | `DEFERRED` | Add only if Vercel project needs explicit build/output settings. |

### Phase 2 Exit Criteria

- [ ] Staging deploy can be triggered by push to `staging`.
- [ ] Production deploy can be triggered by push to `main` or manual dispatch.
- [ ] Security scan failures block PRs after credentials/history are clean.
- [ ] Mobile has real EAS configuration or is explicitly excluded from production release scope.

---

## Phase 3 — Tests and Verification

**Goal:** Add tests around security fixes and high-risk flows before larger migrations continue.

### 3.1 Backend Security Tests

| File | Status | Required Coverage |
|---|---|---|
| `apps/backend/src/middleware/csrf.test.ts` | `PENDING` | Safe methods pass; protected mutations require matching cookie/header; public auth exemptions pass. |
| `apps/backend/src/services/password-reset.service.test.ts` | `PENDING` | Reset token is saved/emailed but never logged. |
| `apps/backend/src/security.integration.test.ts` | `PENDING` | Add CSRF regression cases for admin and student protected mutations. |
| `apps/backend/src/middleware/auth.test.ts` | `PENDING` | JWT cookie auth failures and deactivated user behavior. |
| `apps/backend/src/middleware/studentAuth.test.ts` | `PENDING` | Cookie/Bearer token behavior and expired token responses. |

### 3.2 Web Tests

| File | Status | Required Coverage |
|---|---|---|
| `apps/web/src/lib/api/student.test.ts` | `VERIFY` | Cookie-based calls do not read/write localStorage. |
| `apps/web/src/lib/api/axios.test.ts` | `PENDING` | Admin 401 redirect behavior and CSRF config. |
| `apps/web/src/app/student/organizations/page.test.tsx` | `PENDING` | Apply/resign uses `student.ts` membership API. |
| `apps/web/src/app/student/memberships/page.test.tsx` | `PENDING` | Resign mutation invalidates membership query. |

### 3.3 Mobile Tests

| File | Status | Required Coverage |
|---|---|---|
| `apps/mobile/src/services/api/client.test.ts` | `PENDING` | SecureStore token persistence and refresh flow. |
| `apps/mobile/src/features/auth/useLoginMutation.test.ts` | `PENDING` | Successful login, invalid credentials, session persistence. |
| `apps/mobile/src/features/events/useEvents.test.ts` | `PENDING` | Event list and empty/error states. |
| `apps/mobile/src/features/attendance/useAttendanceHistory.test.ts` | `PENDING` | Attendance history fetch and error state. |

### Phase 3 Exit Criteria

- [ ] CSRF changes are covered by automated tests.
- [ ] Password reset logs are covered by automated tests or logger mocks.
- [ ] Web student API tests prove localStorage token storage is gone.
- [ ] Mobile has at least smoke coverage for auth and event/attendance fetches.

---

## Phase 4 — Product Polish and Documentation

**Goal:** Improve maintainability and production readiness after security/structure/tests are stable.

### 4.1 API Documentation

| File / Folder | Status | Required Action |
|---|---|---|
| `apps/backend/src/openapi/*` | `PENDING` | Add OpenAPI spec generation or static spec. |
| `apps/backend/src/routes/*.ts` | `PENDING` | Add route metadata if using generator. |
| `apps/backend/postman/*` | `VERIFY` | Sync Postman smoke collection with real endpoints. |
| `docs/api.md` | `PENDING` | Add human-readable API overview if OpenAPI is deferred. |

### 4.2 E2E Tests

| File / Folder | Status | Required Flow |
|---|---|---|
| `apps/web/playwright.config.ts` | `PENDING` | Add Playwright setup if chosen. |
| `apps/web/e2e/admin-auth.spec.ts` | `PENDING` | Admin login/logout/profile. |
| `apps/web/e2e/content-publishing.spec.ts` | `PENDING` | Create draft, submit, approve/publish. |
| `apps/web/e2e/student-events.spec.ts` | `PENDING` | Student login, register, QR access. |

### 4.3 Remaining Feature Hardening

| Area | Status | Required Action |
|---|---|---|
| Org operation RBAC | `PENDING` | Add module-specific permission checks to `apps/backend/src/routes/org-*.routes.ts`. |
| Notification delivery | `VERIFY` | Confirm Expo push token registration has a delivery job/service. |
| Email delivery | `VERIFY` | Confirm password reset and notification email path in staging. |
| Frontend staging | `EXTERNAL` | Document separate staging frontend repo and URL. |

### Phase 4 Exit Criteria

- [ ] API docs match route behavior.
- [ ] E2E covers admin and student critical paths.
- [ ] Org tools enforce module-specific permissions.
- [ ] Email and push notification behavior is documented and verified.

---

## Recommended Next Work Slice

Do this next before schema migrations:

1. Complete Phase 0 env cleanup in ignored files and deployment dashboards.
2. Rotate MongoDB, Cloudinary, and Resend credentials.
3. Decide whether to purge git history.
4. Add targeted CSRF/password-reset tests.
5. Only then start Phase 1 data-model migration work.

---

## Quick Current Snapshot

| Area | Current Status |
|---|---|
| Phase 0 local code fixes | Partially complete in working tree |
| Phase 0 external secret rotation | Not complete |
| Phase 1 dead frontend helpers | Complete in working tree |
| Phase 1 data model/schema migration | Not complete |
| Phase 2 GitHub/Render/Vercel/EAS | Not complete |
| Phase 3 tests | Not complete |
| Phase 4 docs/E2E/polish | Not complete |

