# CICT Mobile — Next Steps Plan

**Status:** Draft  
**Last updated:** 2026-06-14  
**Target audience:** Lead mobile developer, software engineers  
**Scope:** Production hardening, missing admin features, animation polish

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Sprint A: Production Readiness](#2-sprint-a-production-readiness)
3. [Sprint B: Admin Polish](#3-sprint-b-admin-polish)
4. [Sprint C: Animation Layer](#4-sprint-c-animation-layer)
5. [Optional: Student Enhancements](#5-optional-student-enhancements)
6. [Backend Changes Needed](#6-backend-changes-needed)
7. [Test Coverage Targets](#7-test-coverage-targets)

---

## 1. Current State Summary

### What Exists

| Layer | Status | Details |
|---|---|---|
| **Student app** | ✅ Complete | All features shipped, web parity achieved, mobile-exclusive advantages (dark mode, push notifications, offline QR, haptics) |
| **Admin app** | ✅ Substantially complete | 7 tabs, 19 route files, 7 API services, 10 feature hooks, 17 components |
| **Architecture** | ✅ Unified | Admin routes at `app/(admin)/` alongside student `(tabs)/` in `apps/mobile` |
| **Auth** | ✅ Dual auth | Student + admin JWT flows, SecureStore, auto-refresh |
| **RBAC** | ✅ Implemented | `canUseAdminTab()` reads backend permission payload, gates every admin tab |
| **CI** | ✅ Working | `mobile-checks` job in GitHub Actions |
| **CD (Android)** | ✅ Configured | EAS build on push to main |

### What's Missing

| Priority | Gap | Risk |
|---|---|---|
| 🔴 | **Zero admin tests** | No safety net for admin features — any refactor could break scanning, approvals, etc. |
| 🔴 | **No crash reporting** | Blind to production errors — can't diagnose user-facing crashes |
| 🔴 | **No iOS builds** | No `eas.json` iOS profile — iPhone-using admins can't use the app |
| 🟡 | **`content/[id].tsx` missing** | Content list exists but no detail/preview screen for news/announcements |
| 🟡 | **Scan sounds not wired** | `expo-av` installed but not integrated — no audio feedback on QR scan |
| 🔵 | **Skeleton loaders** | All 10 admin screens use plain `ActivityIndicator` spinners |
| 🔵 | **Staggered card entrances** | Cards render statically in lists — no fade-up animation |
| 🔵 | **Scan result animation** | Static overlay — no spring scale-in effect |
| 🔵 | **Tab bar haptics** | Not wired — no tactile feedback on tab press |

---

## 2. Sprint A: Production Readiness (~6h)

### Goal

Make the admin mobile app production-safe: error tracking, test coverage, iOS support.

### A1 — Crash Reporting with Sentry (~1h)

**Problem:** No visibility into production crashes. If an admin experiences a crash while scanning QR codes, there is no way to diagnose the issue.

**Solution:** Install `@sentry/react-native` and initialize it at app startup.

**Implementation:**

```
apps/mobile/package.json
  + "@sentry/react-native": "^6.x"

apps/mobile/app/_layout.tsx
  import * as Sentry from '@sentry/react-native';
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    tracesSampleRate: 0.2,
  });

app.json
  + "plugins": ["sentry-expo"]
```

**Files to modify:**
| File | Change |
|---|---|
| `apps/mobile/package.json` | Add `@sentry/react-native` |
| `apps/mobile/app.json` | Add `sentry-expo` plugin |
| `apps/mobile/app/_layout.tsx` | Initialize Sentry before render |

**Verification:** Trigger a test error in development, confirm it appears in Sentry dashboard.

---

### A2 — Admin Test Suite (~4h)

**Problem:** Zero tests exist for any admin feature. 8 feature hooks, 17 components, and the access utility have zero coverage. Any refactoring or enhancement risks breaking critical admin flows (scanning, approvals, etc.).

**Solution:** Write tests for all admin hooks and key components following the existing test patterns in `src/features/auth/useLoginMutation.test.tsx`.

#### A2a — Hook Tests (8 test files)

| File | Hooks to Test | Key Scenarios |
|---|---|---|
| `src/features/events/useAdminEvents.test.ts` | `useAdminEvents`, `useAdminEvent` | Loading state → shows nothing. Success → returns event list/detail. Error → returns error. |
| `src/features/scanner/useScanAttendance.test.ts` | `useScanAttendance` | Success → calls API, invalidates logs. Failure → returns error. |
| `src/features/scanner/useUndoCheckIn.test.ts` | `useUndoCheckIn` | Success → invalidates attendance logs + event + registrations. |
| `src/features/approvals/useApprovals.test.ts` | `usePendingApprovals`, `useApproveContent`, `useRejectContent` | Load queue → returns items. Approve → calls API, invalidates queue. Reject → calls API with reason. |
| `src/features/students/useStudents.test.ts` | `useStudentList`, `useToggleStudentStatus` | List with filters → correct API call. Toggle status → toggles isActive. |
| `src/features/organizations/useOrganizations.test.ts` | `useOrganizations`, `useOrganizationDetail` | List → returns orgs. Detail → returns single org. |
| `src/features/content/useContent.test.ts` | `useContentList`, `usePublishContent` | Combined news + announcements list → merged + sorted. Publish → calls API, invalidates. |
| `src/features/calendar/useCalendar.test.ts` | `useCalendarFeed` | Returns items within date range. Handles empty response. |

**Test pattern (following `useLoginMutation.test.tsx`):**
```typescript
const mockList = jest.fn();
jest.mock('@/services/api/admin-events', () => ({
  adminEventsApi: { listEvents: (...args) => mockList(...args) },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

it('returns events on success', async () => {
  mockList.mockResolvedValueOnce(mockEvents);
  const { result } = renderHook(() => useAdminEvents(), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(mockEvents);
});
```

#### A2b — Component Tests (3 test files)

| File | Component | Key Scenarios |
|---|---|---|
| `src/components/approvals/ApprovalCard.test.tsx` | `ApprovalCard` | Renders title/type/submitter. Approve button fires onApprove. Reject button fires onReject. Loading state shows spinner. |
| `src/components/approvals/RejectDialog.test.tsx` | `RejectDialog` | Visible → shows modal. Submit with empty reason → disabled. Submit with reason → calls onConfirm. Cancel → calls onCancel. |
| `src/components/scanner/ScanResultPanel.test.tsx` | `ScanResultPanel` | Success result → shows green checkmark. Error result → shows red error. Auto-dismiss fires after timeout. Undo button calls onUndo. |

#### A2c — Utility Tests (1 test file)

| File | Function | Key Scenarios |
|---|---|---|
| `src/utils/admin-access.test.ts` | `canUseAdminTab` | Full admin → all tabs visible. Scoped admin → only scoped tabs visible. No admin access → all false. Null profile → all false. |

**Mocking pattern:**
```typescript
// Mock useAuthStore for admin-access tests
jest.mock('@/store/auth-store', () => ({
  useAuthStore: (selector?: any) => {
    const state = { adminProfile: mockProfile };
    return selector ? selector(state) : state;
  },
}));
```

---

### A3 — iOS Build Configuration (~1h)

**Problem:** `eas.json` only has Android build profiles. No iOS bundle identifier or profile exists. Admin users on iPhones cannot build or run the app.

**Solution:** Add iOS configuration to `app.json` and `eas.json`.

**`apps/mobile/app.json`:**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.cict.admin",
      "infoPlist": {
        "NSCameraUsageDescription": "Camera access is needed to scan student QR codes for attendance."
      }
    }
  }
}
```

**`apps/mobile/eas.json`:**
```json
{
  "build": {
    "development": {
      "ios": { "simulator": true }
    },
    "preview": {
      "ios": { "buildConfiguration": "Release" }
    },
    "production": {
      "ios": {}
    }
  }
}
```

**Note:** iOS builds require a paid Apple Developer account ($99/year). The Expo EAS service handles the build, but the account must be linked.

---

## 3. Sprint B: Admin Polish (~3h)

### Goal

Close remaining feature gaps: content detail screen, scan sounds, skeleton loaders.

### B1 — Content Detail Screen (~1h)

**Problem:** `content/index.tsx` lists news and announcements but tapping a card does nothing. There is no `content/[id].tsx` route to preview content details.

**Solution:** Create a read-only detail screen.

**`app/(admin)/content/[id].tsx`:**
```
┌──────────────────────────────────┐
│ ← Content                        │
│                                  │
│ Status: [Published]              │
│                                  │
│ "New Lab Opening"                │
│ By Juan Dela Cruz               │
│ Published: Jun 12, 2026         │
│                                  │
│ ──────────────────────────────── │
│                                  │
│ (HTML body text, stripHtml)     │
│                                  │
│ ──────────────────────────────── │
│                                  │
│ Tags: facility, campus          │
└──────────────────────────────────┘
```

**Data:** Fetch via `GET /news/:id` or `GET /announcements/:id` depending on type.

**Files to create:**
| File | Purpose |
|---|---|
| `app/(admin)/content/[id].tsx` | Read-only detail: fetch by ID + type, show title, status, author, body (stripHtml), timestamps, tags |

**Files to modify:**
| File | Change |
|---|---|
| `app/(admin)/content/index.tsx` | Pass `onPress` to `ContentCard` → navigate to `/(admin)/content/${item.type}/${item._id}` (or just `[id].tsx` with type in params) |

**Expo Router route:** Since both news and announcements share the same detail screen, use a query param `?type=news` or `?type=announcement` to differentiate.

---

### B2 — Scan Sound Effects (~0.5h)

**Problem:** `expo-av` is installed but not wired. QR scan results have no audio feedback. The scanner silently shows a result overlay with no audible confirmation.

**Solution:** Play short audio files based on scan result type.

**Implementation:**

```typescript
// In ScanResultPanel.tsx or scanner/[id].tsx
import { Audio } from 'expo-av';

async function playSound(result: string) {
  const soundMap: Record<string, any> = {
    success: require('@/assets/audio/success.mp3'),
    duplicate: require('@/assets/audio/warning.mp3'),
    invalid_qr: require('@/assets/audio/error.mp3'),
  };
  const source = soundMap[result] ?? soundMap.invalid_qr;
  const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
  });
}
```

**Files to modify:**
| File | Change |
|---|---|
| `components/scanner/ScanResultPanel.tsx` | Call `playSound(result)` when result is shown |

**Audio assets needed:**
| File | Source | Description |
|---|---|---|
| `assets/audio/success.mp3` | Free sound effect library | Short positive chime (~0.5s) |
| `assets/audio/warning.mp3` | Free sound effect library | Two-tone alert (~0.5s) |
| `assets/audio/error.mp3` | Free sound effect library | Short error buzz (~0.5s) |

---

### B3 — Skeleton Loaders (~1.5h)

**Problem:** All 10 admin list screens use `LoadingState` which shows a centered `ActivityIndicator` spinner. This gives no indication of the content shape and feels unpolished.

**Solution:** Replace `LoadingState` with `<AppSkeleton lines={N} />` on all admin list screens. The `AppSkeleton` component already exists at `src/components/ui/AppSkeleton.tsx`.

**Skeleton configuration per screen:**

| Screen | Lines | Layout Notes |
|---|---|---|
| `dashboard.tsx` | 2 | 2 metric card placeholders |
| `events/index.tsx` | 3 | Title + 2 body lines per card |
| `events/[id]/registrations.tsx` | 2 | Name + student number |
| `events/[id]/attendance.tsx` | 2 | Name + result badge |
| `students.tsx` | 3 | Avatar + name + academic info |
| `organizations.tsx` | 4 | Banner + logo + name + description |
| `approvals.tsx` | 3 | Type icon + title + buttons |
| `calendar/index.tsx` | 3 | Dot + title + time |
| `content/index.tsx` | 3 | Type icon + title + status |
| `scanner/index.tsx` | 3 | Title + date + capacity bar |

**Migration pattern** (replace in every screen's loading branch):
```tsx
// Before:
if (isLoading) return <LoadingState label="Loading events..." />;

// After:
if (isLoading) return (
  <View style={{ gap: spacing.sm }}>
    <AppSkeleton lines={3} />
    <AppSkeleton lines={3} />
  </View>
);
```

**Files to modify:** All 10 screens listed above.

---

## 4. Sprint C: Animation Layer (~4h)

### Goal

Add subtle, performant animations to make the app feel polished and responsive.

### C1 — Staggered Card Entrance (~1.5h)

**Problem:** All list screens render cards statically. There is no visual feedback when data loads — cards simply appear.

**Solution:** Wrap card renders with `AnimatedCard` component (already exists at `src/components/ui/AnimatedCard.tsx`). Add `index` prop for stagger delay.

**Migration pattern:**
```tsx
// Before:
{items.map((item) => (
  <AdminEventCard key={item._id} event={item} onPress={...} />
))}

// After:
{items.map((item, index) => (
  <AnimatedCard key={item._id} index={index}>
    <AdminEventCard event={item} onPress={...} />
  </AnimatedCard>
))}
```

**Screens to update:**
| Screen | Animation |
|---|---|
| `events/index.tsx` | Staggered fade-up |
| `students.tsx` | Staggered fade-up |
| `organizations.tsx` | Staggered fade-up |
| `approvals.tsx` | Staggered fade-up |
| `content/index.tsx` | Staggered fade-up |
| `calendar/index.tsx` | Staggered fade-up |

---

### C2 — Scan Result Spring Animation (~1h)

**Problem:** The scan result overlay (`ScanResultPanel.tsx`) is a static card. There is no entrance animation — it appears instantly with no physical feel.

**Solution:** Add an `Animated.spring` entrance to the result card:

```typescript
// In ScanResultPanel.tsx
const scaleAnim = useRef(new Animated.Value(0.6)).current;
const opacityAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (visible) {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }
}, [visible]);
```

**Files to modify:**
| File | Change |
|---|---|
| `components/scanner/ScanResultPanel.tsx` | Wrap result card in `Animated.View` with spring scale + opacity |

---

### C3 — Tab Bar Haptics (~0.5h)

**Problem:** The admin tab bar (`BottomTabBar` / `BottomTabItem`) has no haptic feedback when switching tabs. Each tab switch is silent and feel-less.

**Solution:** Add `hapticLight()` from `@/utils/haptics` to the `onPress` handler in `BottomTabItem`.

**Files to modify:**
| File | Change |
|---|---|
| `components/navigation/bottom-tab-item.tsx` | Call `hapticLight()` on press |

---

### C4 — Empty State Audit (~1h)

**Problem:** Some screens may display incorrect or missing empty state messages.

**Solution:** Audit all admin list screens for correct `EmptyState` usage:

| Screen | Empty State Message |
|---|---|
| `events/index.tsx` | "No events found. Try a different search or filter." |
| `students.tsx` | "No students found. Try adjusting your search or filters." |
| `organizations.tsx` | "No organizations found." |
| `approvals.tsx` | "No pending approvals. All content has been reviewed." |
| `calendar/index.tsx` | "Nothing scheduled for the next 7 days." |
| `content/index.tsx` | "No content found matching the current filters." |
| `events/[id]/registrations.tsx` | "No registrations yet." |
| `events/[id]/attendance.tsx` | "No attendance logs recorded." |

---

## 5. Optional: Student Enhancements

These are lower priority but high value for the student app:

| Feature | Effort | Description |
|---|---|---|
| **Profile editing** | ~2h | Allow students to edit phone, address, aboutMe. Requires `PUT /student/profile` backend endpoint (check if it exists) |
| **Biometric unlock** | ~1h | Allow students to unlock the app with fingerprint/FaceID. Uses `expo-local-authentication` to validate biometric + SecureStore for token |

---

## 6. Backend Changes Needed

| Change | For | Backend Work |
|---|---|---|
| None | Sprint A | Zero backend changes — all test mock data is synthetic |
| None | Sprint B | All API endpoints already exist |
| None | Sprint C | Pure client-side animations — no backend involvement |

**Total backend changes: ZERO across all 3 sprints.**

---

## 7. Test Coverage Targets

| Area | Current | Target (Sprint A) |
|---|---|---|
| Admin feature hooks | 0% | 8 hook files, ~5 tests each = 40 tests |
| Admin components | 0% | 3 component files, ~3 tests each = 9 tests |
| Admin utilities | 0% | 1 utility file, ~4 tests = 4 tests |
| Student features | ~41 tests | Maintain existing |

**Goal:** 53 new admin tests → total ~94 tests.

---

## Summary

| Sprint | Hours | Key Deliverables |
|---|---|---|
| A: Production Readiness | 6 | Sentry crash reporting, 53 admin tests, iOS build config |
| B: Admin Polish | 3 | Content detail screen, scan sounds, skeleton loaders |
| C: Animation Layer | 4 | Staggered card entrances, spring scan result, tab haptics, empty state audit |
| **Total** | **~13h** | **Production-ready, polished, tested admin mobile app** |

---

*End of plan.*
