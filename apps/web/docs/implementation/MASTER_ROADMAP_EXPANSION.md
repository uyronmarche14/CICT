# CICT Platform Expansion Roadmap

Last updated: 2026-05-31

## Purpose

Track post-release platform expansion after the Phase 1-9 foundation. This file is the canonical follow-up referenced by `MASTER_ROADMAP.md`.

## Product Direction: Connected Organization Operating System

The expansion roadmap should not become a set of unrelated admin pages. The target product shape is a connected organization operating system:

1. **Run the org internally** - Phase 10 gives officers tools for tasks, meetings, votes, budgets, and templates.
2. **Measure org health** - Phase 10A turns operational data into decision metrics for officers, advisers, moderators, and admins.
3. **Collaborate across orgs** - Phase 11 should organize partnerships, shared spaces, resources, task forces, mentorship, and shared content into one lifecycle.
4. **Coordinate time and deadlines** - Phase 12 should aggregate events, meetings, tasks, deadlines, and reminders into one role-based calendar.
5. **Extend outside CICT** - Phase 11A and 12A should be added only after the internal and inter-org workflows are stable.

### Core Business Workflow

The strongest long-term flow is:

```
Organization profile
  -> internal work: tasks, meetings, votes, budgets
  -> public/admin content: news, announcements, events
  -> approval/process workflow
  -> partnership or collaboration initiative
  -> shared tasks, resources, content, meetings, events
  -> outcomes and evidence
  -> analytics and calendar visibility
```

This keeps every feature tied to a real administrative outcome: accountability, coordination, reporting, event delivery, accreditation evidence, and officer handover.

### Data Connection Strategy

New expansion data should connect back to the main platform instead of living as side records.

Recommended linking fields for future hardening:
- `partnershipId` on collaboration spaces, task forces, resource requests, shared content, and mentorship records.
- `eventId`, `taskId`, `meetingId`, or `processInstanceId` where a record belongs to a real activity or approval flow.
- `academicYear`, `semester`, `fiscalYear`, `leadOrgId`, `partnerOrgIds`, `ownerUserId`, and `adviserUserId` for reporting.
- Outcome fields such as goals, deliverables, success metrics, completion notes, evidence attachments, and post-activity evaluation.
- Status history/audit trail for partnership, resource, mentorship, task force, and shared-content transitions.

### Completion Quality Rule

A phase can be technically implemented but still need business-flow hardening. Mark a feature as product-complete only when it:
- Is connected to real source data or writes useful operational records.
- Has clear ownership, permissions, lifecycle statuses, and auditability.
- Feeds at least one of: organization profile, approval workflow, calendar, analytics, or public/student-facing content.
- Supports a real CICT workflow instead of only listing records.

## Phase 10: Organization Admin Tools

**Status:** Complete.

**Scope:** Organization task boards, meetings with agendas/minutes/action items, voting/elections, budget and transactions, global organization templates. Full CRUD for all 5 features.

**Code anchors:**
- 7 models: `OrgTask`, `OrgMeeting`, `OrgVote`, `OrgVoteBallot`, `OrgBudget`, `OrgTransaction`, `OrgTemplate`
- 29 routes mounted at `/api/organizations`
- 5 permissions: `MANAGE_ORG_TASKS`, `MANAGE_ORG_MEETINGS`, `MANAGE_ORG_VOTES`, `MANAGE_ORG_BUDGET`, `MANAGE_ORG_TEMPLATES`
- Frontend: 5 pages with create/edit dialogs, sidebar tree, OrgSubNav

## Phase 10A: Analytics & Reporting

**Status:** Complete baseline. Needs ongoing metric refinement as Phase 11 data becomes connected.

**Scope:** Per-org analytics with recharts dashboards, engagement scoring, task/event/financial trends. 6 API endpoints with 60s cache.

**Code anchors:**
- `services/org-analytics.service.ts` — aggregation across 8 models
- `routes/org-analytics.routes.ts` — 6 endpoints
- `[id]/analytics/page.tsx` — Tabbed dashboard with PieChart, BarChart, LineChart
- Permission: `VIEW_ORG_ANALYTICS`

**Business logic:** Analytics should answer operational questions, not only display charts:
- Is the organization active or falling behind?
- Are tasks overdue or concentrated on too few officers?
- Are meetings happening and producing action items?
- Are events converting registrations into attendance?
- Is the budget being used responsibly?
- Which partnerships or collaborations produced real outcomes?

## Phase 11: Inter-Org Collaboration

**Status:** Complete baseline. Needs workflow consolidation and deeper links to core data before product-complete.

**Scope:** 6 collaboration features — partnerships with invite/accept/decline flow, collaboration spaces with messaging, cross-org content sharing, cross-org task forces, resource pooling with approve/deny, org mentorship.

**Code anchors:**
- 7 models: `OrgPartnership`, `CollaborationSpace`, `CollaborationMessage`, `CrossOrgContentShare`, `OrgTaskForce`, `ResourceRequest`, `OrgMentorship`
- 35 routes mounted at `/api/organizations`
- 6 permissions
- 6 frontend pages with full CRUD dialogs

**Business logic:** Partnership should become the parent workflow for most cross-org activity:

```
Invite partnership
  -> accept or decline
  -> create collaboration space
  -> attach shared tasks, meetings, resources, content, events, or task force
  -> track deliverables and evidence
  -> close with outcomes
  -> include results in analytics and calendar
```

This avoids six separate tools feeling disconnected.

## Phase 11A: Cross-Institutional

**Status:** Not started.

**Scope:** External school/department profiles, inter-college events, MOA/MOU tracking, guest passes, federation gateway.

**Business rule:** Do not start until Phase 11 has a strong partnership lifecycle. External collaboration should reuse the same partnership/collaboration concepts with added verification, MOA, and guest access.

## Phase 12: Role-Based Calendar System

**Status:** Not started.

**Scope:** Full-page calendar dashboard with month/week/day/agenda views, role-based filtering, color-coded by type/org, drag-and-drop rescheduling.

**Business logic:** Calendar should be a read-only coordination layer over existing source records: events, meetings, tasks, deadlines, approvals, resource reservations, mentorship sessions, and collaboration milestones. It should not become a second source of truth.

## Phase 12A: Calendar Integrations

**Status:** Not started.

**Scope:** iCal/Google Calendar export, recurring events (RRULE), push notification reminders, calendar search, mobile calendar sync, print calendar.

**Business rule:** Start only after Phase 12 feed contracts are stable. External sync should export the unified calendar, not rebuild calendar logic separately.

## Status Board

| Phase | Status |
|---|---|
| Phase 10 — Organization Admin Tools | **Complete** |
| Phase 10A — Analytics & Reporting | **Complete baseline** |
| Phase 11 — Inter-Org Collaboration | **Complete baseline** |
| Phase 11A — Cross-Institutional | Not started |
| Phase 12 — Role-Based Calendar | Not started |
| Phase 12A — Calendar Integrations | Not started |
