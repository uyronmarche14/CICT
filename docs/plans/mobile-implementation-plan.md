# CICT Mobile — Implementation Plan

Last updated: 2026-06-10

Based on a complete codebase audit (97 files inspected) comparing `apps/mobile` against `apps/web`. This plan identifies every gap, prioritizes the work, and provides detailed step-by-step implementation instructions.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Priority Overview](#2-priority-overview)
3. [Sprint 1: My Registrations Screen](#3-sprint-1-my-registrations-screen)
4. [Sprint 2: My Memberships Section](#4-sprint-2-my-memberships-section)
5. [Sprint 2: Notification Bell](#5-sprint-2-notification-bell)
6. [Sprint 2: Notification Deep Links](#6-sprint-2-notification-deep-links)
7. [Sprint 3: Attendance Search & Filter](#7-sprint-3-attendance-search--filter)
8. [Sprint 3: Richer Event Detail](#8-sprint-3-richer-event-detail)
9. [Sprint 3: Full Profile Fields](#9-sprint-3-full-profile-fields)
10. [Sprint 4: Fix Outdated Docs](#10-sprint-4-fix-outdated-docs)
11. [Existing Hooks & Services Reference](#11-existing-hooks--services-reference)
12. [Architecture & Conventions](#12-architecture--conventions)

---

## 1. Current State Summary

### 1.1 Already Implemented (no work needed)

| Feature | Files | Status |
|---|---|---|
| Student login & session restore | `features/auth/`, `store/auth-store.ts` | ✅ |
| Home dashboard with metrics | `app/(tabs)/home.tsx` | ✅ |
| Event listing with search | `app/(tabs)/events/index.tsx` | ✅ |
| Event detail with registration | `app/(tabs)/events/[id].tsx` | ✅ |
| QR pass (offline-cached) | `app/(tabs)/events/[id]/qr.tsx` | ✅ |
| Add to calendar | `components/events/AddToCalendarButton.tsx` | ✅ |
| Share ticket | `components/events/TicketShareButton.tsx` | ✅ |
| Local event reminders | `services/notifications/local-reminders.ts` | ✅ |
| Organization list + search | `app/(tabs)/orgs/index.tsx` | ✅ |
| Organization detail | `app/(tabs)/orgs/[id].tsx` | ✅ |
| Apply to organizations | `app/(tabs)/orgs/[id].tsx` lines 82-130 | ✅ |
| Org voting (full ballot) | `app/(tabs)/orgs/[id]/votes/[voteId].tsx` | ✅ |
| Updates hub (unified feed) | `app/(tabs)/updates/index.tsx` | ✅ |
| News detail | `app/(tabs)/updates/news/[id].tsx` | ✅ |
| Announcement detail | `app/(tabs)/updates/announcements/[id].tsx` | ✅ |
| Attendance history | `app/(tabs)/settings.tsx` | ✅ |
| Attendance badges (gamification) | `components/attendance/AttendanceBadge.tsx` | ✅ |
| Dark mode | `theme/ThemeContext.tsx` | ✅ |
| Push notification registration | `services/notifications/register.ts` | ✅ |
| Offline data caching (5-min TTL) | `services/storage/cache.ts` | ✅ |
| Connectivity notice | `components/feedback/ConnectivityNotice.tsx` | ✅ |
| Haptic feedback | `utils/haptics.ts` | ✅ |

### 1.2 Built But Not Wired

| Feature | Files Exist | Missing |
|---|---|---|
| Notification Bell | `components/notifications/NotificationBell.tsx`, `NotificationCenter.tsx` | Never instantiated on any screen |
| Notification Deep Links | `features/notifications/useNotificationSetup.ts` `useNotificationResponse()` | Callback body is empty — no navigation on tap |
| My Memberships list | `features/memberships/useMemberships.ts`, `services/api/memberships.ts` | No dedicated list screen or section |
| My Registrations data | `services/api/student.ts` `getRegistrations()` function | No hook file, no screen |

### 1.3 Truly Missing

| Gap | Web Behavior | Mobile Status |
|---|---|---|
| My Registrations page | `/student/registrations` with Active + Cancelled sections + QR links | No screen at all |
| My Memberships list | `/student/memberships` with position, type, resign action | Status shown per-org on detail only, no consolidated view |
| Attendance search & filter | Search by event name + filter by scan result type | Raw timeline only |
| Event speakers / fee / tags / contact | Rich sections on web event detail | Not displayed |
| Full profile (phone, address) | `/student/profile` shows everything | Only name, number, email, program, year, section shown |

### 1.4 Outdated Documentation

| File | Problem |
|---|---|
| `apps/mobile/docs/design-system.md` | Claims primary color is `#185ADB` (blue). Actual `tokens.ts` uses `#6E29F6` (purple) matching web |
| `apps/mobile/docs/brand-parity.md` | Says "generic blue-led token file" and "no imported brand font" — both are now implemented |
| `apps/mobile/docs/architecture.md` | Says "token file is not yet brand-aligned" — it is now aligned |

---

## 2. Priority Overview

| Sprint | Item | Effort | Files Created | Files Modified | Value |
|---|---|---|---|---|---|
| **1** | My Registrations Screen | ~2h | 2 | 3 | High |
| **2** | My Memberships (Orgs section) | ~1h | 0 | 1 | Medium |
| **2** | Notification Bell (home header) | ~15min | 0 | 1 | Medium |
| **2** | Notification Deep Links | ~30min | 0 | 1 | Medium |
| **3** | Attendance Search & Filter | ~1.5h | 0 | 1 | Low |
| **3** | Richer Event Detail | ~1h | 0 | 2 | Low |
| **3** | Full Profile fields | ~30min | 0 | 1 | Lowest |
| **4** | Fix outdated docs | ~1h | 0 | 4 | Low |
| **Total** | | **~7.5h** | **2** | **14** | |

---

## 3. Sprint 1: My Registrations Screen

### 3.1 Problem

Users can register for events from the event detail screen, but there is no consolidated view of all their registrations. The function `studentApi.getRegistrations()` is defined in `src/services/api/student.ts` and the query key `queryKeys.registrations` exists in `src/constants/queryKeys.ts`, but neither is called anywhere. Web has `/student/registrations` with active/cancelled sections and QR links.

### 3.2 Implementation Steps

#### Step 1: Create the API hook

Create `src/features/registrations/useStudentRegistrations.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { studentApi } from 'src/services/api/student'
import { queryKeys } from 'src/constants/queryKeys'

export interface RegistrationItem {
  _id: string
  event: {
    _id: string
    title: string
    date: string
    location: string
    image?: string
  }
  status: 'registered' | 'checked_in' | 'cancelled'
  registeredAt: string
}

export function useStudentRegistrations() {
  return useQuery<RegistrationItem[]>({
    queryKey: queryKeys.registrations,
    queryFn: () => studentApi.getRegistrations(),
  })
}
```

**Type imports:** Verify `RegistrationItem` matches the backend response from `GET /student/registrations` and `StudentRegistrationsResponse` from `@cict/contracts/types`.

#### Step 2: Create the registrations screen

Create `app/(tabs)/registrations.tsx`:

```typescript
import { View, FlatList, SectionList, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useStudentRegistrations } from 'src/features/registrations/useStudentRegistrations'
import { AppScreen } from 'src/components/ui/AppScreen'
import { SectionHeader } from 'src/components/ui/SectionHeader'
import { AppCard } from 'src/components/ui/AppCard'
import { AppButton } from 'src/components/ui/AppButton'
import { StatusPill } from 'src/components/ui/StatusPill'
import { LoadingState } from 'src/components/feedback/LoadingState'
import { ErrorState } from 'src/components/feedback/ErrorState'
import { EmptyState } from 'src/components/feedback/EmptyState'
import { formatDate } from 'src/utils/format'
```

Structure:
- Use `SectionList` with two sections: **Active** (status `registered` or `checked_in`) and **Cancelled** (status `cancelled`)
- Each item rendered as an `AppCard` with:
  - Event image (or placeholder)
  - Event title, date, location
  - Status pill (registered=info, checked_in=success, cancelled=danger)
  - "View QR" button (active items only) → navigates to `/(tabs)/events/[id]/qr`
- Section headers: "Active Registrations (N)" and "Cancelled (N)" with counts
- Empty state per section if no items
- Empty state for no registrations at all: "You haven't registered for any events yet" + "Browse events" button
- Pull-to-refresh via `refetch`

**Loading state:** `<LoadingState label="Loading your registrations..." />`
**Error state:** `<ErrorState description="Failed to load registrations" onRetry={refetch} />`
**Empty state:** `<EmptyState title="No registrations yet" description="... " action={{ label: "Browse Events", onPress: ... }} />`

**Type for `AppCard` image:** Use `Image` with `source={{ uri: event.image }}` and fallback to a purple placeholder if no image.

**Status pill mapping:**
```typescript
const statusConfig = {
  registered: { tone: 'info' as const, label: 'Registered' },
  checked_in: { tone: 'success' as const, label: 'Checked In' },
  cancelled: { tone: 'danger' as const, label: 'Cancelled' },
}
```

#### Step 3: Add navigation entry

Modify `app/(tabs)/events/_layout.tsx` to add the registrations screen to the Events stack:

```typescript
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="[id]" options={{ headerShown: false }} />
  <Stack.Screen name="registrations" options={{ headerShown: false }} />
</Stack>
```

At `app/(tabs)/events/index.tsx`, add a "My Registrations" link or icon button in the header area:

```typescript
// Add near the title or search bar
<Pressable onPress={() => router.push('/(tabs)/registrations')}>
  <Text style={styles.link}>My Registrations</Text>
</Pressable>
```

Or use a tab badge on the Events tab showing active registration count.

#### Step 4: Wire home screen metric

In `app/(tabs)/home.tsx`, the "Active Registrations" metric card is rendered. Ensure its onPress navigates to the new registrations screen:

```typescript
// If not already wired:
onPress={() => router.push('/(tabs)/registrations')}
```

### 3.3 Files Summary

| Action | File |
|---|---|
| **CREATE** | `src/features/registrations/useStudentRegistrations.ts` |
| **CREATE** | `app/(tabs)/registrations.tsx` |
| MODIFY | `app/(tabs)/events/_layout.tsx` — add stack screen |
| MODIFY | `app/(tabs)/events/index.tsx` — add "My Registrations" link |
| MODIFY | `app/(tabs)/home.tsx` — wire metric to navigate |

---

## 4. Sprint 2: My Memberships Section

### 4.1 Problem

Membership status per-organization is shown on the org detail screen (apply/leave/pending buttons). However, there is no consolidated view showing all organizations the student belongs to in one place. Web has `/student/memberships`.

### 4.2 Approach

Per your preference: add a **"My Organizations" section** at the top of the Orgs tab (`app/(tabs)/orgs/index.tsx`). This gives a quick overview of joined orgs with resign action, while the full org list remains below.

### 4.3 What Already Exists

```typescript
// src/features/memberships/useMemberships.ts
useMyMemberships()       // returns memberships with org, position, memberType, academicYear, status
useResignFromOrg()       // mutation: POST /student/memberships/:id/resign

// src/services/api/memberships.ts
membershipApi.getMyMemberships()    // GET /student/memberships
membershipApi.resignFromOrg(id)     // POST /student/memberships/:id/resign
```

No new hooks or API calls needed.

### 4.4 Implementation

Modify `app/(tabs)/orgs/index.tsx`:

**Step 1: Import existing hooks**

```typescript
import { useMyMemberships } from 'src/features/memberships/useMemberships'
```

**Step 2: Fetch memberships**

```typescript
const { data: memberships, isLoading: membershipsLoading } = useMyMemberships()
```

**Step 3: Add "My Organizations" section**

Before the search bar and org list, conditionally render:

```typescript
{memberships && memberships.length > 0 && (
  <View style={{ marginBottom: 16 }}>
    <SectionHeader title={`My Organizations (${memberships.length})`} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {memberships.map((m) => (
        <Pressable
          key={m._id}
          onPress={() => router.push(`/(tabs)/orgs/${m.organization._id}`)}
        >
          <AppCard variant="elevated" style={{ width: 200, marginRight: 12 }}>
            {/* Org logo/initial */}
            {/* Org name */}
            {/* Position (if any) */}
            {/* Member type badge */}
            {/* Resign button with confirmation alert */}
          </AppCard>
        </Pressable>
      ))}
    </ScrollView>
  </View>
)}
```

**Resign flow:**
```typescript
const resignMutation = useResignFromOrg()
const handleResign = (membershipId: string, orgName: string) => {
  Alert.alert(
    'Leave Organization',
    `Are you sure you want to leave ${orgName}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => resignMutation.mutate(membershipId, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.memberships })
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations })
          }
        }),
      },
    ]
  )
}
```

**Empty state (when no memberships):**
```typescript
{memberships && memberships.length === 0 && (
  <EmptyState
    title="Not a member of any organization yet"
    description="Browse organizations below and apply to join"
  />
)}
```

### 4.5 Files Summary

| Action | File |
|---|---|
| MODIFY | `app/(tabs)/orgs/index.tsx` — add "My Organizations" section at top |

---

## 5. Sprint 2: Notification Bell

### 5.1 Problem

`NotificationBell.tsx` and `NotificationCenter.tsx` are fully built components. They handle push notification receiving, in-app store, read/unread tracking, and the full-screen modal. However, the bell is never placed on any screen — there is no way for the user to see their notifications.

### 5.2 What Already Exists

```typescript
// src/components/notifications/NotificationBell.tsx
// - Bell icon button
// - Unread count badge (capped at 99+)
// - Opens NotificationCenter as a modal (presentationStyle="pageSheet")
// - Haptic on press

// src/components/notifications/NotificationCenter.tsx
// - Full-screen modal listing all notifications
// - FlatList with read/unread styling
// - Type icons (newspaper, megaphone, checkmark, alarm)
// - Mark as read / Mark all as read
// - Unread dot indicators

// src/store/notification-store.ts
// - Zustand store: notifications[], unreadCount
// - addNotification, markAsRead, markAllAsRead, clearBadge

// src/services/notifications/notification-handler.ts
// - Receives push notifications, adds to store with type inference
```

### 5.3 Implementation

Modify `app/(tabs)/home.tsx`:

**Step 1: Import the bell component**

```typescript
import { NotificationBell } from 'src/components/notifications/NotificationBell'
```

**Step 2: Add to header area**

Place the bell near the top-right of the welcome hero section or beside the CICT branding text:

```typescript
// In the welcome hero section, add:
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <View>
    <Text style={styles.welcomeText}>Welcome back,</Text>
    <Text style={styles.studentName}>{student.firstName}</Text>
  </View>
  <NotificationBell />
</View>
```

**Step 3: Ensure the notification handler is running**

Verify that `app/_layout.tsx` calls `useNotificationSetup()` (it should already — the audit confirmed it does in the root layout). The push notification registration and in-app handling are already wired.

### 5.4 Files Summary

| Action | File |
|---|---|
| MODIFY | `app/(tabs)/home.tsx` — add `<NotificationBell />` in header |

---

## 6. Sprint 2: Notification Deep Links

### 6.1 Problem

`useNotificationResponse()` in `src/features/notifications/useNotificationSetup.ts` sets up an `addNotificationResponseReceivedListener` (from `expo-notifications`), but the callback function body is empty. When a user taps a push notification, nothing happens — no navigation, no deep link.

### 6.2 Implementation

Modify `src/features/notifications/useNotificationSetup.ts`:

**Step 1: Import router**

```typescript
import { router } from 'expo-router'
```

**Step 2: Populate the notification response handler**

The notification data payload has a `type` field that indicates what kind of content the notification references. Use it to navigate to the appropriate screen:

```typescript
export function useNotificationResponse() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data

        switch (data.type) {
          case 'news':
            router.push(`/(tabs)/updates/news/${data.newsId}`)
            break
          case 'announcement':
            router.push(`/(tabs)/updates/announcements/${data.announcementId}`)
            break
          case 'event_reminder':
          case 'event':
            router.push(`/(tabs)/events/${data.eventId}`)
            break
          case 'check_in':
            router.push(`/(tabs)/settings`)
            break
          default:
            // Fallback: just open the app to home
            break
        }
      }
    )

    return () => subscription.remove()
  }, [])
}
```

**Step 3: Verify notification payload fields**

Check the backend's push notification payload to confirm the field names in `data`. The handler above assumes:
- `data.type` — one of `'news'`, `'announcement'`, `'event_reminder'`, `'event'`, `'check_in'`
- `data.newsId` — news article ID
- `data.announcementId` — announcement ID
- `data.eventId` — event ID

Adjust field names to match actual backend payload.

### 6.3 Files Summary

| Action | File |
|---|---|
| MODIFY | `src/features/notifications/useNotificationSetup.ts` — populate the tap handler |

---

## 7. Sprint 3: Attendance Search & Filter

### 7.1 Problem

The attendance history in `app/(tabs)/settings.tsx` shows all scan logs in a chronological timeline with no way to search or filter. Web has a search bar (by event name) and a filter dropdown (by scan result type: success, duplicate, not_registered, etc.).

### 7.2 Implementation

Modify `app/(tabs)/settings.tsx`:

**Step 1: Add search bar state**

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [activeFilter, setActiveFilter] = useState<string | null>(null)
```

