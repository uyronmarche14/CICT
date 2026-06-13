# CICT Portal Workflow Gaps and Next-Steps Plan

## Document Information

| Field | Details |
|---|---|
| Project | CICT Portal |
| Document Type | Workflow Gap and Next-Steps Plan |
| Last Updated | 2026-06-09 |
| Source Audit | `../audits/CICT_WORKFLOW_ARCHITECTURE_AND_PROCESS_AUDIT.md` |
| Source Flow Map | `../architecture/CICT_MODULE_CONNECTION_AND_APPROVAL_FLOW_MAP.md` |

---

## 1. Executive Summary

The CICT Portal has real end-to-end workflow implementation across backend, web, database models, shared contracts, and mobile. The highest-value next work is not adding broad new modules; it is tightening workflow guarantees around scoped permissions, cache boundaries, attendance reporting, release validation, and audit trails.

Immediate focus should be:

- prevent scoped dashboard cache leakage;
- make scanner and membership approval permissions consistent with backend scope rules;
- restore web/mobile typecheck health;
- use backend attendance exports instead of page-local CSV generation;
- complete audit records for event terminal states;
- decide whether the standalone process engine should become the formal approval engine.

---

## 2. Critical Workflow Blockers

| Blocker ID | Module | Problem | Impact | Required Action | Verification |
|---|---|---|---|---|---|
| CICT-BLOCK-001 | Dashboard | Dashboard cache key is shared as `summary` while counts are scope-dependent. | Scoped admin may see another user's cached dashboard counts. | Key cache by user id, global permission hash, and scoped org ids. | Backend integration test with two differently scoped admins. |
| CICT-BLOCK-002 | Web/mobile validation | Web and mobile typechecks fail. | CI/release readiness is blocked. | Fix web React ref type issue and mobile test typing issues. | `pnpm --filter @cict/web typecheck`, `pnpm --filter @cict/mobile typecheck`. |

---

## 3. Authentication and RBAC Gaps

| Gap ID | Module | Current State | Required State | Risk | Recommended Action |
|---|---|---|---|---|---|
| CICT-RBAC-GAP-001 | Dashboard | Cache is not scoped by authenticated user. | Scoped summaries are isolated. | Critical data visibility bug. | Include user/scope hash in dashboard cache key. |
| CICT-RBAC-GAP-002 | Scanner UI | Page guard uses general event module access. | Scanner UI requires scan attendance permission. | High: confusing access and potential overexposure of scanner UI. | Add web guard for `SCAN_EVENT_ATTENDANCE`. |
| CICT-RBAC-GAP-003 | Organization memberships | Routes require global member-role permission before scoped controller checks. | Scoped org admins can manage only their assigned org memberships. | High: valid scoped admins blocked. | Replace global-only middleware with scope-aware checks. |
| CICT-RBAC-GAP-004 | Content routes | Route layer often uses `requireAdminAccess`; exact checks live in services. | Every route has tests proving exact backend enforcement. | Medium regression risk. | Add integration tests for create/edit/publish/archive by global and scoped admins. |
| CICT-RBAC-GAP-005 | Approval policy | Self-approval rule not explicit. | Business-approved self-review policy enforced. | Medium governance risk. | Decide and enforce/allow explicitly with tests. |

---

## 4. Content-Publishing Gaps

| Gap ID | Feature | Current State | Required State | Risk | Recommended Action |
|---|---|---|---|---|---|
| CICT-CONTENT-GAP-001 | Event cancel/complete history | ActivityLog exists; ContentApprovalAction is missing. | Approval history includes cancelled/completed transitions. | Incomplete audit trail. | Record `cancelled` and `completed` content approval actions. |
| CICT-CONTENT-GAP-002 | Process integration | `processInstanceId` exists but workflow is separate. | Clear source of truth for approvals. | Duplicate workflow concepts confuse admins. | Decide whether content submit creates/links a process instance. |
| CICT-CONTENT-GAP-003 | Rich text rendering | Some render paths use `dangerouslySetInnerHTML` directly. | All rich text rendering sanitized at boundary. | XSS defense depends on upstream assumptions. | Use shared sanitized structured content rendering everywhere. |
| CICT-CONTENT-GAP-004 | Notifications | Push/email services are present but delivery trigger behavior was not executed. | Published content notification behavior is documented and tested. | Users may miss expected updates. | Add focused tests/manual QA for publish-triggered notifications. |

---

## 5. Event and QR-Attendance Gaps

