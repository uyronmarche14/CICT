# CICT Admin Mobile App — Complete Implementation Plan

**Status:** Superseded by `docs/plans/unified-mobile-role-architecture.md`  
**Last updated:** 2026-06-14  
**Target audience:** Lead mobile developer, software engineers  
**Scope:** Full admin mobile companion — events, scanning, approvals, students, organizations, quick content actions

> This document is kept as historical reference only. The temporary `apps/admin-mobile` package has been retired; new admin mobile work belongs in the unified `apps/mobile` app.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Mobile-Appropriateness Matrix](#2-mobile-appropriateness-matrix)
3. [Current State Analysis](#3-current-state-analysis)
4. [Architecture Overview](#4-architecture-overview)
5. [Screen-by-Screen Specification](#5-screen-by-screen-specification)
6. [Scanner Core Design](#6-scanner-core-design)
7. [Notification System](#7-notification-system)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Implementation Phases](#9-implementation-phases)
10. [Technical Decisions](#10-technical-decisions)
10a. [Modern UI & Animation Layer](#10a-modern-ui--animation-layer)
11. [UI/UX Design Principles](#11-uiux-design-principles)
12. [Security Considerations](#12-security-considerations)
13. [Testing Strategy](#13-testing-strategy)
14. [Appendix: API Reference](#14-appendix-api-reference)

---

## 1. Executive Summary

### The Problem

CICT has a full web admin panel with 24+ modules but **no mobile admin app**. Staff must carry laptops to scan QR codes, approve content, look up students, and manage organizations. Volunteers at event doors are tethered to desks instead of patrolling with phones.

### The Solution

Build a **dedicated admin mobile app** (`apps/admin-mobile/`) as a new Expo monorepo package that gives staff:

| Module | What You Can Do |
|---|---|
| **Dashboard** | See summary counts, today's events, pending approvals |
| **Scanner** | Camera QR scan + manual student entry + undo check-in |
| **Events** | List, detail, registration list, attendance logs |
| **Approvals** | Approve/reject content and membership applications |
| **Students** | Searchable lookup + read-only detail + status toggle |
| **Organizations** | Card grid browse + detail overview + sub-tools |
| **News/Announcements** | Quick approve/publish/archive from list |
| **Calendar (upcoming)** | 7-day list view of events, meetings, tasks |
| **Settings** | Profile, permissions, feature toggles, dark mode, logout |

### Key Design Principle

> **View everything. Act on simple things. Edit nothing complex.**

The web remains the creation/editing tool. Mobile is the inspection and quick-decision companion.

### Zero Backend Changes

All required API endpoints exist. This is purely a new mobile client consuming existing APIs.

---

## 2. Mobile-Appropriateness Matrix

This matrix determines which of the 24+ web admin modules belong in the mobile app.

| Web Module | Mobile? | Why | What to Build |
|---|---|---|---|
| **Dashboard** | ✅ Yes | Simple metric cards, no interaction | Summary counts + today's events + pending approvals |
| **Scanner/Attendance** | ✅ Yes | Core mobile workflow | Camera QR, manual entry, undo, logs |
| **Events** | ✅ Yes | List, detail, registrations, attendance logs | Card list with filters, stat cards, tabs |
| **Approvals Hub** | ✅ Yes | Simple binary approve/reject | Content queue + membership apps + reject dialog |
| **Students** | ✅ Yes | Quick lookup at events | Card list with search + read-only detail + status toggle |
| **Organizations** | ✅ Yes | Browse + overview + quick actions | Card grid + detail with sub-tabs |
| **Org Tasks** | ✅ Yes | Kanban board works on mobile | Todo/In Progress/Done columns |
| **Org Meetings** | ✅ Yes | Card grid with RSVP counts | Create, edit, RSVP |
| **Org Voting** | ✅ Yes | Election cards + results | Status, dates, candidate count |
| **News Quick Actions** | ✅ Yes | Approve/publish/archive from list | Workflow buttons on list rows |
| **Announcement Quick Actions** | ✅ Yes | Same pattern | Workflow buttons on list rows |
| **Calendar (Upcoming)** | ✅ Yes | List view (not month grid) | Next 7 days of events/meetings |
| **Settings (Features)** | ✅ Yes | Simple toggle switches | Read-only permission list + feature toggles |
| **News Rich Editor** | ❌ Skip | 716-line desktop form | Complex forms stay on web |
| **Announcement Rich Editor** | ❌ Skip | 775-line desktop form | Complex forms stay on web |
| **Student Create/Edit Form** | ❌ Skip | 22-field multi-column form | Complex forms stay on web |
| **Calendar Month Grid** | ❌ Skip | 7-column desktop layout | Desktop-only |
| **Analytics Charts** | ❌ Skip | Recharts need screen width | Desktop-only |
| **Process Flow Canvas** | ❌ Skip | Visual drag-and-drop editor | Desktop-only |
| **FAQ Editor** | ❌ Skip | Two-column preview editor | Desktop-only |
| **Users Management** | ❌ Skip | Desktop admin task | Desktop-only |
| **Roles Management** | ❌ Skip | Desktop admin task | Desktop-only |
| **Audit Logs** | ❌ Skip | Wide-table inspection | Desktop-only |
| **System Settings** | ❌ Skip | Complex grouped settings | Desktop-only |

### Summary

| Category | Count | Modules |
|---|---|---|
| ✅ **Mobile** | 13 | Dashboard, Scanner, Events, Approvals, Students, Orgs, Org Tasks, Org Meetings, Org Voting, News Quick Actions, Announcement Quick Actions, Calendar Upcoming, Settings |
| ❌ **Desktop-only** | 11+ | Rich editors, forms, month grid, analytics, process flow, FAQ, users, roles, audit logs, system settings |

---

## 3. Current State Analysis

### What Exists Today

| Layer | Status | Details |
|---|---|---|
| **Backend scan endpoint** | ✅ | `POST /admin/events/:id/attendance/scan` — accepts `qrToken` (JWT) or `studentNumber` |
| **Backend registrations/logs** | ✅ | Full CRUD: list, search, cancel, undo, attendance logs with filter + pagination + CSV |
| **Backend admin auth** | ✅ | `POST /auth/login` — `User` model, JWT, 61 RBAC permissions |
| **Backend approvals** | ✅ | Approve/reject events, news, announcements, memberships |
| **Backend students** | ✅ | List, search, detail, status toggle |
| **Backend organizations** | ✅ | List, detail, sub-tools (tasks, meetings, voting) |
| **Contracts types** | ✅ | All types defined in `@cict/contracts` |
| **Web scanner UI** | ✅ | `html5-qrcode` at `/admin/events/[id]/scan` |
| **Student mobile QR pass** | ✅ | `react-native-qrcode-svg`, offline 7-day cache |
| **Mobile admin app** | ❌ | Does not exist |

### What Needs to Be Built

| Capability | Status |
|---|---|
| Staff auth (email/password, admin JWT) | ❌ |
| Dashboard with metric cards | ❌ |
| Camera QR scanner + manual entry + undo | ❌ |
| Event list with filters + detail with tabs | ❌ |
| Approvals queue with approve/reject | ❌ |
| Student search + read-only detail | ❌ |
| Organization browse + detail + sub-tools | ❌ |
| News/announcement quick actions | ❌ |
| Upcoming calendar list view | ❌ |
| Settings with permissions + feature toggles | ❌ |

### Key Difference: Student vs Admin Mobile

| Aspect | Student App | Admin App |
|---|---|---|
| **Auth model** | `Student` (studentNumber) | `User` (email + RBAC) |
| **Login** | `POST /student/auth/login` | `POST /auth/login` |
| **API base** | `/api/student/*` | `/api/admin/*` + `/api/auth/*` |
| **Permissions** | None | RBAC — 61 permissions |
| **Camera** | Not used | `expo-camera` |
| **Tabs** | 5 (Home, Events, Orgs, Updates, Settings) | 7 (Dashboard, Scanner, Events, Approvals, Students, Orgs, Settings) |

---

## 4. Architecture Overview

### Monorepo Placement

```
apps/admin-mobile/   ← sibling to apps/mobile/, apps/web/, apps/backend/
```

Auto-discovered by `pnpm-workspace.yaml` glob (`apps/*`).

### Directory Structure

```
apps/admin-mobile/
├── app.json                          # "CICT Admin", scheme "cictadmin"
├── package.json                      # @cict/admin-mobile
├── tsconfig.json                     # extends @cict/tsconfig/expo.json
├── jest.config.js                    # jest-expo
├── eslint.config.js                  # @cict/eslint-config/expo
├── babel.config.js                   # babel-preset-expo
├── metro.config.js                   # default
├── eas.json                          # dev/preview/prod
│
├── app/                              # Expo Router routes
│   ├── _layout.tsx                   # AppProviders → RootNavigator
│   ├── index.tsx                     # Auth gate redirect
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   │
│   └── (app)/                        # Tab navigator (7 tabs)
│       ├── _layout.tsx               # Bottom tabs
│       │
│       ├── dashboard/
│       │   └── index.tsx             # Metric cards + today's events + pending
│       │
│       ├── scanner/                  # Scanner tab stack
│       │   ├── _layout.tsx
│       │   ├── index.tsx             # Event selector
│       │   └── [id].tsx              # Camera + manual + recent
│       │
│       ├── events/                   # Events tab stack
│       │   ├── _layout.tsx
│       │   ├── index.tsx             # Event list with filters
│       │   └── [id].tsx              # Event detail + tabs
│       │       ├── registrations.tsx
│       │       └── attendance.tsx
│       │
│       ├── approvals/
│       │   └── index.tsx             # Content queue + membership apps
│       │
│       ├── students/
│       │   ├── _layout.tsx
│       │   ├── index.tsx             # Searchable list + filters
│       │   └── [id].tsx              # Read-only detail
│       │
│       ├── organizations/            # Orgs tab stack
│       │   ├── _layout.tsx
│       │   ├── index.tsx             # Card grid + type filters
│       │   └── [id].tsx              # Detail overview + sub-tabs
│       │       ├── tasks.tsx         # Kanban board
│       │       ├── meetings.tsx      # Card grid
│       │       └── voting.tsx        # Election cards
│       │
│       ├── content/
│       │   ├── _layout.tsx
│       │   ├── index.tsx             # Combined news + announcements list
│       │   └── [id].tsx              # Detail + quick actions
│       │
│       ├── calendar/
│       │   └── index.tsx             # Upcoming 7-day list
│       │
│       └── settings.tsx              # Profile, permissions, toggles, logout
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Reused from student app
│   │   │   ├── AppScreen.tsx
│   │   │   ├── AppCard.tsx
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppTextInput.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   └── StatusPill.tsx
│   │   ├── feedback/                 # Reused from student app
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ConnectivityNotice.tsx
│   │   ├── scanner/
│   │   │   ├── QrCameraView.tsx
│   │   │   ├── ScanResultOverlay.tsx
│   │   │   ├── ManualEntryInput.tsx
│   │   │   └── RecentCheckIns.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   └── AttendanceLogCard.tsx
│   │   ├── approvals/
│   │   │   ├── ApprovalCard.tsx      # Content approval row
│   │   │   ├── MembershipCard.tsx    # Membership app row
│   │   │   └── RejectDialog.tsx      # Reason input modal
│   │   ├── students/
│   │   │   ├── StudentCard.tsx       # Search result row
│   │   │   └── StudentProfileCard.tsx
│   │   └── organizations/
│   │       ├── OrgCard.tsx
│   │       └── OrgOverview.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── useAuthBootstrap.ts
│   │   │   ├── useLoginMutation.ts
│   │   │   └── useLogout.ts
│   │   ├── scanner/
│   │   │   ├── useScanAttendance.ts
│   │   │   ├── useUndoCheckIn.ts
│   │   │   └── useRecentScans.ts
│   │   ├── events/
│   │   │   ├── useAdminEvents.ts
│   │   │   ├── useAdminEvent.ts
│   │   │   ├── useRegistrations.ts
│   │   │   └── useAttendanceLogs.ts
│   │   ├── approvals/
│   │   │   ├── usePendingApprovals.ts    # GET approvals queue
│   │   │   ├── useApproveContent.ts      # PATCH approve
│   │   │   └── useRejectContent.ts       # PATCH reject + reason
│   │   ├── students/
│   │   │   ├── useStudentSearch.ts       # GET students?q=
│   │   │   ├── useStudentDetail.ts       # GET students/:id
│   │   │   └── useToggleStudentStatus.ts # PATCH status
│   │   ├── organizations/
│   │   │   ├── useOrganizations.ts
│   │   │   ├── useOrganizationDetail.ts
│   │   │   └── useOrgTasks.ts
│   │   │   └── useOrgMeetings.ts
│   │   │   └── useOrgVotes.ts
│   │   ├── content/
│   │   │   ├── useContentList.ts          # Combined news + announcements
│   │   │   ├── useContentDetail.ts
│   │   │   ├── usePublishContent.ts
│   │   │   └── useArchiveContent.ts
│   │   ├── calendar/
│   │   │   └── useUpcomingEvents.ts
│   │   └── dashboard/
│   │       ├── useDashboardSummary.ts     # GET dashboard/summary
│   │       └── usePendingApprovalsCount.ts
│   │
│   ├── services/api/
│   │   ├── client.ts                     # Axios → /api, admin JWT
│   │   ├── auth.ts                       # login, logout, me, refresh
│   │   ├── admin-events.ts               # scan, registrations, logs
│   │   ├── admin-approvals.ts            # pending, approve, reject
│   │   ├── admin-students.ts             # list, search, detail, status
│   │   ├── admin-organizations.ts        # list, detail, tasks, meetings, votes
│   │   ├── admin-content.ts              # news + announcements list, workflow
│   │   ├── admin-calendar.ts             # upcoming feed
│   │   └── admin-dashboard.ts            # summary stats
│   │
│   ├── store/
│   │   └── auth-store.ts
│   │
│   ├── theme/
│   │   ├── tokens.ts                     # Copied from student app
│   │   └── ThemeContext.tsx
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── constants/
│   │   └── queryKeys.ts
│   │
│   ├── types/
│   │   ├── api.ts
│   │   └── models.ts
│   │
│   ├── utils/
│   │   ├── format.ts                     # Copied from student app
│   │   ├── haptics.ts
│   │   └── error.ts
│   │
│   └── providers/
│       └── AppProviders.tsx
│
├── assets/fonts/
│   └── Blockletter.otf
│
└── docs/
    ├── architecture.md
    ├── setup.md
    └── design-system.md
```

### Provider Nesting

```
AppProviders
  ├── SafeAreaProvider
  │   └── ThemeProvider (React Context, SecureStore-persisted)
  │       └── QueryClientProvider (TanStack Query, 30s staleTime)
  │           └── Router (Expo Router Stack)
```

### Auth Guard Flow

```
App Launch
  │
  ├─ useAuthBootstrap()
  │   ├─ Read tokens from SecureStore
  │   ├─ No tokens? → setStatus('anonymous') → show login
  │   ├─ Tokens exist? → GET /auth/profile
  │   │   ├─ Success? → setSession(user) → show app
  │   │   └─ Failure? → clearSession → show login
  │   └─ While loading → LoadingState
  │
  ├─ app/(auth)/_layout.tsx
  │   └─ if accessToken → Redirect to /(app)/dashboard
  │
  └─ app/(app)/_layout.tsx
      └─ if !accessToken → Redirect to /(auth)/login
```

### Tab Navigator — 7 Tabs

```
(app)/_layout.tsx
Bottom Tab Navigator (7 tabs, icons, active color: #6E29F6)

├── Dashboard    (grid-dashboard icon)    — Summary cards + today's events + pending
├── Scanner      (camera icon)            — Event selector → camera scan
├── Events       (calendar icon)          — Event list → detail → regs/attendance
├── Approvals    (clipboard-check icon)   — Content queue + membership apps
├── Students     (graduation-cap icon)    — Search + list → detail
├── Orgs         (building-2 icon)        — Card grid → detail + sub-tabs
└── Settings     (settings icon)          — Profile, permissions, toggles, logout
```

---

## 5. Screen-by-Screen Specification

### 5.1 Login Screen (`(auth)/login.tsx`)

Same as original plan. Email + password with zod validation. Gradient hero with Blockletter "CICT" branding. "Forgot password?" link added. See original section 4.1.

---

### 5.2 Dashboard Tab (`dashboard/index.tsx`)

**Purpose:** Quick summary of today's state — metrics, events, pending actions.

```
┌──────────────────────────────────┐
│ CICT Admin (Blockletter)         │
│ Mon, Jun 14, 2026                │
│                                  │
│ ┌──────────┐ ┌──────────┐      │
│ │ 12       │ │ 3        │      │
│ │ Events   │ │ Pending  │      │
│ │          │ │ Approvals│      │
│ └──────────┘ └──────────┘      │
│ ┌──────────┐ ┌──────────┐      │
│ │ 245      │ │ 8        │      │
│ │ Students │ │ Orgs     │      │
│ └──────────┘ └──────────┘      │
│                                  │
│ Today's Events                   │
│ ┌──────────────────────────────┐ │
│ │ Tech Conference   [Scan →]  │ │
│ │ 45/100 • 9:00 AM            │ │
│ │ [Active] [Open]             │ │
│ └──────────────────────────────┘ │
│                                  │
│ Pending Approvals                │
│ ┌──────────────────────────────┐ │
│ │ [News] "New Lab Opening"     │ │
│ │ Juan Dela Cruz • 2h ago     │ │
│ │ [Approve]  [Reject]         │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Data sources:**
- `GET /admin/dashboard/summary` — metric counts (7 cards, permission-gated)
- `GET /events` with filters for today's events
- `GET /admin/approvals/pending` — latest 3 pending approvals

**States:** Loading → metric cards skeleton → data. Error → ErrorState per section.

---

### 5.3 Scanner — Event Selector (`scanner/index.tsx`)

Same as original plan section 4.3. SectionList with "Today's Events" + "All Events". Capacity bar, status badges, "Start Scan" CTA.

---

### 5.4 Scanner Camera (`scanner/[id].tsx`)

Same as original plan section 4.4. CameraView with barcode detection, manual entry fallback, recent check-ins with undo, stats card.

---

### 5.5 Events Tab — List + Detail

**Event List** (`events/index.tsx`):
Same as original plan section 4.6. Filter chips (time + status), capacity bar, scan/view logs CTA.

**Event Detail** (`events/[id].tsx`):
Same as original plan section 4.7. "Start Scanning" primary CTA, 3 stat cards (filled/checked in/pending), info card, tabs for Registrations and Attendance.

---

### 5.6 Approvals Tab (`approvals/index.tsx`)

**Purpose:** Approve/reject content and membership applications.

```
┌──────────────────────────────────┐
│ Approvals                        │
│                                  │
│ [All] [Events] [News] [Members] │ ← Filter chips
│                                  │
│ ┌─ Content Queue (5) ──────────┐ │
│ │ [News] "New Lab Building"     │ │
│ │ Juan Dela Cruz • System      │ │
│ │ Submitted 2 hours ago        │ │
│ │ [✓ Approve]  [✗ Reject]      │ │
│ ├───────────────────────────────┤ │
│ │ [Event] "Career Fair"        │ │
│ │ Maria Santos • Tech Org      │ │
│ │ Submitted 1 day ago          │ │
│ │ [✓ Approve]  [✗ Reject]      │ │
│ └───────────────────────────────┘ │
│                                  │
│ ┌─ Membership Applications (2) ┐ │
│ │ Pedro Reyes (XX-1113)         │ │
│ │ Wants to join Tech Org       │ │
│ │ Applied 3 days ago           │ │
│ │ [✓ Approve]  [✗ Reject]      │ │
│ └───────────────────────────────┘ │
└──────────────────────────────────┘
```

**Rejection dialog** (on tap "Reject"):
```
┌──────────────────────────────────┐
│ Reject Content                   │
│                                  │
│ You are rejecting:               │
│ "New Lab Building"               │
│                                  │
│ Reason *                         │
│ ┌────────────────────────────┐  │
│ │ Missing required fields... │  │
│ └────────────────────────────┘  │
│ 0/500 characters                │
│                                  │
│ Additional Comments             │
│ ┌────────────────────────────┐  │
│ │                             │  │
│ └────────────────────────────┘  │
│                                  │
│ [Cancel]    [Submit Rejection]  │
└──────────────────────────────────┘
```

**Data sources:**
- `GET /admin/approvals/pending` — content pending approval (filterable by type)
- `GET /admin/approvals/pending?type=membership` — membership applications
- `PATCH /events/:id/approve`, `/news/:id/approve`, `/announcements/:id/approve`
- `PATCH /events/:id/reject`, etc. (with `{ reason }` body)
- `POST /organizations/:orgId/memberships/:id/approve`, `/reject`

**States:** Loading → Empty ("No pending approvals") → Data with result type badges.

---

### 5.7 Students Tab (`students/index.tsx` + `students/[id].tsx`)

**Purpose:** Quick student lookup and profile review.

```
Student List:
┌──────────────────────────────────┐
│ Students                         │
│                                  │
│ ┌────────────────────────────┐  │
│ │ 🔍 Search name/email/num  │  │
│ └────────────────────────────┘  │
│                                  │
│ [All] [BSIT] [BSCS] [1st][2nd] │ ← Program + year filter chips
│                                  │
│ ┌────────────────────────────┐  │
│ │ [AV] Juan Dela Cruz        │  │
│ │ XX-1111 • BSIT 3rd Year    │  │
│ │ [Active]               →  │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ [AV] Maria Santos          │  │
│ │ XX-1112 • BSCS 2nd Year    │  │
│ │ [Active]               →  │  │
│ └────────────────────────────┘  │
└──────────────────────────────────┘

Student Detail:
┌──────────────────────────────────┐
│ ← Juan Dela Cruz                 │
│                                  │
│ ┌─ Profile ────────────────────┐ │
│ │ [Large Avatar with initials] │ │
│ │ Juan Dela Cruz               │ │
│ │ XX-1111                      │ │
│ │ juan@cict.edu                │ │
│ │ +63 912 345 6789             │ │
│ │ 123 Main St, Manila          │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Academic ───────────────────┐ │
│ │ Program:     BSIT            │ │
│ │ Year Level:  3rd Year        │ │
│ │ Section:     IT-3A           │ │
│ │ Enrolled:    Aug 2024        │ │
│ │ Est. Grad:   2028            │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Account ────────────────────┐ │
│ │ Status:  [Active]            │ │
│ │ QR Ver:  3                   │ │
│ │ Last Login: Jun 14, 10:30 AM │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Activate/Deactivate] (toggle)  │
└──────────────────────────────────┘
```

**Data sources:**
- `GET /students?q=&program=&yearLevel=&status=` — searchable, filterable list
- `GET /students/:id` — detail
- `PATCH /students/:id/status` — activate/deactivate

**States:** List: Loading → Empty ("No students found") → Data. Detail: Loading → Error → Data.

---

### 5.8 Organizations Tab (`organizations/index.tsx` + `organizations/[id].tsx`)

**Purpose:** Browse orgs, view overview, manage tasks/meetings/voting.

```
Org List:
┌──────────────────────────────────┐
│ Organizations                    │
│                                  │
│ [All] [Academic] [Cultural]     │ ← Type filter chips
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [Banner]                     │ │
│ │ [Logo] Tech Org              │ │
│ │ [Academic] [Active]          │ │
│ │ A student org for tech...    │ │
│ │                    [Manage]  │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘

Org Detail:
┌──────────────────────────────────┐
│ ← Tech Organization              │
│                                  │
│ ┌─ Info ───────────────────────┐ │
│ │ [Logo] Tech Org              │ │
│ │ Academic • Active • Est.2020 │ │
│ │ tech@cict.edu • +63...       │ │
│ │ Building A, Room 101         │ │
│ │ Advisor: Prof. Cruz          │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Stats ──────────────────────┐ │
│ │ 24 Members  3 Pending        │ │
│ │ 5 Tasks     1 Overdue        │ │
│ │ 2 Meetings  1 Active Vote    │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Overview] [Tasks][Meetings]    │ ← Sub-tabs
│ [Voting] [Members]              │
│                                  │
│ Overview tab:                    │
│ ┌ Pending Items ──────────────┐ │
│ │ • 3 membership applications │ │
│ │ • 2 overdue tasks           │ │
│ └──────────────────────────────┘ │
│ ┌ Recent Activity ────────────┐ │
│ │ Maria joined (2h ago)       │ │
│ │ Pedro resigned (1d ago)     │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Sub-tabs:**

| Tab | Content | Actions |
|---|---|---|
| **Overview** | Stats + pending items + recent activity | Read-only |
| **Tasks** | Kanban: Todo / In Progress / Done | Tap to create, toggle status |
| **Meetings** | Upcoming/past card grid | Create, edit, RSVP toggle |
| **Voting** | Election cards (title, dates, status, candidates) | Create, view results |
| **Members** | Member list (name, position, status) | Read-only |

**Data sources:**
- `GET /admin/organizations` — list
- `GET /organizations/:id/admin-detail` — detail + stats
- `GET /organizations/:id/tasks`, `/meetings`, `/votes`
- `POST /organizations/:id/tasks`, `/meetings`, `/votes`

---

### 5.9 Content Quick Actions (`content/index.tsx` + `content/[id].tsx`)

**Purpose:** Combined news + announcements list with workflow actions (approve, publish, archive). NOT full editing.

```
Content List:
┌──────────────────────────────────┐
│ Content                          │
│                                  │
│ [News] [Announcements] [All]    │ ← Type filter
│ [Pending] [Published] [Draft]   │ ← Status filter
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [News] "New Lab Building"    │ │
│ │ DRAFT • Juan Dela Cruz       │ │
│ │ Created 2 days ago           │ │
│ │ [Submit]               [→]  │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ [Ann.] "Exam Schedule"      │ │
│ │ PENDING • Maria Santos      │ │
│ │ Created 1 day ago           │ │
│ │ [Approve] [Reject]    [→]   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ [News] "Research Week"      │ │
│ │ APPROVED • Pedro Reyes      │ │
│ │ Created 3 hours ago         │ │
│ │ [Publish]             [→]   │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Workflow buttons (context-sensitive):**

| Status | Available Actions |
|---|---|
| DRAFT | Submit for Approval |
| PENDING_APPROVAL | Approve, Reject |
| APPROVED | Publish |
| PUBLISHED | Archive |

**Content Detail** (`content/[id].tsx`):
```
┌──────────────────────────────────┐
│ ← Back    "New Lab Building"     │
│                                  │
│ Status: [DRAFT]                  │
│ Type: News • By Juan Dela Cruz  │
│ Created: Jun 12, 2026           │
│                                  │
│ [Cover Image]                   │
│                                  │
│ Body content rendered here...    │
│ (simplified, stripHtml)         │
│                                  │
│ ┌─ Workflow ───────────────────┐ │
│ │ [Submit for Approval]        │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Data sources:**
- `GET /news?status=&ownerType=` — paginated news
- `GET /announcements?status=` — paginated announcements
- `PATCH /news/:id/submit`, `/approve`, `/reject`, `/publish`, `/archive`
- `PATCH /announcements/:id/submit`, `/approve`, `/reject`, `/publish`, `/archive`

---

### 5.10 Calendar — Upcoming View (`calendar/index.tsx`)

**Purpose:** Next 7 days of events, meetings, tasks. NOT the month grid.

```
┌──────────────────────────────────┐
│ Upcoming                          │
│ Next 7 Days                      │
│                                  │
│ ┌─ Today, Jun 14 ──────────────┐ │
│ │ 9:00 AM   Tech Conference    │ │
│ │           [Event] Auditorium │ │
│ │ 2:00 PM   Org Team Meeting   │ │
│ │           [Meeting] Room 201 │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Tomorrow, Jun 15 ───────────┐ │
│ │ 10:00 AM  Voting Closes      │ │
│ │           [Vote] Tech Pres.  │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Jun 16 ─────────────────────┐ │
│ │ All Day    Task: Submit Rep. │ │
│ │           [Task] Overdue!    │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Color coding per source type:**
- Event: Blue dot
- Meeting: Emerald dot
- Task: Amber dot
- Vote: Purple dot

**Data source:** `GET /calendar/feed?startDate=&endDate=` (next 7 days)

---

### 5.11 Settings Screen (`settings.tsx`)

```
┌──────────────────────────────────┐
│ Settings                          │
│                                  │
│ ┌─ Profile ────────────────────┐ │
│ │ [Avatar]  Juan Dela Cruz     │ │
│ │           juan@cict.edu      │ │
│ │           Full Admin          │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Your Permissions ───────────┐ │
│ │ ✓ Scan Event Attendance      │ │
│ │ ✓ View Event Registrations   │ │
│ │ ✓ Approve Content            │ │
│ │ 🔒 Create Events             │ │
│ │   (you don't have this)      │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Quick Actions ──────────────┐ │
│ │ Push Notifications [toggle]  │ │
│ │ Scan Sounds      [toggle]    │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Appearance ─────────────────┐ │
│ │ Dark Mode         [toggle]   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Account ────────────────────┐ │
│ │ [Sign Out] (danger button)   │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## 6. Scanner Core Design

Identical to original plan (sections 5.1–5.4). QR JWT format, scan flow sequence diagram, camera permissions, manual entry fallback, scan result overlay with all 8 result variants, sound effects.

---

## 7. Notification System

### 7.1 Scan Results (In-App)

Immediate overlay + haptic + sound. No persistence. Ephemeral.

### 7.2 Push Notifications (System Alerts)

| Type | Trigger | Payload |
|---|---|---|
| `capacity_warning` | Registration hits 80%, 90% capacity | `{ eventId, title, percent }` |
| `approval_requested` | Someone submits content for approval | `{ type, id, title, submittedBy }` |
| `scanner_alert` | Abnormal scan patterns | `{ eventId, message }` |

Registers via `expo-notifications`. Backend's `sendToOrganizationAdmins()` needs implementation (currently a placeholder — minor backend update).

---

## 8. Data Flow Diagrams

### 8.1 Authentication Flow

(See original plan section 7.1 — identical flow, different endpoints)

### 8.2 Scan Attendance Flow

(See original plan section 7.2 — identical)

### 8.3 Approvals Flow

```
┌───────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
│ Approvals │     │  Mutation  │     │   API    │     │ Backend  │
│  Screen   │     │            │     │  Client  │     │          │
└─────┬─────┘     └─────┬──────┘     └────┬─────┘     └────┬─────┘
      │                 │                  │              │
      │ Load pending    │                  │              │
      │────────────────▶│                  │              │
      │                 │  GET /admin/     │              │
      │                 │  approvals/      │              │
      │                 │  pending         │              │
      │                 │─────────────────▶│              │
      │                 │                  │─────────────▶│
      │                 │                  │              │
      │                 │   200 [{type,    │              │
      │                 │   id, title,     │              │
      │                 │   submittedBy}]  │              │
      │                 │◀─────────────────│              │
      │                 │                  │              │
      │ Show queue      │                  │              │
      │◀────────────────│                  │              │
      │                 │                  │              │
      │ Tap Approve     │                  │              │
      │────────────────▶│                  │              │
      │                 │  mutateAsync(    │              │
      │                 │   { id, type })  │              │
      │                 │─────────────────▶│              │
      │                 │                  │ PATCH /:type │
      │                 │                  │ /:id/approve │
      │                 │                  │─────────────▶│
      │                 │                  │              │
      │                 │  200 { success } │              │
      │                 │◀─────────────────│              │
      │                 │                  │              │
      │ Remove from     │                  │              │
      │ queue + toast   │                  │              │
      │◀────────────────│                  │              │
```

---

## 9. Implementation Phases

### Phase 1: Foundation (~5h)

| Step | Task |
|---|---|
| 1.1 | Create `apps/admin-mobile/` with all config files |
| 1.2 | Set up workspace, root scripts (`admin-mobile:dev`, `:typecheck`, `:test`, `:lint`) |
| 1.3 | Copy theme from student app |
| 1.4 | Copy UI primitives (AppScreen, AppCard, AppButton, AppTextInput, SectionHeader, StatusPill) |
| 1.5 | Copy feedback components (LoadingState, ErrorState, EmptyState, ConnectivityNotice) |
| 1.6 | Copy utilities (format.ts, haptics.ts, error.ts) |
| 1.7 | Create AppProviders.tsx (SafeArea → Theme → QueryClient) |
| 1.8 | Create root layout + auth gate |
| 1.9 | Create admin API client (Axios → /api, JWT interceptor, refresh at /auth/refresh) |
| 1.10 | Create auth store (Zustand, SecureStore) |
| 1.11 | Create auth API service (login, logout, me, refresh) |
| 1.12 | Create auth bootstrap hook + login mutation + logout |
| 1.13 | Create login screen |
| 1.14 | Create 7-tab layout |
| 1.15 | Install `react-native-reanimated`, `moti`, `react-native-gesture-handler`, `expo-blur` |
| 1.16 | Configure `babel.config.js` with `react-native-reanimated/plugin` (last entry) |
| 1.17 | Wrap root layout with `<GestureHandlerRootView>` |
| 1.18 | Typecheck verification |

---

### Phase 2: Scanner Core (~5h)

| Step | Task |
|---|---|
| 2.1 | Install `expo-camera` |
| 2.2 | Create admin events API service |
| 2.3 | Create scan mutation hook |
| 2.4 | Create undo check-in hook |
| 2.5 | Create recent scans query |
| 2.6 | Create admin events query |
| 2.7 | Create scanner index (event selector) |
| 2.8 | Create QrCameraView (CameraView + barcode detection + animated pulsing corner brackets via Reanimated `withRepeat`/`withSequence`) |
| 2.9 | Create ManualEntryInput |
| 2.10 | Create ScanResultOverlay — 8 result types, `MotiView` spring entrance (scale 0.6→1, opacity 0→1), auto-dismiss via `withDelay`, result-specific color + icon + sound |
| 2.11 | Add success ring animation: expanding green circle from QR center (`withTiming` scale 0→2, opacity 1→0) |
| 2.12 | Add error shake animation: horizontal `withSequence` translateX on failure results |
| 2.13 | Add `@gorhom/bottom-sheet` integration for scan result detail panel (student info, registration status, timestamp) |
| 2.14 | Create RecentCheckIns with undo |
| 2.15 | Assemble scanner screen — camera + manual + animated corner brackets + bottom sheet |
| 2.16 | Wire haptics to all 8 scan result types (success/error/warning per result) |
| 2.17 | End-to-end manual test: scan QR → spring overlay → dismiss → scan again |

---

### Phase 3: Event Management (~4h)

| Step | Task |
|---|---|
| 3.1 | Create event detail query |
| 3.2 | Create registrations list + search |
| 3.3 | Create attendance logs (paginated, filterable) |
| 3.4 | Create EventCard (admin variant with capacity bar) |
| 3.5 | Create AttendanceLogCard |
| 3.6 | Events list screen (filters: time + status) |
| 3.7 | Event detail screen (stat cards + info + subtabs) |
| 3.8 | Registrations tab screen |
| 3.9 | Attendance tab screen |

---

### Phase 4: Approvals + Dashboard (~4h)

| Step | Task |
|---|---|
| 4.1 | Create admin approvals API service |
| 4.2 | Create usePendingApprovals, useApproveContent, useRejectContent |
| 4.3 | Create ApprovalCard + MembershipCard |
| 4.4 | Create RejectDialog (reason text modal) |
| 4.5 | Create approvals screen |
| 4.6 | Create dashboard API service |
| 4.7 | Create useDashboardSummary |
| 4.8 | Create dashboard screen (metric cards + today's events + pending) |

---

### Phase 5: Students + Orgs + Content (~6h)

| Step | Task |
|---|---|
| 5.1 | Create admin students API service |
| 5.2 | Create useStudentSearch, useStudentDetail, useToggleStudentStatus |
| 5.3 | Create StudentCard + StudentProfileCard |
| 5.4 | Create students list screen (search + program/year filters) |
| 5.5 | Create student detail screen |
| 5.6 | Create admin organizations API service |
| 5.7 | Create useOrganizations, useOrganizationDetail |
| 5.8 | Create OrgCard + OrgOverview |
| 5.9 | Create orgs list screen |
| 5.10 | Create org detail with sub-tabs (Overview/Tasks/Meetings/Voting/Members) |
| 5.11 | Create org tasks, meetings, voting API services + hooks |
| 5.12 | Create admin content API service |
| 5.13 | Create useContentList, useContentDetail, usePublishContent, useArchiveContent |
| 5.14 | Create content list screen (combined news + announcements) |
| 5.15 | Create content detail screen |

---

### Phase 6: Calendar + Settings + Polish + Animations (~5h)

| Step | Task |
|---|---|
| 6.1 | Create admin calendar API service |
| 6.2 | Create useUpcomingEvents |
| 6.3 | Create upcoming calendar screen (7-day list) |
| 6.4 | Install `expo-av` for scan sounds |
| 6.5 | Add scan sound effects + haptics |
| 6.6 | Create settings screen (profile, permissions, toggles, logout) |
| 6.7 | Add push notification registration |
| 6.8 | Create `AppSkeleton.tsx` — shimmer loading skeleton matching card/row layouts |
| 6.9 | Create `AppSwitch.tsx` — spring-animated toggle with knob slide + color interpolation + haptic |
| 6.10 | Create `AnimatedCard.tsx` — `MotiView` wrapper with staggered fade-up entrance (`delay = index * 80ms`) |
| 6.11 | Create `TabBarIcon.tsx` — spring bounce animation on active tab + `hapticLight()` |
| 6.12 | Replace `LoadingState` on all list screens with `AppSkeleton` |
| 6.13 | Replace static `AppCard` list renders with `AnimatedCard` |
| 6.14 | Wire haptics to all tab bar presses, toggle switches, scan results |
| 6.15 | Add entrance animations (scanner overlay spring entrance, result card spring slide-up) |
| 6.16 | Add camera lifecycle management (pause/resume on nav) |
| 6.17 | Add empty states for all screens |
| 6.18 | Add pull-to-refresh on all lists |
| 6.19 | Write tests for core hooks (auth, scan, approvals) |
| 6.20 | Write tests for components (scan result overlay, manual entry, reject dialog, animated components) |
| 6.21 | E2E manual testing — verify all animations smooth, no dropped frames |

---

## Phase Summary

| Phase | Hours | Deliverable |
|---|---|---|
| 1: Foundation | 5 | Auth, theme, layout, typecheck, install Reanimated/Moti/GestureHandler + config |
| 2: Scanner | 5 | Camera, animated scan overlay, spring results, corner bracket pulse, bottom sheet |
| 3: Events | 4 | List, detail, registrations, attendance |
| 4: Approvals + Dashboard | 4 | Content + membership approvals, summary |
| 5: Students + Orgs + Content | 6 | Full lookup + org management + quick actions |
| 6: Calendar + Settings + Polish + Animations | 5 | Upcoming view, settings, AppSkeleton, AppSwitch, AnimatedCard, TabBarIcon, haptic wiring |
| **Total** | **~29h** | **Complete admin mobile app with modern animations** |

---

## 10. Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Camera** | `expo-camera` CameraView | Expo SDK 54, built-in barcode detection |
| **QR format** | JWT (same as student app) | Backend verifies with `STUDENT_QR_SECRET` |
| **Auth** | Separate admin auth (User model) | Uses `/auth/login`, different JWT secret, RBAC |
| **State** | Zustand (auth) + TanStack Query (server) | Proven in student app |
| **Offline** | Auth only (scanning needs network) | QR verification is server-side |
| **Sound** | `expo-av` for scan feedback | Lightweight, first-party |
| **Reuse** | Copy theme + UI primitives | Stable, won't drift between apps |
| **No forms** | No rich-text editors on mobile | Desktop stays the creation tool |

### Dependencies to Add

```json
{
  "expo-camera": "~17.0.x",
  "expo-av": "~16.0.x"
}
```

All other deps reused from student app's `package.json`.

---

## 10a. Modern UI & Animation Layer

The admin mobile app must feel modern, fluid, and polished — not just a static form-based tool. This section defines the animation system, gesture support, and visual polish layer.

### Libraries to Install

| Library | Purpose | Priority |
|---|---|---|
| `react-native-reanimated` | Industry-standard: spring animations, gesture-driven interactions, shared element transitions. Replaces the built-in `Animated` API which is limited to basic timing curves. | Must have |
| `moti` | Declarative animation syntax on top of Reanimated. Replaces 20+ lines of `Animated.timing` with `from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'spring' }}` — dramatically simpler. | Must have |
| `react-native-gesture-handler` | Swipe-to-dismiss on attendance log rows, pan gestures on camera viewfinder, drag-to-resize scan zone. Required for any swipe/pan/pinch interaction. | Must have |
| `expo-blur` | Frosted glass overlay behind scan result sheets, blurred camera background behind result overlays. Already an Expo SDK package — zero native config. | Recommended |
| `@gorhom/bottom-sheet` | Slide-up detail panel for scan results without leaving the camera view. Keeps the camera active while showing student info. | Recommended |
| `lottie-react-native` | Confetti burst on successful scan, animated loading mascots, celebration effects. Adds ~3MB but high delight factor. | Optional |

### Config Changes

```
babel.config.js:
  plugins: ['react-native-reanimated/plugin']    ← MUST be last in the plugins array

app/_layout.tsx:
  replace outermost <View> with <GestureHandlerRootView> from react-native-gesture-handler
```

### New Components to Create

| Component | What It Does | Library |
|---|---|---|
| `AppSkeleton.tsx` | Animated shimmer skeleton matching card layouts (title bar + 3 body lines + image block). Replaces `ActivityIndicator` spinners with content-shaped placeholders. | Reanimated + `linearGradient` |
| `AppSwitch.tsx` | Spring-animated toggle switch. Knob slides with `withTiming`, track color interpolates between muted and primary. Triggers `hapticLight()` on toggle. | Reanimated |
| `AnimatedCard.tsx` | Wraps `AppCard` with staggered fade-up entrance animation. `from={{ opacity: 0, translateY: 20 }}` `animate={{ opacity: 1, translateY: 0 }}` with `transition={{ delay: index * 80 }}` on each card in a list. | Moti + Reanimated |
| `TabBarIcon.tsx` | Animated tab bar icons. Active tab scales 0.85→1.15→1.0 with spring physics. Triggers `hapticLight()` on press. Inactive tabs maintain static size. | Reanimated |

### Animation Spec for Every Key Moment

| Moment | Visual | Technique | Duration | Haptic |
|---|---|---|---|---|
| **QR scan success** | Green ring expands from center of QR (scale 0→2, opacity 1→0). Checkmark scales in with spring bounce. | `MotiView` with `from={{ scale: 0 }} animate={{ scale: 1 }}` + `withTiming` on ring overlay | 600ms spring | `hapticSuccess()` |
| **QR scan error** | Red overlay shakes horizontally (translateX 0→-10→10→-5→5→0). | `withSequence([withTiming(-10), withTiming(10), withTiming(-5), withTiming(5), withTiming(0)])` | 400ms | `hapticError()` |
| **QR scan duplicate** | Blue ring pulse (scale 1→1.15→1), icon bounces twice. | `withRepeat(withSequence(withTiming(1.15, 100), withTiming(1, 100)), 2)` | 500ms | `hapticWarning()` |
| **Result overlay entrance** | Card slides up + fades in from bottom. | `MotiView` `from={{ opacity: 0, translateY: 100 }}` `animate={{ opacity: 1, translateY: 0 }}` `transition={{ type: 'spring', damping: 20 }}` | 400ms spring | — |
| **List card entrance** | Cards fade up one by one. First card at 0ms, second at 80ms, third at 160ms, etc. | `MotiView` `transition={{ delay: index * 80 }}` `from={{ opacity: 0, translateY: 20 }}` | 350ms each | — |
| **Tab switch** | Active tab icon scales down then bounces up. | `withSpring(0.85)` then `withSpring(1)` with `damping: 8` | 250ms spring | `hapticLight()` |
| **Toggle switch** | Knob slides left↔right, track color fades between `colors.textMuted` and `colors.primary`. | `useAnimatedStyle` with `translateX: withTiming(isOn ? 20 : 0)` | 200ms ease | `hapticLight()` |
| **Approve button** | Green fill pulses, checkmark scale-in. | `withSpring` on checkmark `scale` from 0→1 | 400ms spring | `hapticSuccess()` |
| **Reject button** | Red fill, icon horizontal shake. | `withSequence(withTiming(-5), withTiming(5), withTiming(0))` | 400ms | `hapticError()` |
| **Scanner ready** | Four corner brackets pulse opacity 0.4↔1.0 to indicate camera is live. | `withRepeat(withSequence(withTiming(1, 800), withTiming(0.4, 800)), -1)` | 1.6s loop | — |

### Migration: From Static → Animated

| Current Pattern | Replace With | Why |
|---|---|---|
| `LoadingState` (spinner + text) | `AppSkeleton` (shimmer cards) | Communicates actual content shape. Users feel the page is loading content, not just "waiting." |
| Static `AppCard` in FlatList | `AnimatedCard` with staggered `index * 80ms` delay | Lists feel alive on initial load. Each card glides up with a subtle cascade effect. |
| Static tab bar icons | `TabBarIcon` with spring bounce | Tactile feedback on navigation. The spring bounce makes the tab feel "clicked" vs. simply appearing. |
| Plain opacity-only overlay | `MotiView` spring entrance + `expo-blur` backdrop | The result overlay feels like a physical object springing into view, not just appearing. |
| Opacity-only button press | Spring scale 0.96 + opacity | Buttons feel compressible — like a real physical button being pressed. |
| Plain camera view | Animated corner brackets pulsing | Signals to the user that the camera is active and scanning. The pulse draws attention to the scan zone. |

### Reuse Existing Design System

The student app already has a mature design system the admin app inherits completely:

| Asset | Source | Admin App Usage |
|---|---|---|
| Brand gradient `#6E29F6 → #4A1BB5 → #2E0F8A` | `LinearGradient` pattern across login, home hero, QR ticket | Login hero banner, scanner header bar, result overlay accents |
| Purple-tinted shadows (`#2F165F` base) | `AppCard` variants — `default`/`elevated`/`glass` | All card components inherit these automatically |
| 6 haptic feedback presets | `utils/haptics.ts` — success, error, warning, light, medium, heavy | Every scan result, tab press, toggle switch, approve/reject action |
| `StatusPill` with 5 semantic tones | `components/ui/StatusPill.tsx` | Scan result badges, registration status, approval status, event status |
| Full dark mode color palette | `theme/tokens.ts` with SecureStore persistence | Entire app — all components use `colors` tokens, no additional work needed |
| 8px spacing rhythm | `tokens.ts` — xs:8 / sm:12 / md:16 / lg:20 / xl:24 / xxl:32 | All new screens follow this automatically |
| Radius system | `radii.md:12` (controls), `radii.lg:16` (cards), `radii.xl:24` (hero), `radii.pill:999` (badges) | All new components match |

---

## 10b. Authentication & Session Flow

The admin mobile app uses a self-contained email + password login, identical in simplicity to the student app. No MFA, no captcha. One screen, two fields, done.

### Login Screen

```
┌──────────────────────────────────┐
│  LinearGradient #6E29F6 → #2E0F8A │
│           (diagonal)              │
│    CICT (Blockletter, 48px)      │
│    Admin Console                  │
│    Manage events and attendance.  │
├──────────────────────────────────┤
│  Sign In                          │
│  Enter your admin credentials.    │
│  ┌────────────────────────────┐  │
│  │ Email                       │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Password              [eye]│  │
│  └────────────────────────────┘  │
│  [Error: (API error message)]    │
│  ┌────────────────────────────┐  │
│  │        Sign In             │  │
│  └────────────────────────────┘  │
│  Forgot password?               │
└──────────────────────────────────┘
```

Validation: Zod schema — email `min(3)`, password `min(6)`, inline errors under each field.

### Backend Contracts

| Step | Method | Endpoint | Request | Response |
|---|---|---|---|---|
| Login | POST | `/api/auth/login` | `{ email, password }` | `{ data: { accessToken, refreshToken, user, permissions } }` |
| Validate | GET | `/api/auth/profile` | Bearer header | `{ data: { user, permissions } }` |
| Refresh | POST | `/api/auth/refresh` | `{ refreshToken }` | `{ data: { accessToken, refreshToken, user } }` |
| Logout | POST | `/api/auth/logout` | `{ refreshToken }` | `{ success }` |

### Complete Flow (App Launch → Authenticated)

```
┌──────────────────────────────────────────────────────────────────┐
│                        APP LAUNCH                                 │
│                            │                                      │
│              useAuthBootstrap() checks SecureStore               │
│                     ╱              ╲                              │
│              Tokens found?    No tokens?                         │
│                 │                    │                            │
│          GET /auth/profile    clearSession()                     │
│             ╱      ╲              │                              │
│        Valid?   Invalid?     status = 'anonymous'               │
│          │         │              │                              │
│    setSession()  clearSession()  │                              │
│          │         │              │                              │
│    status =       │              │                              │
│    'authenticated'│              │                              │
│          │         │              │                              │
│          ├─────────┴──────────────┘                              │
│          │                                                        │
│          ▼                                                        │
│   Auth gate: if accessToken → /(app)/dashboard                   │
│              if !accessToken → /(auth)/login                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     LOGIN SCREEN                                  │
│                            │                                      │
│              useLoginMutation({ email, password })                │
│                            │                                      │
│                   POST /auth/login                                │
│                            │                                      │
│                 200 { accessToken, refreshToken, user }           │
│                            │                                      │
│              setSession() saves to SecureStore + Zustand          │
│                            │                                      │
│              router.replace('/(app)/dashboard')                  │
│                            │                                      │
│                            ▼                                      │
│              7-tab layout (authenticated state)                   │
└──────────────────────────────────────────────────────────────────┘
```

### Token Storage

| Token | Key | Storage | Expiry |
|---|---|---|---|
| Access | `cict_admin_access_token` | `expo-secure-store` (hardware-backed on iOS, encrypted on Android) | 7 days |
| Refresh | `cict_admin_refresh_token` | `expo-secure-store` (hardware-backed) | 30 days |
| User | Zustand `auth-store.ts` | In-memory only | Session |
| Status | Zustand `auth-store.ts` | In-memory only (`hydrating` \| `anonymous` \| `authenticated`) | Session |

### Auth States

| State | What User Sees |
|---|---|
| **Hydrating** | `LoadingState label="Restoring your session..."` — app checks SecureStore for saved tokens |
| **Anonymous** | Login screen — purple gradient, email + password fields, "Forgot password?" link |
| **Authenticated** | 7-tab layout — Dashboard, Scanner, Events, Approvals, Students, Orgs, Settings |
| **401 mid-session** | Silent: Axios interceptor calls `POST /auth/refresh` with refresh token, retries request. User sees no interruption. |
| **Refresh fails** | Silent: `clearSession()` removes tokens, status becomes anonymous, auth gate redirects to login. |

### State Machine

```
hydrating ──(tokens valid)──→ authenticated ──(logout)──→ anonymous
    │                            │
    │  (no tokens)               │  (every request)
    │                            │
    └────→ anonymous ──(login)──→ authenticated
                                    │
                              On 401: POST /auth/refresh
                              On refresh fail: clearSession()
```

### Key Difference: Student vs Admin Auth

| Aspect | Student App | Admin App |
|---|---|---|
| **Login field** | Student Number or Email | Email only |
| **Auth endpoint** | `POST /student/auth/login` | `POST /auth/login` |
| **JWT secret** | `STUDENT_JWT_SECRET` | `JWT_SECRET` |
| **User model** | `Student` (studentNumber, program, year) | `User` (email, role, 61 permissions) |
| **Permissions** | None (flat) | RBAC granular |
| **SecureStore keys** | `cict_mobile_access_token` / `cict_mobile_refresh_token` | `cict_admin_access_token` / `cict_admin_refresh_token` |

---

## 11. UI/UX Design Principles

### Brand Colors

```
Primary:    #6E29F6  (purple)    — headers, primary buttons, active states
Secondary:  #F629A8  (pink)      — supporting highlights
Accent:     #29F6D2  (teal)      — success, accent moments
Success:    #10B981  (green)     — check-in success
Warning:    #F59E0B  (amber)     — duplicate
Danger:     #EF4444  (red)       — invalid QR, errors
Info:       #6366F1  (indigo)    — info states
```

### Scanner UX Rules

- Camera is primary — auto-start when event selected
- Manual is always visible below camera
- Results must be unmistakable: green = success, red = error, amber = warning
- Icons + color + text for color-blind accessibility
- Auto-dismiss non-success results after 3s
- Sound must be optional (mute toggle in settings)
- All touch targets ≥ 44x44pt

### Responsive Adaptation

- Card stacks instead of tables everywhere
- Filter chips horizontally scrollable
- Detail screens use vertical scroll (no sidebars)
- 2-column metric grid on phones, auto-single on smaller screens

---

## 12. Security Considerations

| Concern | Mitigation |
|---|---|
| **QR replay** | Backend validates `qrNonce` — used nonces rejected |
| **QR expiration** | Backend checks `qrVersion` against student profile |
| **JWT forgery** | QR signed with `STUDENT_QR_SECRET`, `actorType: 'student_qr'` enforced |
| **Token theft** | SecureStore (hardware-backed on iOS, encrypted on Android) |
| **Permission escalation** | API enforces `authorize(Permission.SCAN_EVENT_ATTENDANCE)` |
| **Data exposure** | Org-scoped permissions enforced server-side |
| **Unattended device** | Auth token expires; re-login required |

---

## 13. Testing Strategy

### Unit Tests

| Module | What to Test |
|---|---|
| Auth | Login success/failure, token refresh, session restore |
| Scanner | Scan mutation, undo mutation, result overlay renders all 8 types |
| Approvals | Approve/reject mutation, reject dialog validation |
| Students | Search API, detail, status toggle |
| Orgs | List, detail, sub-tab queries |

### Integration Tests

| Scenario |
|---|
| Login → Dashboard → see metrics → tap event → scanner → scan → see result → undo |
| Login → Approvals → tap approve → removed from queue → toast success |
| Login → Students → search → tap → see detail → toggle status |
| Login → Orgs → browse → tap → see overview → tap Tasks → create task |
| Login → Content → filter by pending → tap approve |

### Manual Checklist

| Check |
|---|
| Camera initializes within 3s |
| QR scan decodes within 1s |
| Success overlay green, error red, duplicate blue |
| Auto-dismiss works for errors |
| Undo reverted in recent check-ins |
| Manual entry accepts XX-1111 format |
| Pull-to-refresh on all lists |
| Dark mode readable on every screen |
| Empty states display when no data |
| Offline shows ConnectivityNotice banner |

---

## 14. Appendix: API Reference

### Auth

```
POST /api/auth/login          { email, password }       → { accessToken, refreshToken, user }
POST /api/auth/refresh        { refreshToken }          → { accessToken, refreshToken, user }
POST /api/auth/logout         { refreshToken? }         → { success }
GET  /api/auth/profile        Bearer <token>             → { user }
```

### Dashboard

```
GET  /api/admin/dashboard/summary                       → { users, students, news, announcements, orgs, events, roles }
```

### Events

```
GET  /api/events                          ?status=&ownerType=&orgId=  → { events[], pagination }
GET  /api/events/:id                                                → { event, relatedNews, relatedAnnouncements }
GET  /api/admin/events/:id/registrations                            → { registrations[], stats }
GET  /api/admin/events/:id/registrations/search?q=                  → { registrations[] }
POST /api/admin/events/:id/registrations      { studentNumber }     → { registration }
POST /api/admin/events/:id/registrations/:regId/undo-checkin        → { registration }
GET  /api/admin/events/:id/attendance/logs    ?page=&result=&q=     → { logs[], summary, pagination }
POST /api/admin/events/:id/attendance/scan    { qrToken|studentNumber } → { result, studentName?, registration? }
```

### Approvals

```
GET  /api/admin/approvals/pending     ?type=event|news|announcement   → { queue[] }
GET  /api/admin/approvals/stats                                       → { counts }
POST /api/admin/events/:id/approve                                    → { success }
POST /api/admin/events/:id/reject    { reason }                       → { success }
POST /api/admin/news/:id/approve                                      → { success }
POST /api/admin/news/:id/reject     { reason }                        → { success }
POST /api/admin/announcements/:id/approve                             → { success }
POST /api/admin/announcements/:id/reject { reason }                   → { success }
```

### Students

```
GET  /api/admin/students    ?q=&program=&yearLevel=&status=&page=    → { students[], pagination }
GET  /api/admin/students/:id                                          → { student }
PATCH /api/admin/students/:id/status  { status }                     → { student }
```

### Organizations

```
GET  /api/admin/organizations       ?type=                             → { organizations[] }
GET  /api/organizations/:id/admin-detail                               → { organization, stats }
GET  /api/organizations/:id/tasks                                      → { tasks[] }
POST /api/organizations/:id/tasks   { title, description, status }    → { task }
GET  /api/organizations/:id/meetings                                   → { meetings[] }
POST /api/organizations/:id/meetings { title, date, ... }             → { meeting }
GET  /api/organizations/:id/votes                                      → { votes[] }
POST /api/organizations/:id/votes   { title, positions, ... }         → { vote }
```

### Content (News + Announcements)

```
GET  /api/admin/news              ?status=&ownerType=                 → { news[], pagination }
GET  /api/admin/news/:id                                              → { news }
PATCH /api/admin/news/:id/submit                                      → { news }
PATCH /api/admin/news/:id/approve                                     → { news }
PATCH /api/admin/news/:id/reject    { reason }                       → { news }
PATCH /api/admin/news/:id/publish                                     → { news }
PATCH /api/admin/news/:id/archive                                     → { news }
GET  /api/admin/announcements       ?status=                          → { announcements[], pagination }
GET  /api/admin/announcements/:id                                     → { announcement }
PATCH /api/admin/announcements/:id/submit                              → { announcement }
PATCH /api/admin/announcements/:id/approve                             → { announcement }
PATCH /api/admin/announcements/:id/reject { reason }                  → { announcement }
PATCH /api/admin/announcements/:id/publish                             → { announcement }
PATCH /api/admin/announcements/:id/archive                             → { announcement }
```

### Calendar

```
GET  /api/calendar/feed   ?startDate=&endDate=   → { items[]: { title, startsAt, endsAt, sourceType, href } }
```

### Membership Applications (via Organization Membership)

```
GET  /api/admin/approvals/pending?type=membership                    → { applications[] }
POST /api/organizations/:orgId/memberships/:id/approve                → { membership }
POST /api/organizations/:orgId/memberships/:id/reject                 → { membership }
```

---

**Total estimated effort: ~29 hours. Zero backend changes.**

*End of plan.*