**Step 2: Define filter options**

```typescript
const RESULT_FILTERS = [
  { label: 'All', value: null },
  { label: 'Success', value: 'success' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Not Registered', value: 'not_registered' },
  { label: 'Not Eligible', value: 'not_eligible' },
  { label: 'Invalid QR', value: 'invalid_qr' },
  { label: 'Event Full', value: 'event_full' },
  { label: 'Closed', value: 'closed' },
  { label: 'Denied', value: 'denied' },
] as const
```

**Step 3: Compute filtered logs**

```typescript
const filteredLogs = useMemo(() => {
  if (!attendanceHistory) return []
  return attendanceHistory.filter((log) => {
    const matchesSearch = searchQuery
      ? log.eventName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesFilter = activeFilter
      ? log.result === activeFilter
      : true
    return matchesSearch && matchesFilter
  })
}, [attendanceHistory, searchQuery, activeFilter])
```

**Step 4: Add search bar UI**

```typescript
<AppTextInput
  placeholder="Search by event name..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  leftIcon="search"
/>
```

**Step 5: Add filter chips**

```typescript
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
  {RESULT_FILTERS.map((filter) => (
    <Pressable key={filter.value ?? 'all'} onPress={() => setActiveFilter(filter.value)}>
      <StatusPill
        label={filter.label}
        tone={activeFilter === filter.value ? 'info' : 'neutral'}
      />
    </Pressable>
  ))}
</ScrollView>
```