| Gap ID | Feature | Current State | Required State | Risk | Recommended Action |
|---|---|---|---|---|---|
| CICT-ATT-GAP-001 | Scanner web permission | Backend requires `SCAN_EVENT_ATTENDANCE`; page uses event-module access. | UI and backend permission match. | High. | Gate scanner route/action by scan permission. |
| CICT-ATT-GAP-002 | Attendance export | Backend has export; web exports loaded page data. | Full filtered backend export used by UI. | Medium incomplete reports. | Update web export to call backend CSV route. |
| CICT-ATT-GAP-003 | Manual corrections | Status updates/undo do not require correction reason. | Corrections record actor, reason, timestamp, previous/new status. | Medium audit gap. | Add structured correction reason workflow. |
| CICT-ATT-GAP-004 | QR expiry/offline policy | QR tokens expire by env/default; mobile caches tokens locally up to 7 days. | Risk policy defines cache duration and offline use. | Medium replay/window risk. | Confirm desired QR TTL and offline policy with stakeholders. |
| CICT-ATT-GAP-005 | Duplicate protection | Registration state prevents duplicate check-ins; logs are append-only. | Duplicate behavior is tested under concurrent scans. | Medium race risk. | Add concurrency test or atomic conditional update for first scan. |

---

## 6. Mobile Application Gaps

| Gap ID | Feature | Current State | Required State | Risk | Recommended Action |
|---|---|---|---|---|---|
| CICT-MOBILE-GAP-001 | Typecheck | Fails in mobile tests. | `tsc --noEmit` passes. | High release blocker. | Fix test mock typing and auth-store state typing. |
| CICT-MOBILE-GAP-002 | Push notifications | Local notification store and registration exist. | Device delivery verified. | Medium. | Test push registration/delivery with real Expo token. |
| CICT-MOBILE-GAP-003 | QR offline cache | SecureStore QR cache exists. | Policy-approved expiry and invalidation behavior. | Medium. | Align cache duration with backend `STUDENT_QR_EXPIRE`. |
| CICT-MOBILE-GAP-004 | Scanner mode | Mobile is student-facing only. | Staff scanner scope explicitly in/out of roadmap. | Low. | Keep staff scanning on web unless stakeholders request mobile scanner. |
| CICT-MOBILE-GAP-005 | Build pipeline | EAS files/config present in uncommitted worktree. | Clea
1n committed and verified mobile build setup. | Medium. | Review existing mobile/deploy changes, then run EAS validation separately. |

---

## 7. Module-Connection Gaps

| Gap ID | Source Module | Target Module | Missing Connection | Impact | Recommended Action |
|---|---|---|---|---|---|
| CICT-CONN-GAP-001 | Dashboard | RBAC scopes | Cache key lacks scope. | Data visibility/count correctness risk. | Scope dashboard cache. |
| CICT-CONN-GAP-002 | Scanner UI | Backend scan authorization | UI guard mismatch. | Users may see scanner without scan rights. | Scan-specific UI permission check. |
| CICT-CONN-GAP-003 | Organization membership routes | Scoped org permissions | Global route middleware blocks scoped controller path. | Scoped org admins blocked. | Scope-aware membership route guard. |
| CICT-CONN-GAP-004 | Process engine | Content approval | No automatic content process link. | Approval concepts split. | Decide integration/default process template. |
| CICT-CONN-GAP-005 | Attendance report UI | Backend export | UI does not consume backend export. | Partial exports. | Wire UI to backend export endpoint. |
| CICT-CONN-GAP-006 | Notification services | Publish/register events | Delivery triggers not verified. | Unreliable user communication. | Add trigger tests and device QA. |

---

## 8. Architecture Gaps

| Gap ID | Area | Current State | Risk | Recommended Improvement |
|---|---|---|---|---|
| CICT-ARCH-GAP-001 | Cache scoping | Some caches are global and some are scope-aware. | Scoped data leakage/staleness. | Audit all cache keys that depend on authenticated user scope. |
| CICT-ARCH-GAP-002 | Route authorization | Mixed route-level and service-level enforcement. | Inconsistent future behavior. | Introduce scope-aware route helpers or systematic integration tests. |
| CICT-ARCH-GAP-003 | Reports/export | Some reports are backend-backed, some generated in UI. | Incomplete/inconsistent exports. | Treat backend as report/export source of truth. |
| CICT-ARCH-GAP-004 | Workflow engines | Content approval and process engine are separate. | Admin confusion and duplicated states. | Define single workflow ownership model. |
| CICT-ARCH-GAP-005 | Local dev config | API defaults vary by file. | Developer setup confusion. | Normalize or document `4000` vs `5000` expectations. |

