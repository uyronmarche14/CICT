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
| **My Registrations** | ✅ | ❌ | **REAL GAP** — no dedicated page |
| **Organizations Browse** | ✅ | ✅ + search | |
| **Organization Detail** | ✅ | ✅ | |
| **Apply to Organizations** | ✅ | 🟡 | **QUICK WIN** — hooks & API exist, just need UI buttons |
| **My Memberships** | ✅ | 🟡 | **QUICK WIN** — hooks & API exist, just need a screen |
| **Resign from Organization** | ✅ | 🟡 | **QUICK WIN** — mutation exists, needs UI wiring |
| **Org Voting** | ✅ | 🟡 | **QUICK WIN** — hooks exist, needs UI screen |
| **News List** | ✅ | ✅ | Part of Updates hub |
| **News Detail** | ✅ | ✅ | |
| **Announcements List** | ✅ | ✅ | Part of Updates hub |
| **Announcement Detail** | ✅ | ✅ | |
| **Updates Hub (unified feed)** | ✅ | ✅ + filters + widgets | Mobile has category filters, search, featured widgets |
| **Attendance History** | ✅ | ✅ + stats + badges | Mobile has streaks, badges, chart |
| **Attendance Search/Filter** | ✅ | ❌ | **REAL GAP** — raw timeline only |
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

## 3. Quick Wins — Built But Not Wired

These features already have **API services, React Query hooks, and types written** but are not connected to any UI screen. They are the highest-ROI items: pure UI wiring, zero backend or data-layer work.

### 3.1 Apply to Organizations

| What exists | What's missing |
|---|---|
| `src/features/memberships/useMemberships.ts` with `useMembershipStatus(orgId)`, `useApplyToOrg()`, `useResignFromOrg()` mutations | Apply/Leave/Pending buttons on org list and detail screens |
| `src/services/api/memberships.ts` with `getMyMemberships()`, `applyToOrg(orgId)`, `resignFromOrg(membershipId)` | Membership status display on org cards |
| `GET /student/memberships` and `POST /student/organizations/:id/apply` endpoints on backend | |

**Effort:** ~30 minutes of UI wiring. No new hooks or API calls needed.

### 3.2 My Memberships Screen

| What exists | What's missing |
|---|---|
| `src/features/memberships/useMemberships.ts` with `useMyMemberships()` query | A screen to display memberships |
| `src/services/api/memberships.ts` with `getMyMemberships()` | Navigation entry (tab or link) |
| `POST /student/memberships/:id/resign` endpoint for resign action | Resign button with confirmation |

**Effort:** ~1 hour — create a new screen file, import existing hooks, add to navigation.

### 3.3 Org Voting

| What exists | What's missing |
|---|---|
| `src/features/votes/useVotes.ts` with `useOrgVotes()`, `useVoteDetail()`, `useCastBallot()`, `useVoteResults()` | UI screens for listing votes, viewing vote detail, casting ballots, viewing results |
| Backend endpoints presumably exist (no API file needed) | Navigation entry in org detail |

**Effort:** ~2–3 hours — create vote list screen, vote detail screen, cast ballot form. Lower priority than memberships/apply.

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
| **Sprint 1** | Apply to Organizations (wire existing hooks) | ~30 min | Quick win | High |
| **Sprint 1** | My Memberships Screen (use existing hooks) | ~1 hr | Quick win | High |
| **Sprint 2** | My Registrations Screen | ~2 hr | New feature | High |
| **Sprint 3** | Attendance History Search & Filter | ~1.5 hr | Enhancement | Medium |
| **Sprint 4** | Org Voting (wire existing hooks) | ~2–3 hr | Quick win | Low |
| **Sprint 5** | Richer Event Detail | ~1 hr | Enhancement | Low |
| **Sprint 5** | Full Student Profile | ~1 hr | Enhancement | Low |

Sprint 1 items can be done back-to-back in under 2 hours total.

---

## 7. Detailed Implementation Plans

### 7.1 My Registrations Screen

#### Overview

Add a dedicated screen showing all student registrations (active + cancelled) with QR pass links, matching the web's `/student/registrations`.

#### Implementation Steps

**Step 1: Create API hook**

Create `src/features/registrations/useStudentRegistrations.ts`:

- Define `RegistrationItem` type: `{ _id, event: { _id, title, date, location, image? }, status (registered|checked_in|cancelled), registeredAt }`
- Query `GET /student/registrations` via `useQuery` with key `['student-registrations']`
- Return `{ registrations, isLoading, error, refetch }`

**Step 2: Create UI screen**

Create `app/(tabs)/registrations.tsx` (or add as a section under events):

Use `AppScreen` wrapper with `SectionHeader` and `FlatList`. Split into two sections:
- **Active** (`status === 'registered' || status === 'checked_in'`) — shows event card with "View QR" button
- **Cancelled** (`status === 'cancelled'`) — dimmed styling

Each item shows: event image, title, date, location, status pill, QR button (active only).