**Step 6: Show result count**

```typescript
{searchQuery || activeFilter ? (
  <Text variant="caption">
    Showing {filteredLogs.length} of {attendanceHistory?.length ?? 0} entries
  </Text>
) : null}
```

**Step 7: Render filtered logs**

Replace `attendanceHistory.map(...)` with `filteredLogs.map(...)`.

### 7.3 Files Summary

| Action | File |
|---|---|
| MODIFY | `app/(tabs)/settings.tsx` — add search bar + filter chips + client-side filtering |

---

## 8. Sprint 3: Richer Event Detail

### 8.1 Problem

Mobile event detail (`app/(tabs)/events/[id].tsx`) shows cover image, title, date, location, status, countdown, body text, and schedule. Web also shows speakers (with bios), fee, tag chips, and organizer contact information. These are not displayed on mobile.

### 8.2 Pre-Implementation Check

Before coding, verify the backend response from `GET /events/:id` includes these fields:

```bash
curl https://your-api.com/api/events/<some-event-id> | jq '.data | {speakers, fee, tags, contact}'
```

If fields are present, proceed. If not, add them to the backend event response first.

### 8.3 Implementation

**Step 1: Update types (if needed)**

In `src/types/models.ts` or locally in the component, ensure types include:

```typescript
interface EventDetailSpeaker {
  name: string
  title?: string
  bio?: string
  image?: string
}

interface EventContact {
  name: string
  email?: string
  phone?: string
}

// Add to StudentEvent:
speakers?: EventDetailSpeaker[]
fee?: { amount: number; currency?: string }
tags?: string[]
contact?: EventContact
```

