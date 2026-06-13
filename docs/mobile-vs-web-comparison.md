# CICT Mobile vs Web Feature Comparison

Last updated: 2026-06-10

## Purpose

This document compares the CICT mobile app (`apps/mobile`) against the web app (`apps/web`) to identify what student features exist on the web but are missing on mobile, catalog what mobile already does better, and provide clean implementation plans for closing the gaps.

Mobile is intentionally scoped to **student-only** features. The full admin CMS (news/events/announcements CRUD, org management, analytics, settings, user management, process engine, etc.) lives only on the web and is not planned for mobile.

---

## Table of Contents

1. [Feature Status Matrix](#1-feature-status-matrix)
2. [Mobile Strengths (Already Done)](#2-mobile-strengths-already-done)
3. [Quick Wins — Built But Not Wired](#3-quick-wins--built-but-not-wired)
4. [Real Gaps — Truly Missing in Mobile](#4-real-gaps--truly-missing-in-mobile)
5. [Admin Features (Out of Scope for Mobile)](#5-admin-features-out-of-scope-for-mobile)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Detailed Implementation Plans](#7-detailed-implementation-plans)
   - [7.1 My Registrations Screen](#71-my-registrations-screen)
   - [7.2 Apply to Organizations (Wire Existing Hooks)](#72-apply-to-organizations-wire-existing-hooks)
   - [7.3 My Memberships Screen (Use Existing Hooks)](#73-my-memberships-screen-use-existing-hooks)
   - [7.4 Attendance History Search & Filter](#74-attendance-history-search--filter)
   - [7.5 Richer Event Detail (Speakers, Fee, Tags, Contact)](#75-richer-event-detail-speakers-fee-tags-contact)
   - [7.6 Full Student Profile (Phone, Address, Memberships)](#76-full-student-profile-phone-address-memberships)
   - [7.7 Org Voting (Wire Existing Hooks)](#77-org-voting-wire-existing-hooks)
8. [Architecture & Conventions](#8-architecture--conventions)
9. [Quick Reference: Key Files to Modify](#9-quick-reference-key-files-to-modify)

---

## 1. Feature Status Matrix

| Feature | Web | Mobile | Notes |
|---|---|---|---|
| **Student Login** | ✅ | ✅ | Mobile also supports email login |
| **Event List (eligible)** | ✅ | ✅ + search | |
| **Event Detail** | ✅ | ✅ + countdown + calendar | Mobile has live countdown & add-to-calendar |
| **Register for Events** | ✅ | ✅ | Mobile also schedules local push reminders |
| **Cancel Registration** | ✅ | ✅ | |
| **QR Pass** | ✅ | ✅ | Mobile has offline QR caching + share as PNG |
| **My Registrations** | ✅ | ✅ | SectionList with Active/Cancelled sections, QR nav, pull-to-refresh |
| **Organizations Browse** | ✅ | ✅ + search | |
| **Organization Detail** | ✅ | ✅ | |
| **Apply to Organizations** | ✅ | ✅ | Wired on org detail screen with apply/leave/pending buttons |
| **My Memberships** | ✅ | ✅ | "My Organizations" section on orgs tab shows joined orgs with resign |
| **Resign from Organization** | ✅ | ✅ | Alert confirmation flow in org detail and My Organizations section |
| **Org Voting** | ✅ | ✅ | Full ballot screen with candidate selection and results |
| **News List** | ✅ | ✅ | Part of Updates hub |
| **News Detail** | ✅ | ✅ | |
| **Announcements List** | ✅ | ✅ | Part of Updates hub |
| **Announcement Detail** | ✅ | ✅ | |
| **Updates Hub (unified feed)** | ✅ | ✅ + filters + widgets | Mobile has category filters, search, featured widgets |
| **Attendance History** | ✅ | ✅ + stats + badges | Mobile has streaks, badges, chart |
| **Attendance Search/Filter** | ✅ | ✅ | Search by event name + filter by scan result type |
| **Student Profile** | ✅ | ✅ (basic) | Mobile missing phone, address, memberships list |
| **Speaker List (event)** | ✅ | ❌ | **REAL GAP** — not shown on mobile event detail |
| **Event Fee/Tags/Contact** | ✅ | ❌ | **REAL GAP** — missing from mobile event detail |
| **Dark Mode** | ❌ | ✅ | Mobile exclusive |
| **Push Notifications** | ❌ | ✅ | Mobile exclusive |
| **Offline Caching** | ❌ | ✅ | Mobile exclusive |
| **Add to Calendar** | ❌ | ✅ | Mobile exclusive |
| **Share Ticket** | ❌ | ✅ | Mobile exclusive |
| **Attendance Badges** | ❌ | ✅ | Mobile exclusive |
| **Connectivity Notice** | ❌ | ✅ | Mobile exclusive |
| **Haptic Feedback** | ❌ | ✅ | Mobile exclusive |

**Legend:** ✅ = shipped | 🟡 = API/hooks exist, needs UI wiring | ❌ = no code exists

---

## 2. Mobile Strengths (Already Done)

These features exist in the mobile app and are **not present** in the web app. They should be preserved and treated as mobile's competitive advantages.

### 2.1 Push Notifications

- Registers Expo push token on first launch
- Receives real-time alerts for news, announcements, check-ins, event reminders
- Notification center with read/unread tracking, mark-as-read, mark-all-as-read
- Full-screen slide-up modal accessible via bell icon with unread badge

**Implementation files:**
- `src/features/notifications/useNotificationSetup.ts`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/notifications/NotificationCenter.tsx`

### 2.2 Local Event Reminders

- When registering for an event, schedules 2 local push notifications: 1 hour before and 15 minutes before start
- Automatically cancelled when registration is cancelled

**Implementation:** Handled inside the registration mutation in `src/features/events/useStudentEvents.ts`

### 2.3 Offline QR Pass

- QR token cached in Expo SecureStore with 7-day TTL
- When offline, falls back to cached QR token so the pass is still displayable
- Critical for real-world check-in reliability

**Implementation files:**
- `src/features/events/useStudentEvent.ts` — fetches and caches QR payload
- `app/(tabs)/events/[id]/qr.tsx` — renders QR with offline fallback

### 2.4 Offline Data Caching

- API responses cached to filesystem with 5-minute TTL
- When network requests fail, cached data is served as fallback
- `CacheIndicator` component shows "Showing cached data" briefly

**Implementation:** Resides in the API client layer (`src/services/api/`)

### 2.5 Add to Calendar

- Generates `.ics` calendar file from event details
- Shares via `expo-sharing` so the user can add to their device calendar

**Implementation file:** `src/components/events/AddToCalendarButton.tsx`

### 2.6 Share Ticket

- Captures the ticket/QR layout as a PNG screenshot via `react-native-view-shot`
- Shares via system share sheet

**Implementation file:** `src/components/events/TicketShareButton.tsx`

### 2.7 Dark Mode

- Full light/dark theme toggle
- Persisted via theme context provider
- Branded purple/pink/teal color scheme in both modes

**Implementation:** Theme context in the providers layer

### 2.8 Attendance Gamification (Badges)

- Badge tiers: Bronze (5 check-ins), Silver (10), Gold (25), Diamond (50)
- Animated haptic feedback on badge level-up
- Progress bar showing progress toward next tier

**Implementation file:** `src/components/attendance/AttendanceBadge.tsx`

### 2.9 Connectivity Notice

- Real-time offline banner at the top of the screen when network is disconnected
- Warns that cached data may be visible but live actions need connection

**Implementation file:** `src/components/feedback/ConnectivityNotice.tsx`

### 2.10 Haptic Feedback

- Haptic vibration on: login success, QR generation, badge level-up, notification bell press

**Implementation:** Wired into various interaction points via `expo-haptics`

---

## 3. Previously-Identified Quick Wins (All Done)

These features were formerly identified as "built but not wired" and are now fully implemented:

| Feature | Status | Implementation |
|---|---|---|
| **Apply to Organizations** | ✅ | Apply/Pending buttons on org detail with confirmation |
| **My Memberships** | ✅ | "My Organizations" section on orgs tab with horizontal cards and resign action |
| **Org Voting** | ✅ | Full ballot screen at `orgs/[id]/votes/[voteId]` with candidate selection and results |

---

## 4. Real Gaps — Truly Missing in Mobile

### 4.1 My Registrations (Priority: High)

**Web behavior:** `/student/registrations` shows two sections:
- **Active registrations** — events where the student is registered or checked in, with links to view QR code
- **Cancelled registrations** — events the student cancelled

**API endpoint:** `GET /student/registrations` (already consumed by mobile for the home metrics card count)

**Mobile status:** The home screen shows the active registration count, but there is no dedicated list view. The user has no way to see all their registrations in one place.

### 4.2 Attendance History Search & Filter (Priority: Medium)

**Web behavior:** `/student/attendance` has a search input (by event name) and a filter dropdown (by scan result type: success, duplicate, not_registered, etc.).

**API endpoint:** `GET /student/attendance/history` (already consumed by mobile)

**Mobile status:** The attendance history is a raw chronological timeline with no search or filtering capability.

### 4.3 Richer Event Detail (Speakers, Fee, Tags, Contact) (Priority: Low)

**Web behavior:** The event detail page shows speakers (with bios), fee, tags/chips, organizer contact information.

**Mobile status:** Mobile event detail shows cover image, title, date, location, status, registration status, countdown, body text, and schedule. Missing: speakers, fee, tags, contact.

**API endpoint:** `GET /events/:id` (already consumed by mobile) — the API likely already returns these fields.

### 4.4 Full Student Profile (Phone, Address, Memberships) (Priority: Low)

**Web behavior:** `/student/profile` shows full profile: name, student number, email, program, year level, section, phone, address, plus a list of memberships with a link to browse more organizations.

**Mobile status:** The settings screen shows name, student number, email, program, year level, section. Missing: phone, address, memberships list.

**API endpoint:** `GET /student/profile` (already consumed by mobile)

---

## 5. Admin Features (Out of Scope for Mobile)

The following web features are intentionally **not planned** for mobile. They are administrative CMS functions:

| Module | What It Does |
|---|---|
| Dashboard | Summary analytics cards |
| News CRUD | Full content lifecycle (draft → submit → approve → publish → archive) |
| Announcements CRUD | Full lifecycle + subtypes, CTAs, officers, awards |
| Events CRUD | Full lifecycle + QR scanner/check-in camera |
| Students CRUD | Add/edit students, academic settings (programs, year levels, sections) |
| Organizations Management | Full management + members, scoped admins |
| Org Analytics | Tasks, events, financial, engagement charts |
| Org Budget | Income/expense tracking, fiscal semesters |
| Org Meetings | Schedule, RSVP, minutes, action items |
| Org Tasks | Kanban board with priorities, assignees, checklists |
| Org Resource Pooling | Cross-org resource requests |
| Org Mentorship | Cross-org mentorship relationships |
| Org Partnerships | Inter-org partnerships |
| Org Collaborations | Cross-org messaging spaces |
| Org Task Forces | Temporary cross-org teams |
| Org Shared Content | Share content between orgs |
| Org Templates | Pre-built structure templates |
| Org Voting/Elections | Create elections, view results |
| Users & Roles | Admin user management + custom roles with granular permissions |
| Process Workflow Engine | Visual flow canvas, template editor, instance executor |
| Approvals Hub | Unified approval queue + membership applications |
| System Settings | General, maintenance, features, academic, security, uploads, notifications, reference data |
| Audit Logs | Full action audit trail with expandable details |
| FAQ Management | Full CRUD for landing page FAQ |

---

## 6. Implementation Roadmap

| Phase | Item | Effort | Type | Value |
|---|---|---|---|---|
| **Done** | My Registrations Screen | ~2 hr | New feature | High |
| **Done** | Apply to Organizations (wire existing hooks) | ~30 min | Quick win | High |
| **Done** | My Memberships / My Orgs section | ~1 hr | Quick win | High |
| **Done** | Notification Bell & Deep Links | ~45 min | Wire existing | Medium |
| **Done** | Attendance History Search & Filter | ~1.5 hr | Enhancement | Medium |
| **Done** | Richer Event Detail (speakers, fee, tags, contact) | ~1 hr | Enhancement | Low |
| **Done** | Full Student Profile (phone, address) | ~30 min | Enhancement | Low |
| **Done** | Fix outdated docs | ~1 hr | Maintenance | Low |

All student-facing gaps between web and mobile are now closed.

---

## 7. Detailed Implementation Plans

### 7.1 My Registrations Screen ✅

**Status:** Done. Screen at `app/(tabs)/events/registrations.tsx` with `SectionList` (Active/Cancelled), status pills, QR navigation, pull-to-refresh. Home metric wired to navigate. Hook at `src/features/registrations/useStudentRegistrations.ts`.

---

### 7.2 Apply to Organizations ✅

**Status:** Done. Apply/Resign mutations wired in `app/(tabs)/orgs/[id].tsx` with membership status display (active/applied/rejected/resigned), confirmation dialogs, and cache invalidation.

---

### 7.3 My Memberships Screen ✅

**Status:** Done. "My Organizations" horizontal scroll section on `app/(tabs)/orgs/index.tsx` shows active + pending memberships with org logo, name, position, member type badge, and resign action with confirmation.

### 7.4 Attendance History Search & Filter ✅

**Status:** Done. Search bar (`AppTextInput`), filter chip row (`StatusPill`), client-side filtering by `eventId.title` and `result`, result count display in `app/(tabs)/settings.tsx`.

### 7.5 Richer Event Detail (Speakers, Fee, Tags, Contact) ✅

**Status:** Done. `app/(tabs)/events/[id].tsx` now shows:
- `speakerItems` — horizontal scroll cards with photo, name, title, organization
- `feeLabel` — registration fee card (text string matching backend)
- `tags` — wrapped `StatusPill` chips
- `contactName`/`contactEmail` — organizer contact card

Adapted to actual backend field names (`speakerItems`, `feeLabel`, `contactName`, `contactEmail`).

---

### 7.6 Full Student Profile (Phone, Address) ✅

**Status:** Done. `phone` and `address` fields added to profile card in `app/(tabs)/settings.tsx` using `SettingRow` component pattern. Memberships are covered by the "My Organizations" section on the Orgs tab.

---

### 7.7 Org Voting ✅

**Status:** Done. Full ballot screen at `app/(tabs)/orgs/[id]/votes/[voteId].tsx` with candidate selection per position, cast vote mutation, and results view.

---

## 8. Architecture & Conventions

### 8.1 File Naming

- Feature hooks: `src/features/{domain}/use{FeatureName}.ts`
- Screen files: `app/(tabs)/{feature}/{route}.tsx`
- Components: `src/components/{domain}/{ComponentName}.tsx`

### 8.2 State Management

- **Server state:** React Query (TanStack Query) for all API data. Cache keys follow the convention `['resource-type', ...params]`.
- **Client state:** Zustand store for auth, theme, notifications.
- **No prop drilling** — use React Query's `queryClient` for cross-feature invalidation.

### 8.3 Error Handling

Every screen should handle three states:
- **Loading:** `<LoadingState label="Loading..." />`
- **Error:** `<ErrorState description="..." onRetry={refetch} />`
- **Empty:** `<EmptyState title="..." description="..." action={...} />`

### 8.4 API Client

Use the existing `apiFetch` or `axios` instance from `src/services/api/`. All API calls should be wrapped through the client to inherit auth headers, base URL, and error handling.

### 8.5 Testing

Each new hook should have a corresponding `.test.ts` file using `@testing-library/react-hooks` with mocked API responses (see existing examples in `src/features/events/`).

---

## 9. Quick Reference: Key Files to Modify

| Task | Type | Files to Create | Files to Modify |
|---|---|---|---|
| **My Registrations** | New feature | `src/features/registrations/useStudentRegistrations.ts`, `app/(tabs)/registrations.tsx` | `app/(tabs)/events/_layout.tsx` (add stack screen), `app/(tabs)/home.tsx` (wire link) |
| **Apply to Orgs** | Wire existing hooks | — | `app/(tabs)/orgs/index.tsx` (add buttons), `app/(tabs)/orgs/[id].tsx` (add buttons) |
| **My Memberships** | Wire existing hooks | `app/(tabs)/memberships.tsx` | `app/(tabs)/orgs/_layout.tsx` (add stack screen), `app/(tabs)/settings.tsx` (add link) |
| **Attendance Filter** | Enhancement | — | `app/(tabs)/settings.tsx` (add search + filter to attendance section) |
| **Richer Event Detail** | Enhancement | — | `app/(tabs)/events/[id].tsx` (add sections), possibly update event type |
| **Full Profile** | Enhancement | — | `app/(tabs)/settings.tsx` (add fields) |
| **Org Voting** | Wire existing hooks | `app/(tabs)/orgs/[id]/vote/[voteId].tsx` | `app/(tabs)/orgs/[id].tsx` (add voting section) |

### Existing Hooks & Services That Need No Changes

| Feature | Existing Hook | Existing API Service |
|---|---|---|
| Apply to Orgs | `src/features/memberships/useMemberships.ts` | `src/services/api/memberships.ts` |
| My Memberships | `src/features/memberships/useMemberships.ts` | `src/services/api/memberships.ts` |
| Resign from Org | `src/features/memberships/useMemberships.ts` | `src/services/api/memberships.ts` |
| Org Voting | `src/features/votes/useVotes.ts` | _(backend endpoints assumed)_ |