**Step 3: Add tab navigation entry**

Add a "Registrations" tab or a link from the Events tab stack. If adding a tab, update `(tabs)/_layout.tsx`. The simplest approach is adding it as a stack screen under the Events tab (`events/_layout.tsx`).

**Step 4: Wire up QR navigation**

The "View QR" button navigates to `/(tabs)/events/[id]/qr`

**Step 5: Update home metrics card**

The home dashboard already shows "Active registrations" count — ensure it links to the new registrations screen.

---

### 7.2 Apply to Organizations (Wire Existing Hooks)

#### Overview

Add apply/leave/pending actions to the org list and detail screens. The hooks already exist — this is purely UI wiring.

#### What Already Exists

```typescript
// src/features/memberships/useMemberships.ts
useMyMemberships()       // fetches GET /student/memberships
useMembershipStatus(id)  // checks membership status for a specific org
useApplyToOrg()          // mutation: POST /student/organizations/:id/apply
useResignFromOrg()       // mutation: POST /student/memberships/:id/resign
```

#### Implementation Steps

**Step 1: Import existing hooks into org screens**

In `app/(tabs)/orgs/index.tsx` and `app/(tabs)/orgs/[id].tsx`:

```typescript
import { useMyMemberships, useApplyToOrg } from 'src/features/memberships/useMemberships'
```

**Step 2: Fetch membership status**

Call `useMyMemberships()` to get the user's memberships. Merge with org list to determine status per org.

```typescript
const { data: memberships } = useMyMemberships()
const membershipStatus = (orgId: string) => {
  const m = memberships?.find(m => m.organization._id === orgId)
  if (!m) return 'none'
  if (m.status === 'applied' || m.status === 'pending') return 'pending'
  if (m.status === 'active') return 'member'
  return 'none'
}
```

**Step 3: Add action buttons to org list**

In the org list screen, conditionally render on each `OrganizationCard`:
- Status: `none` → "Apply" button (primary style)
- Status: `pending` → "Pending" pill (warning style, disabled)
- Status: `member` → "Leave" button (ghost/danger style) with confirmation dialog

**Step 4: Add action buttons to org detail**

In the org detail screen, add the same action buttons in the header area below the org name.

**Step 5: Wire mutations**

```typescript
const applyMutation = useApplyToOrg()
const resignMutation = useResignFromOrg()

// On Apply press:
applyMutation.mutate(orgId, {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-memberships'] })
})

// On Resign press (after confirmation):
resignMutation.mutate(membershipId, {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-memberships'] })
})
```

---

### 7.3 My Memberships Screen (Use Existing Hooks)

#### Overview

Add a screen showing organizations the student belongs to, with role/position info and a resign action. The hooks already exist.

#### What Already Exists

```typescript
// src/features/memberships/useMemberships.ts
useMyMemberships()       // already returns memberships with org, position, memberType, academicYear
useResignFromOrg()       // already has the resign mutation
```

#### Implementation Steps

**Step 1: Create memberships screen**

Create `app/(tabs)/memberships.tsx`:

- `FlatList` of memberships showing: org logo/placeholder, org name, position (if any), member type, academic year
- Each item has a "Resign" button (danger style) with confirmation alert
- Empty state: "You haven't joined any organizations yet" + "Browse organizations" button

**Step 2: Add navigation entry**

Either add a tab or a link from the Settings screen or the Orgs tab stack.

**Step 3: Wire resign mutation**

Already exists — just call `useResignFromOrg().mutate(membershipId)` with confirmation dialog.