**Step 2: Add fee section**

After the event description in `app/(tabs)/events/[id].tsx`:

```typescript
{event.fee && event.fee.amount > 0 && (
  <>
    <SectionHeader title="Registration Fee" />
    <AppCard>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>
        ₱{event.fee.amount.toLocaleString()}
      </Text>
      {event.fee.currency && <Text>{event.fee.currency}</Text>}
    </AppCard>
  </>
)}
```

**Step 3: Add tags**

```typescript
{event.tags && event.tags.length > 0 && (
  <>
    <SectionHeader title="Tags" />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {event.tags.map((tag: string) => (
        <StatusPill key={tag} label={tag} tone="neutral" />
      ))}
    </View>
  </>
)}
```

**Step 4: Add speakers section**

```typescript
{event.speakers && event.speakers.length > 0 && (
  <>
    <SectionHeader title="Speakers" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {event.speakers.map((speaker, index) => (
        <AppCard key={index} style={{ width: 180, marginRight: 12 }}>
          {/* Speaker image */}
          {speaker.image ? (
            <Image source={{ uri: speaker.image }} style={{ width: 60, height: 60, borderRadius: 30 }} />
          ) : (
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary }} />
          )}
          <Text style={{ fontWeight: '700', marginTop: 8 }}>{speaker.name}</Text>
          {speaker.title && <Text>{speaker.title}</Text>}
          {speaker.bio && <Text numberOfLines={3}>{speaker.bio}</Text>}
        </AppCard>
      ))}
    </ScrollView>
  </>
)}
```