---

## 9. Prioritized Implementation Backlog

| Backlog ID | Priority | Task | Related Gap IDs | Affected Modules | Effort | Dependencies | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|---|---|
| CICT-BL-001 | P0 — Immediate blocker | Scope dashboard cache by authenticated user and permissions. | CICT-BLOCK-001 | Backend dashboard/RBAC | S | Test fixtures | Two scoped users cannot receive each other's cached counts. | Pending |
| CICT-BL-002 | P1 — Required before next deployment | Fix web typecheck failure. | CICT-BLOCK-002 | Web | S | None | Web typecheck passes. | Pending |
| CICT-BL-003 | P1 — Required before next deployment | Fix mobile typecheck failures. | CICT-BLOCK-002 | Mobile | S | None | Mobile typecheck passes. | Pending |
| CICT-BL-004 | P1 — Required before next deployment | Gate scanner UI by `SCAN_EVENT_ATTENDANCE`. | CICT-ATT-GAP-001 | Web/backend permissions | S | Permission hook update | Non-scanner admin cannot render scanner controls. | Pending |
| CICT-BL-005 | P1 — Required before next deployment | Make membership approval routes scope-aware. | CICT-RBAC-GAP-003 | Backend/web approvals | M | Scoped-role test data | Scoped org admin can approve only assigned org applications. | Pending |
| CICT-BL-006 | P2 — Required for next sprint | Wire attendance export UI to backend CSV endpoint. | CICT-ATT-GAP-002 | Web/backend reports | S | API response handling | Export includes all filtered rows. | Pending |
| CICT-BL-007 | P2 — Required for next sprint | Add event cancel/complete approval-action records. | CICT-CONTENT-GAP-001 | Backend events/approvals | S | None | Approval history shows cancelled/completed. | Pending |
| CICT-BL-008 | P2 — Required for next sprint | Require/manual correction reason for attendance overrides. | CICT-ATT-GAP-003 | Backend/web attendance | M | Product reason taxonomy | Status corrections persist reason and actor. | Pending |
| CICT-BL-009 | P2 — Required for next sprint | Decide content approval/process integration policy. | CICT-CONTENT-GAP-002 | Product/backend/web | M/L | Stakeholder decision | Documented source of truth and implemented links if approved. | Pending |
| CICT-BL-010 | P2 — Required for next sprint | Verify and test notification delivery triggers. | CICT-CONTENT-GAP-004 | Backend/mobile | M | Expo/device config | Trigger matrix passes manual/test verification. | Pending |
| CICT-BL-011 | P3 — Improvement after stabilization | Normalize local API port docs/defaults. | CICT-ARCH-GAP-005 | Docs/config | S | Team convention | One documented local backend port pattern. | Pending |
| CICT-BL-012 | P3 — Improvement after stabilization | Replace direct rich-text render paths with sanitized shared renderer. | CICT-CONTENT-GAP-003 | Web | S | None | No unsanitized `dangerouslySetInnerHTML` for CMS content. | Pending |

---

## 10. First Ten Recommended Tasks

| Order | Task | Reason | Priority | Dependency | Validation |
|---:|---|---|---|---|---|
| 1 | Fix dashboard cache scoping. | Highest risk workflow/data visibility issue. | P0 | None | Backend scoped-cache integration test. |
| 2 | Fix web typecheck. | CI/release blocker. | P1 | None | `pnpm --filter @cict/web typecheck`. |
| 3 | Fix mobile typecheck. | CI/mobile release blocker. | P1 | None | `pnpm --filter @cict/mobile typecheck`. |
| 4 | Align scanner web guard with backend scan permission. | Scanner UX/security consistency. | P1 | Permission hook update. | Manual/admin permission test. |
| 5 | Make organization membership approval route scope-aware. | Restores scoped organization admin workflow. | P1 | Scoped role test fixture. | Integration test. |
| 6 | Wire attendance export to backend endpoint. | Prevents partial report exports. | P2 | API client update. | Export full filtered dataset. |
| 7 | Record event cancel/complete in content approval history. | Completes audit history. | P2 | Approval action helper update. | Approval history test. |
| 8 | Add attendance correction reason workflow. | Improves accountability. | P2 | Stakeholder reason policy. | Required reason on correction. |
| 9 | Verify notification triggers. | Confirms user communication. | P2 | Expo/backend env. | Publish/register notification QA. |
| 10 | Decide content/process workflow integration. | Avoids two competing workflow systems. | P2 | Product decision. | Documented and tested lifecycle. |