**Step 4: Invalidate on resign**

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['my-memberships'] })
  queryClient.invalidateQueries({ queryKey: ['organizations'] })
}
```

---

### 7.4 Attendance History Search & Filter

#### Overview

Add search by event name and filter by scan result type to the existing attendance history screen.

#### Implementation Steps

**Step 1: Add search bar**

In `app/(tabs)/settings.tsx` (attendance history section):

- Add a `SearchBar` component at the top of the attendance history list
- Debounce input (300ms) using local state + `useMemo` for filtering

**Step 2: Add result type filter**

Add a horizontal scrollable row of filter chips below the search bar:

```typescript
const RESULT_FILTERS = [
  { label: 'All', value: null },
  { label: 'Success', value: 'success' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Not Registered', value: 'not_registered' },
  { label: 'Event Full', value: 'event_full' },
  { label: 'Closed', value: 'closed' },
  { label: 'Invalid QR', value: 'invalid_qr' },
  { label: 'Denied', value: 'denied' },
]
```

Use `StatusPill` for filter chips, active state styling on the selected filter.

**Step 3: Apply filters client-side**

Since the mobile app fetches all attendance history at once, filtering can be done client-side:

```typescript
const filteredLogs = useMemo(() => {
  return logs.filter((log) => {
    const matchesSearch = searchQuery
      ? log.eventName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesFilter = activeFilter
      ? log.result === activeFilter
      : true
    return matchesSearch && matchesFilter
  })
}, [logs, searchQuery, activeFilter])
```

**Step 4: Show result count**

Display "Showing X of Y results" below the filters when filtering is active.

---

### 7.5 Richer Event Detail (Speakers, Fee, Tags, Contact)

#### Overview

Add the missing fields to the event detail screen: speakers list, fee display, tag chips, and organizer contact info.

#### Implementation Steps

**Step 1: Verify API response**

Check that `GET /events/:id` returns `speakers`, `fee`, `tags`, `contact` fields. If not, add them to the backend event detail response. The mobile hook in `src/features/events/useStudentEvent.ts` already fetches this endpoint.

**Step 2: Update EventDetail type**

Extend the event detail type to include optional fields:

```typescript
interface EventDetailSpeaker {
  name: string
  title?: string
  bio?: string
  image?: string
}

interface EventDetailContact {
  name: string
  email?: string
  phone?: string
}
```

**Step 3: Add UI sections to event detail screen**

In `app/(tabs)/events/[id].tsx`, add sections after the event description:

```tsx
{/* Fee */}
{event.fee?.amount > 0 && (
  <SectionHeader title="Registration Fee" />
  <AppCard><Text>{event.fee.amount}</Text></AppCard>
)}

{/* Tags */}
{event.tags?.length > 0 && (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {event.tags.map(tag => <StatusPill key={tag} label={tag} />)}
  </View>
)}

{/* Speakers */}
{event.speakers?.length > 0 && (
  <SectionHeader title="Speakers" />
  // FlatList horizontal of speaker cards with image, name, title, expandable bio
)}

{/* Contact */}
{event.contact && (
  <SectionHeader title="Organizer Contact" />
  <AppCard>
    <Text>{event.contact.name}</Text>
    {event.contact.email && <Text>{event.contact.email}</Text>}
    {event.contact.phone && <Text>{event.contact.phone}</Text>}
  </AppCard>
)}
```

**Step 4: Test with real data**

Verify the UI renders correctly for events that have these fields and events that don't (graceful empty state).

---

### 7.6 Full Student Profile (Phone, Address, Memberships)

#### Overview

Extend the settings screen's profile section to show phone, address, and a list of memberships.

#### Implementation Steps

**Step 1: Verify API response**

Check that `GET /student/profile` returns `phone`, `address`, and `memberships` array. The mobile hook in `src/features/profile/useStudentProfile.ts` already fetches this.

**Step 2: Extend profile type in settings screen**

In `app/(tabs)/settings.tsx`, add fields to the profile card:

```tsx
{student.phone && (
  <View style={styles.infoRow}>
    <Icon name="phone" />
    <Text>{student.phone}</Text>
  </View>
)}
{student.address && (
  <View style={styles.infoRow}>
    <Icon name="map-pin" />
    <Text>{student.address}</Text>
  </View>
)}
```

**Step 3: Add memberships list**

Below the profile card, add a "My Memberships" section:

```tsx
<SectionHeader title="My Memberships" />
{student.memberships?.length > 0 ? (
  student.memberships.map(m => (
    <AppCard key={m._id}>
      <Text>{m.organization.name}</Text>
      {m.position && <Text>{m.position}</Text>}
    </AppCard>
  ))
) : (
  <EmptyState
    title="No memberships yet"
    action={{ label: "Browse Organizations", onPress: () => router.push('/(tabs)/orgs') }}
  />
)}
```

**Step 4: Add "View All" link**

If memberships exceed 3, show "View all X memberships" to navigate to the memberships screen (once built).

---

### 7.7 Org Voting (Wire Existing Hooks)

#### Overview

The mobile app already has voting hooks in `src/features/votes/useVotes.ts`. Wire them into a UI flow so students can participate in org elections from their phone.

#### What Already Exists

```typescript
// src/features/votes/useVotes.ts
useOrgVotes(orgId)                    // list votes/polls for an org
useVoteDetail(orgId, voteId)          // get vote details with candidates
useCastBallot(orgId)                  // mutation: cast vote with selections
useVoteResults(orgId, voteId)         // get vote results with per-candidate counts
```

#### Implementation Steps

**Step 1: Create vote list section on org detail**

In `app/(tabs)/orgs/[id].tsx`, add a "Voting" section after the team section:

```typescript
const { data: votes } = useOrgVotes(orgId)
// Show as a horizontal list of vote cards with title, dates, status badge
```

**Step 2: Create vote detail + cast ballot screen**

Create `app/(tabs)/orgs/[id]/vote/[voteId].tsx`:

- Show election title, description, start/end dates, anonymity flag
- List candidates with name, platform, selectable radio button
- "Cast Vote" button (disabled if already voted or voting closed)
- Confirmation dialog before submitting

**Step 3: Create vote results view**

On the vote detail screen, if voting has ended, show results:

- Per-position bar chart (or simple list) with candidate name + vote count
- Total votes cast display

**Step 4: Add navigation**

From the org detail vote section, tap a vote card → navigate to vote detail screen.

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