**Step 5: Add contact section**

```typescript
{event.contact && (
  <>
    <SectionHeader title="Organizer Contact" />
    <AppCard>
      <Text>{event.contact.name}</Text>
      {event.contact.email && <Text>{event.contact.email}</Text>}
      {event.contact.phone && <Text>{event.contact.phone}</Text>}
    </AppCard>
  </>
)}
```

### 8.4 Files Summary

| Action | File |
|---|---|
| MODIFY | `app/(tabs)/events/[id].tsx` — add fee/tags/speakers/contact sections |
| MAYBE MODIFY | `src/types/models.ts` — add optional fields to event type |
| MAYBE MODIFY | Backend `GET /events/:id` — if fields are missing from response |

---

## 9. Sprint 3: Full Profile Fields

### 9.1 Problem

The settings screen (`app/(tabs)/settings.tsx`) shows the student's name, student number, email, program, year level, and section. It does not show phone number or address, both of which are available on the web profile.

### 9.2 Pre-Implementation Check

Verify `GET /student/profile` returns `phone` and `address`:

```bash
curl -H "Authorization: Bearer <token>" https://your-api.com/api/student/profile | jq '.data | {phone, address}'
```

### 9.3 Implementation

Modify `app/(tabs)/settings.tsx`:

Add phone and address display rows after the email row in the profile card:

