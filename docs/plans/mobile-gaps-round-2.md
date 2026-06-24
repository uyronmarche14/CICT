# CICT Mobile — Remaining Gaps (Round 2)

Last updated: 2026-06-14

This document identifies all remaining student-facing gaps between `apps/mobile` and `apps/web`, prioritized for implementation.

**Key insight:** Zero backend changes needed. Every gap is purely a mobile UI implementation waiting on data that already flows through the API.

---

## Feature Status Matrix

### 🔴 Gap 1: Walk-In Badge
| Aspect | Detail |
|---|---|
| **Backend field** | `event.allowWalkIns: boolean` |
| **Contract type** | `StudentEvent.allowWalkIns?: boolean` |
| **Files to modify** | `EventCard.tsx`, `events/[id].tsx` |
| **Effort** | ~10 min |
| **UI** | Add `StatusPill` with `tone="warning"` and `label="Walk-ins allowed"` on event cards and event detail when `allowWalkIns === true` |

### 🔴 Gap 2: Event Capacity Display
| Aspect | Detail |
|---|---|
| **Backend fields** | `maxAttendees`, `registeredCount`, `checkedInCount` |
| **Contract type** | All present on `StudentEvent` |
| **Files to modify** | `EventCard.tsx`, `events/[id].tsx` |
| **Effort** | ~15 min |
| **UI** | Show "X / Y registered" on cards. Show capacity card with registered + checked-in on detail. |

### 🔴 Gap 3: Registration Close Date
| Aspect | Detail |
|---|---|
| **Backend field** | `registrationCloseAt: string` |
| **Contract type** | `StudentEvent.registrationCloseAt?: string` |
| **Files to modify** | `events/[id].tsx` |
| **Effort** | ~5 min |
| **UI** | Show "Registration closes {date}" text in the registration section when `isRegistrationOpen` |

### 🔴 Gap 4: Venue Details
| Aspect | Detail |
|---|---|
| **Backend fields** | `venueDetails: { name?, address?, room?, capacity?, accessibility? }`, `mapUrl?: string` |
| **Contract type** | `StudentEvent.venueDetails?: VenueDetails`, `mapUrl?: string` |
| **Files to modify** | `events/[id].tsx` |
| **Effort** | ~20 min |
| **UI** | Replace flat `location` string with a venue card showing name, room, address, capacity, accessibility, and "Open in Maps" button |

### 🔴 Gap 5: Event Gallery
| Aspect | Detail |
|---|---|
| **Backend field** | `gallery: MediaAsset[]` |
| **Contract type** | `StudentEvent.gallery?: MediaAsset[]` |
| **Files to modify** | `events/[id].tsx` |
| **Effort** | ~15 min |
| **UI** | Horizontal `ScrollView` of thumbnail images below the hero image |

### 🟡 Gap 6: Eligibility Info (deferred)
| Aspect | Detail |
|---|---|
| **Backend fields** | `targetProgramIds`, `targetYearLevelIds`, `targetSectionIds` (IDs only, no readable labels) |
| **Status** | Deferred. Server-side filtering already works. Would need backend to return readable labels first. |

### 🟡 Gap 7: Updates Hub Scope Filter
| Aspect | Detail |
|---|---|
| **Backend field** | `ownerType: 'official' \| 'community' \| 'system'` |
| **Contract type** | `UpdateItem.ownerType?: string` — already present |
| **Files to modify** | `updates/index.tsx` |
| **Effort** | ~30 min |
| **UI** | Add scope filter row (All / Official / Community) between category tabs and search bar |

---

## Implementation Order

```
Sprint 1 (same batch):
  Gap 1 → Gap 2 → Gap 3 → Gap 4 → Gap 5  (all in event domain)

Sprint 2:
  Gap 7 (updates hub)
```