---

## 11. Recommended Development Stages

### Stage 0: Resolve Critical Security and RBAC Blockers

- Scope dashboard cache.
- Align scanner UI permission with backend scan permission.
- Fix scoped organization membership approval route checks.
- Keep existing secret-rotation remediation work from `docs/PHASED_REMEDIATION_EXECUTION_PLAN.md` active.

### Stage 1: Stabilize Content Publishing and Status Rules

- Add event cancel/complete approval-action history.
- Decide self-approval policy.
- Confirm all generic update endpoints cannot change protected status fields.
- Sanitize all rich-text render paths.

### Stage 2: Connect Event and QR-Attendance Workflows

- Use backend export for attendance CSV.
- Add correction reason workflow.
- Add concurrency/atomicity test for first scan.
- Confirm QR TTL and offline cache policy.

### Stage 3: Stabilize Student Mobile and Scanner Flows

- Fix mobile typecheck.
- Verify QR pass on device.
- Verify token refresh and logout on mobile.
- Confirm EAS/mobile deployment changes in a separate implementation pass.

### Stage 4: Strengthen Reports, Notifications, and Audit Logs

- Verify push/email/local reminder delivery.
- Add report privacy review for attendance exports.
- Expand logs with actor, reason, and affected domain IDs where missing.

### Stage 5: Complete QA and Release-Readiness Review

- Run full lint/typecheck/test/build after implementation work.
- Run browser QA for admin content, approval, scanner, student web, and public pages.
- Run mobile device QA for login, event registration, QR pass, attendance history, updates, organizations, and logout.

---

## 12. Stakeholder Decisions Required

| Decision ID | Question | Why It Matters | Available Options | Recommended Default | Impact if Delayed |
|---|---|---|---|---|---|
| CICT-DEC-001 | Should content creators be allowed to approve their own submissions? | Approval governance. | Allow, block, or block only for organization-owned content. | Block self-approval for formal approvals. | Ambiguous review accountability. |
| CICT-DEC-002 | Should direct draft-to-publish remain allowed? | Current service permits draft publish. | Keep, restrict to full admins, require approved first. | Allow only users with publish permission; document explicitly. | Confusion over approval requirements. |
| CICT-DEC-003 | Should process engine become the approval source of truth? | Avoids duplicate workflows. | Separate modules, optional link, mandatory process-backed approvals. | Optional link first, mandatory later if needed. | Duplicated statuses persist. |
| CICT-DEC-004 | What correction reasons are required for attendance overrides? | Audit and compliance. | Free text, reason enum, no reason. | Reason enum plus optional notes. | Manual correction audit remains weak. |
| CICT-DEC-005 | What QR/offline expiry is acceptable? | QR replay and offline usability balance. | Short TTL, event-day TTL, current default/env TTL. | Event-day or short TTL for high-stakes attendance. | Mobile cache behavior remains policy-unclear. |
| CICT-DEC-006 | Should staff scanning be web-only or also mobile? | Product scope and permissions. | Web-only, mobile staff mode, separate staff app. | Web-only until student app stabilizes. | Mobile roadmap ambiguity. |
| CICT-DEC-007 | Which attendance export fields are allowed? | Student data privacy. | Minimal, operational, full detail. | Minimal by default, full detail behind privileged permission. | Export privacy risk. |
| CICT-DEC-008 | Which local backend port is canonical? | Developer setup consistency. | 4000, 5000, documented dual mode. | Use README/AGENTS value consistently or document dev override. | Onboarding confusion. |

---

## 13. Manual Verification Items

| Item | Reason | Recommended Owner | Status |
|---|---|---|---|
| Dashboard scoped cache with two admins | Needs runtime fixtures and authenticated calls. | Backend QA | Pending |
| Scanner page permission behavior | Needs browser UI and permission roles. | Web QA | Pending |
| Membership approval by scoped org admin | Needs scoped organization assignment fixture. | Backend/Web QA | Pending |
| QR scan with real camera | Requires browser camera and real QR token. | QA | Pending |
| Mobile QR pass and offline cache | Requires simulator/device runtime. | Mobile QA | Pending |
| Push notifications | Requires Expo push token and backend env. | Mobile/backend | Pending |
| Attendance export completeness | Requires more rows than one page and filtered export. | QA | Pending |
| Production/staging deployment secrets | Requires GitHub/Render/Vercel dashboard access. | DevOps | Pending |
| EAS mobile build setup | Requires Expo account/project verification. | Mobile/DevOps | Pending |