```typescript
{/* Existing profile card */}
<AppCard>
  {/* Avatar with initials */}
  {/* Name, Student number, Email, Program, Year Level, Section — already exist */}

  {/* Add after email/section: */}
  {student.phone && (
    <View style={styles.infoRow}>
      <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
      <Text style={styles.infoText}>{student.phone}</Text>
    </View>
  )}
  {student.address && (
    <View style={styles.infoRow}>
      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
      <Text style={styles.infoText}>{student.address}</Text>
    </View>
  )}
</AppCard>
```

Define `infoRow` and `infoText` styles:

```typescript
const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
})
```

### 9.4 Files Summary

| Action | File |
|---|---|
| MODIFY | `app/(tabs)/settings.tsx` — add phone + address display rows |

---

## 10. Sprint 4: Fix Outdated Docs

### 10.1 Problem

Three documentation files in `apps/mobile/docs/` contain claims that no longer match the codebase:

| File | Incorrect Claim | Reality |
|---|---|---|
| `docs/design-system.md` | Primary color `#185ADB` (blue) | `tokens.ts` uses `#6E29F6` (purple) matching web |
| `docs/brand-parity.md` | "Generic blue-led token file", "no imported brand font wiring" | Tokens are purple-branded, `Blockletter.otf` loaded in `AppProviders` |
| `docs/architecture.md` | "Token file is not yet brand-aligned" | Token file has been aligned |

