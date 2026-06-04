# Phase 10: Organization Admin Expansion

## Goal

Expand organization-level admin tooling beyond basic CRUD. Give org admins dedicated tools for managing tasks, meetings, voting, budget, templates, and analytics — all scoped to their organization.

## Business Role in the Platform

Phase 10 is the internal operations backbone. It should answer: "Can an organization actually run itself inside the system?"

Each feature should have a clear administrative purpose:
- Tasks: officer accountability, event preparation, committee work, handover tracking.
- Meetings: agenda planning, attendance intent, minutes, and action-item follow-through.
- Voting: officer elections, committee decisions, and formal member consultation.
- Budget: allocation, spending, income, receipts, and fiscal-year visibility.
- Templates: consistent org setup for new or restructured organizations.

Phase 10 data should feed later phases instead of staying isolated:
- Tasks, meetings, and budget feed Phase 10A analytics.
- Tasks and meetings feed Phase 12 calendar.
- Votes and budget records can support audit/history reports.
- Templates can standardize committees, officer roles, and repeatable processes.

## Current Status

**Complete.** Full CRUD (create, read, update, delete) for all 5 core features.

**Backend (7 models, 29 routes):**
- `OrgTask` — Kanban-style task management with status (todo/in_progress/done), priority, due date, checklist, tags, category, status history, meeting linking, committee/office ownership fields
- `OrgMeeting` — Meeting scheduling with date, duration, agenda topics with presenters, attendees with RSVP, minutes, action items
- `OrgVote` + `OrgVoteBallot` — Voting/elections with positions, candidates, anonymous ballots, results with vote counts
- `OrgBudget` + `OrgTransaction` — Budget tracking with fiscal year, categories, income/expense transactions, status history, budget linking
- `OrgTemplate` — Reusable org structure templates with default roles, color schemes, committees, programs

**Frontend (12 route files + 5 form components):**
- Sidebar tree with org sub-items, collapsible org section
- OrgSubNav tab bar with overflow dropdown
- All pages use `OrgPageLayout` with loading/empty/content states
- Create/edit dialogs using shadcn Dialog + react-hook-form
- BudgetForm supports edit mode (pre-populated from existing budget data)
- TransactionForm includes fiscal year and semester fields

**Key features:**
- Permission-gated: 5 new `MANAGE_ORG_*` permissions
- CSRF fixed for development mode
- `requireAdminAccess` + `authorize` middleware on all routes
- Bilateral org slug→ObjectId resolution in all services
- Status history tracking on OrgTask and OrgBudget with changedBy, changedAt, reason
- Meeting-to-task linking fields on OrgTask (meetingId, actionItemIndex)
- Officer/committee ownership fields on OrgTask (committee, officerPosition)
- Fiscal year and semester tracking on OrgTransaction, scoped budget filtering

## Dependencies

- Organization model, OrganizationMember, OrganizationMembership — all exist
- Permission system (RBAC with org-scoping) — exists
- Phase 06A Organization and Leader Data Expansion — completed

## Changes

### Models (7)
- `OrgTask` — title, description, assigneeIds, status, priority, dueDate, category, tags, attachments, checklist
- `OrgMeeting` — title, date, duration, location, meetingUrl, agenda, attendees, minutes, actionItems
- `OrgVote` — title, description, positions[], candidates[], startDate, endDate, isAnonymous
- `OrgVoteBallot` — voteId, voterId, selections, castAt
- `OrgBudget` — fiscalYear, totalBudget, categories
- `OrgTransaction` — type, category, amount, description, date, vendor, paymentMethod, referenceNumber
- `OrgTemplate` — name, description, defaultRoles, defaultColorScheme, defaultStructure

### Routes (29)
All mounted at `/api/organizations` with `protect` + `requireAdminAccess`:
- Tasks: GET/POST/PUT/DELETE + PATCH status + PATCH checklist
- Meetings: GET/POST/PUT/DELETE + PATCH minutes + PATCH action-items
- Voting: GET/POST/PUT/DELETE + POST cast + GET results
- Budget: GET/POST/PUT + GET/POST/DELETE transactions
- Templates: GET/POST/PUT/DELETE + POST apply (system-wide at `/api/org-templates`)

### Permissions (5)
`MANAGE_ORG_TASKS`, `MANAGE_ORG_MEETINGS`, `MANAGE_ORG_VOTES`, `MANAGE_ORG_BUDGET`, `MANAGE_ORG_TEMPLATES`

### Frontend Form Components (5)
- `TaskForm` — title, description, priority, dueDate, tags, checklist editor
- `MeetingForm` — title, date, duration, location, meetingUrl, description, agenda, minutes, actionItems
- `VoteForm` — title, description, positions, candidates, startDate, endDate, isAnonymous
- `BudgetForm` + `TransactionForm` — budget setup + transaction entry with vendor, payment method, reference
- `TemplateForm` — name, description, default roles, color scheme, committees, programs

## API/Data Contracts

- All routes require admin auth + `authorize(Permission.MANAGE_ORG_*)`
- Org-scoping via slug param (`:orgId`) resolved to ObjectId in services
- Response format: `{ success: boolean, data?: T, message?: string }`
- All models include `timestamps: true` (createdAt, updatedAt)

## Completed Strengthening Tasks

- ~~Add status history for task and budget changes for better accountability.~~ ✅ `statusHistory` field on OrgTask + OrgBudget, auto-tracked on status/amount changes.
- ~~Add officer/committee ownership fields where appropriate, so reports can show who is responsible.~~ ✅ `committee` and `officerPosition` on OrgTask + TaskForm UI + card badges.
- ~~Link meeting action items to `OrgTask` records so follow-up work is not trapped inside meeting minutes.~~ ✅ `meetingId` + `actionItemIndex` on OrgTask; "Promote to Task" button in meeting cards opens TaskForm pre-filled.
- ~~Add fiscal-year/semester filters across tasks, meetings, votes, and transactions.~~ ✅ `fiscalYear` + `semester` on OrgTask, OrgMeeting, OrgTransaction; `FiscalSemesterFilter` component on all 3 pages.
- ~~Add budget categories editor UI.~~ ✅ Categories (name + allocated) editor in BudgetForm, displayed during edit.
- ~~Add StatusHistory viewer UI.~~ ✅ `StatusHistoryTimeline` component on tasks + budget pages.
- ~~Add process-template links for org content.~~ ✅ `processInstanceId` on OrgTask, OrgMeeting, OrgBudget; `linkedContentType` extended with `task/meeting/budget`; `POST /instances/:id/link` route.

## Future Strengthening Tasks

- Add optional process-template links for formal workflows such as budget requests, event preparation, and elections. (Link route exists, frontend button to link processes pending.)

## Test Cases

- Task CRUD respects org scoping (cross-org isolation)
- Meeting RSVP flow: pending → accepted/declined
- Vote ballot prevents duplicate casting (unique index on voteId + voterId)
- Budget transactions are append-only (no edit, delete only)
- Template apply updates org color scheme + structure

## Acceptance Gate

All 5 features have working create, read, update, and delete operations through both the backend API and the admin frontend UI.

## Rollback Notes

Each feature can be disabled by removing its route bank and sidebar entry independently. All use separate collections — no changes to existing org data. Feature flags per org can hide specific tools.