### 10.2 Fix: `docs/design-system.md`

Update color tokens section:
- Replace `#185ADB` with `#6E29F6` (primary purple)
- Add `#F629A8` (secondary pink) and `#29F6D2` (accent teal)
- Remove any "temporary" or "needs replacement" caveats
- Reference `src/theme/tokens.ts` as the source of truth

### 10.3 Fix: `docs/brand-parity.md`

- Remove or mark as resolved the section about "generic blue-led token file"
- Remove or mark as resolved the section about "no brand font wiring"
- Add note: "Tokens updated to web brand purple/pink/teal. Blockletter font loaded in AppProviders."
- Keep any remaining relevant brand parity guidance

### 10.4 Fix: `docs/architecture.md`

- Update the line that says "token file is not yet brand-aligned" to reflect current state
- Or remove it if it's a standalone outdated note

### 10.5 Fix: `docs/mobile-vs-web-comparison.md`

Update `docs/mobile-vs-web-comparison.md` (project-level) to reflect the current accurate state:
- Apply to Organizations → mark as ✅ (fully implemented)
- Org Voting → mark as ✅ (fully implemented)
- Update Quick Wins section to remove items that are now done
- Update the implementation plans for Apply to Orgs and Org Voting to note they're already complete

### 10.6 Files Summary

| Action | File |
|---|---|
| MODIFY | `apps/mobile/docs/design-system.md` |
| MODIFY | `apps/mobile/docs/brand-parity.md` |
| MODIFY | `apps/mobile/docs/architecture.md` |
| MODIFY | `docs/mobile-vs-web-comparison.md` |

---

## 11. Existing Hooks & Services Reference

### 11.1 Already Exists — No Changes Needed

| Hook | File | Purpose |
|---|---|---|
| `useMyMemberships()` | `src/features/memberships/useMemberships.ts` | Fetch all user memberships |
| `useMembershipStatus(orgId)` | same file | Check membership status for one org |
| `useApplyToOrg()` | same file | Mutation to apply to an org |
| `useResignFromOrg()` | same file | Mutation to resign from an org |
| `useOrgVotes(orgId)` | `src/features/votes/useVotes.ts` | List votes/polls for an org |
| `useVoteDetail(orgId, voteId)` | same file | Get vote details with candidates |
| `useCastBallot(orgId)` | same file | Cast vote with selections |
| `useVoteResults(orgId, voteId)` | same file | Get vote results with per-candidate counts |
| `useAttendanceHistory()` | `src/features/attendance/useAttendanceHistory.ts` | Full attendance scan history |
| `useAttendanceStats()` | `src/features/attendance/useAttendanceStats.ts` | Computed stats (streaks, monthly, badges) |
| `useNotificationSetup()` | `src/features/notifications/useNotificationSetup.ts` | Push notification registration |
| `useNotificationResponse()` | same file | Notification tap handler (currently stub) |

### 11.2 API Services Already Defined

| Service Function | File | Endpoint |
|---|---|---|
| `membershipApi.getMyMemberships()` | `src/services/api/memberships.ts` | `GET /student/memberships` |
| `membershipApi.applyToOrg(orgId)` | same file | `POST /student/organizations/:id/apply` |
| `membershipApi.resignFromOrg(id)` | same file | `POST /student/memberships/:id/resign` |
| `studentApi.getRegistrations()` | `src/services/api/student.ts` | `GET /student/registrations` |
| `studentApi.getAttendanceHistory()` | same file | `GET /student/attendance/history` |
| `studentApi.getProfile()` | same file | `GET /student/profile` |
| `authApi.login()` | `src/services/api/auth.ts` | `POST /student/auth/login` |
| `authApi.logout()` | same file | `POST /student/auth/logout` |
| `authApi.me()` | same file | `GET /student/profile` |

### 11.3 Query Keys Already Defined

In `src/constants/queryKeys.ts`:

```typescript
export const queryKeys = {
  auth: ['auth'],
  me: ['me'],
  updates: ['updates'],
  studentEvents: ['student-events'],
  publicEvent: ['public-event'],
  registration: ['registration'],
  registrations: ['registrations'],       // Ready for use
  attendance: ['attendance'],
  news: ['news'],
  newsDetail: ['news-detail'],
  announcements: ['announcements'],
  announcementDetail: ['announcement-detail'],
  memberships: ['memberships'],
  membershipStatus: ['membership-status'],
  organizations: ['organizations'],
  organizationDetail: ['organization-detail'],
  orgVotes: ['org-votes'],
  orgVote: ['org-vote'],
  orgVoteResults: ['org-vote-results'],
}
```

---

## 12. Architecture & Conventions

### 12.1 File Naming

| Layer | Convention | Example |
|---|---|---|
| Route files | `app/(group)/feature/route.tsx` | `app/(tabs)/registrations.tsx` |
| Feature hooks | `src/features/{domain}/use{Feature}.ts` | `src/features/registrations/useStudentRegistrations.ts` |
| Components | `src/components/{domain}/{Component}.tsx` | `src/components/events/EventCard.tsx` |
| API services | `src/services/api/{domain}.ts` | `src/services/api/student.ts` |
| Storage | `src/services/storage/{purpose}.ts` | `src/services/storage/qr-cache.ts` |

### 12.2 Screen State Handling

Every screen must handle four states:

```typescript
if (isLoading) return <LoadingState label="Loading..." />
if (isError) return <ErrorState description="..." onRetry={refetch} />
if (!data || data.length === 0) return <EmptyState title="..." action={...} />
return <DataView ... />
```

### 12.3 Cache Invalidation

When a mutation succeeds, invalidate all related query caches:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.memberships })
  queryClient.invalidateQueries({ queryKey: queryKeys.organizations })
}
```

### 12.4 Navigation Pattern

Use `expo-router`'s `router.push()` for all screen transitions:

```typescript
import { router } from 'expo-router'

// Navigate to a route
router.push('/(tabs)/registrations')
router.push(`/(tabs)/events/${eventId}/qr`)
router.push(`/(tabs)/orgs/${orgId}`)
```

### 12.5 Styling Pattern

Use `StyleSheet.create()` for all styles. Access theme colors via the ThemeContext:

```typescript
import { useTheme } from 'src/theme/ThemeContext'

const { colors } = useTheme()

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
})
```

### 12.6 Testing

Each new feature hook should have a corresponding `.test.ts` file:

```typescript
// src/features/registrations/useStudentRegistrations.test.ts
import { renderHook, waitFor } from '@testing-library/react-native'
// ... mock API, assert structure
```

See existing examples: `src/features/events/useStudentEvents.test.tsx`, `src/features/auth/useLoginMutation.test.tsx`.
