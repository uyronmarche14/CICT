# CICT Organization Calendar — Architecture & Implementation Guide

## Document Information

| Field | Details |
|-------|---------|
| Project | CICT Portal |
| Feature | Organization Calendar System |
| Last Updated | 2026-06-12 |
| Status | Implemented |
| Related Plans | `CICT_ORGANIZATION_SYSTEM_IMPLEMENTATION_PLAN.md` — Phase 9 |

---

## 1. Overview

The Organization Calendar provides a unified, interactive month-grid calendar that aggregates all time-based data from an organization's modules (Tasks, Meetings, Events, Votes, Resource Requests) into a single view. The design follows a Notion-like aesthetic with full-viewport layout, dynamic row sizing, filter pills, a rich sidebar with day detail + upcoming items + quick stats.

### Locations

| Scope | URL Pattern | File |
|-------|------------|------|
| **Global calendar** (all orgs) | `/admin/calendar` | `app/admin/calendar/page.tsx` |
| **Org calendar** (single org) | `/admin/organizations/{orgId}/calendar` | `app/admin/organizations/[id]/calendar/page.tsx` |

The OrgSubNav renders a "Calendar" tab for every organization admin page, linking to `/admin/organizations/{orgId}/calendar`.

---

## 2. Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                   │
│                                                                    │
│  OrgCalendarPage                  AdminCalendarPage                │
│       │                                 │                         │
│       │ GET /api/organizations/         │ GET /api/calendar/feed   │
│       │   :orgId/calendar               │                         │
│       ▼                                 ▼                         │
│  ┌─────────────────┐            ┌──────────────────┐              │
│  │  CalendarHeader │            │ CalendarGrid     │              │
│  │  (month nav +   │            │ (7-col month     │              │
│  │   filter pills) │            │  grid, 1fr rows) │              │
│  └─────────────────┘            └──────────────────┘              │
│                                 ┌──────────────────┐              │
│                                 │ CalendarSidebar  │              │
│                                 │ (day detail +    │              │
│                                 │  upcoming +      │              │
│                                 │  quick stats)    │              │
│                                 └──────────────────┘              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                        BACKEND                                     │
│                                                                    │
│  organization.routes.ts          calendar.routes.ts                │
│       │                                 │                         │
│       │ requireAdminAccess               │ optionalAuthenticate    │
│       │ + authorizeOrganizationScope     │                         │
│       ▼                                 ▼                         │
│  organization.controller.ts      calendar.controller.ts           │
│       │ getOrgCalendar()                │ getCalendarFeed()        │
│       ▼                                 ▼                         │
│  org-calendar.service.ts         calendar-feed.service.ts          │
│       │                                 │                         │
│       │ Queries 5 source models:        │ Queries 5 source models: │
│       │  ● OrgMeeting                   │  ● Event (all orgs)      │
│       │  ● Event (org-scoped)           │  ● OrgMeeting            │
│       │  ● OrgTask                      │  ● OrgTask               │
│       │  ● OrgVote                      │  ● OrgVote               │
│       │  ● ResourceRequest              │  ● ResourceRequest       │
│       │                                 │                         │
│       │ Returns CalendarItem[]          │ Returns CalendarItem[]   │
│       ▼                                 ▼                         │
├────────────────────────────────────────────────────────────────────┤
│                        DATABASE                                    │
│                                                                    │
│  MongoDB collections:                                              │
│    orgmeetings, events, orgtasks, orgvotes, resourcerequests       │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Shared Data Contract

Both endpoints return items matching the `CalendarItem` type defined in `packages/contracts/src/types/calendar.ts`:

```typescript
export type CalendarItem = {
  id: string;                           // Unique ID with source prefix (e.g., "meeting-abc123")
  sourceType: CalendarSourceType;       // 'event' | 'meeting' | 'task' | 'vote' | 'resource'
  sourceId: string;                     // MongoDB _id of the source document
  title: string;                        // Display title
  description?: string;                 // Optional description
  startsAt: string;                     // ISO 8601 date string
  endsAt?: string;                      // Optional end date
  allDay?: boolean;                     // Whether this spans the whole day
  organizationId?: string;              // Org slug that owns this item
  organizationName?: string;            // Human-readable org name
  status?: string;                      // Current status (e.g., 'published', 'active', 'todo')
  priority?: string;                    // Priority level if applicable
  visibility: 'public' | 'student' | 'org_admin' | 'admin';  // Who can see this
  href: string;                         // Deep link to source detail page
};

export type CalendarSourceType =
  | 'event' | 'meeting' | 'task' | 'vote' | 'resource'
  | 'announcement' | 'process' | 'mentorship' | 'task_force';
```

---

## 4. Source Model → CalendarItem Field Mapping

### 4.1 OrgMeeting → CalendarItem

| CalendarItem Field | Source Field | Value |
|-------------------|-------------|-------|
| `id` | — | `meeting-{_id}` (prefixed for uniqueness) |
| `sourceType` | — | `'meeting'` |
| `sourceId` | `_id` | `String(m._id)` |
| `title` | `title` | `m.title` |
| `startsAt` | `date` | `m.date.toISOString()` |
| `organizationId` | — | Function parameter `organizationId` |
| `visibility` | — | `'org_admin'` |
| `href` | — | `/admin/organizations/{orgId}/meetings` |

### 4.2 Event → CalendarItem

| CalendarItem Field | Source Field | Value |
|-------------------|-------------|-------|
| `id` | — | `event-{_id}` |
| `sourceType` | — | `'event'` |
| `sourceId` | `_id` | `String(e._id)` |
| `title` | `title` | `e.title` |
| `startsAt` | `startDate` | `new Date(e.startDate).toISOString()` |
| `endsAt` | `endDate` | `e.endDate ? new Date(e.endDate).toISOString() : undefined` |
| `organizationId` | `organizationId` | `e.organizationId \|\| organizationId` |
| `status` | `status` | `e.status` |
| `visibility` | — | `'public'` |
| `href` | — | `/events/{_id}` |

### 4.3 OrgTask → CalendarItem

| CalendarItem Field | Source Field | Value |
|-------------------|-------------|-------|
| `id` | — | `task-{_id}` |
| `sourceType` | — | `'task'` |
| `sourceId` | `_id` | `String(t._id)` |
| `title` | `title` | `t.title` |
| `startsAt` | `dueDate` | `new Date(t.dueDate!).toISOString()` |
| `organizationId` | — | Function parameter `organizationId` |
| `status` | `status` | `t.status` |
| `visibility` | — | `'org_admin'` |
| `href` | — | `/admin/organizations/{orgId}/tasks` |

### 4.4 OrgVote → CalendarItem

| CalendarItem Field | Source Field | Value |
|-------------------|-------------|-------|
| `id` | — | `vote-{_id}` |
| `sourceType` | — | `'vote'` |
| `sourceId` | `_id` | `String(v._id)` |
| `title` | `title` | `v.title` |
| `startsAt` | `startDate` | `v.startDate.toISOString()` |
| `endsAt` | `endDate` | `v.endDate ? v.endDate.toISOString() : undefined` |
| `organizationId` | — | Function parameter `organizationId` |
| `visibility` | — | `'org_admin'` |
| `href` | — | `/admin/organizations/{orgId}/voting` |

### 4.5 ResourceRequest → CalendarItem

| CalendarItem Field | Source Field | Value |
|-------------------|-------------|-------|
| `id` | — | `resource-{_id}` |
| `sourceType` | — | `'resource'` |
| `sourceId` | `_id` | `String(r._id)` |
| `title` | `description` | `r.description \|\| 'Resource request'` |
| `startsAt` | `dateNeeded` | `new Date(r.dateNeeded!).toISOString()` |
| `organizationId` | — | Function parameter `organizationId` |
| `status` | `status` | `r.status` |
| `visibility` | — | `'org_admin'` |
| `href` | — | `/admin/organizations/{orgId}/resources` |

---

## 5. Route Configuration

### Org Calendar Route

**File:** `apps/backend/src/routes/organization.routes.ts:480-485`

```typescript
router.get(
  '/:orgId/calendar',
  requireAdminAccess,
  authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS),
  getOrgCalendar
);
```

**Middleware chain:**
1. `requireAdminAccess` — User must be authenticated and have admin panel access
2. `authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS)` — User must have org-scoped analytics permission for this specific org

### Controller

**File:** `apps/backend/src/controllers/organization.controller.ts:124-130`

```typescript
export const getOrgCalendar = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  const { startDate, endDate } = req.query as Record<string, string | undefined>;
  const items = await getCalendarService(orgId, startDate, endDate);
  res.json({ success: true, data: { items } });
};
```

### OrgSubNav Tab

**File:** `apps/web/src/components/organizations/OrgSubNav.tsx:54`

```typescript
{ label: 'Calendar', href: '/calendar', icon: CalendarDays },
```

The Calendar tab is always visible for all org admins (no permission gate — the backend middleware handles access control).

---

## 6. Frontend Component Tree

```
OrgCalendarPage (app/admin/organizations/[id]/calendar/page.tsx)
│
├── CalendarHeader (components/calendar/CalendarHeader.tsx)
│   ├── Month name + prev/next/today navigation
│   └── Type filter pills (Events, Meetings, Tasks, Votes, Resources)
│
├── <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
│   │
│   ├── CalendarGrid (components/calendar/CalendarGrid.tsx)
│   │   ├── Day headers row (Sun-Sat)
│   │   └── Calendar cells (35-42 per month, 7x5 or 7x6 grid)
│   │       ├── Day number badge (highlighted for today/selected)
│   │       └── Inline event chips (colored dot + truncated title)
│   │
│   └── CalendarSidebar (components/calendar/CalendarSidebar.tsx)
│       ├── Day Detail Card
│       │   ├── Selected date header + item count badge
│       │   └── Scrollable event cards with:
│       │       ├── Colored dot + type badge + status
│       │       ├── Title (clickable, links to source page)
│       │       ├── Time range
│       │       └── → arrow indicator
│       ├── Upcoming Section
│       │   └── Next 7 days items (compact: dot + title + date)
│       └── Quick Stats Grid
│           ├── 4 type count tiles (colored dot + count)
│           └── Total this month tile
```

### Design Specifications

| Element | Style |
|---------|-------|
| Page container | `h-[calc(100vh-10rem)] flex flex-col` — fills viewport |
| Grid+Sidebar | `lg:grid-cols-[1fr_420px]` — sidebar visible at 1024px+ |
| Grid cells | Dynamic `grid-template-rows: repeat(N, 1fr)` — cells stretch to fill height |
| Cell borders | `border-r border-b` only — no full rectangle borders |
| Today cell | `bg-primary text-primary-foreground font-bold` — blue circle |
| Selected cell | `bg-primary/5` — subtle tint |
| Inline event chip | `text-[10px] truncate text-muted-foreground` — subtle |
| Event hover | `hover:bg-muted/50` — soft highlight |
| Sidebar | `sticky top-6` — stays visible during scroll |
| Filter pills | Active: `bg-accent text-foreground shadow-sm`, Inactive: `text-muted-foreground` |
| Type colors | Blue (events), Emerald (meetings), Amber (tasks), Purple (votes), Rose (resources) |

---

## 7. API Response Format

Both endpoints return the same envelope:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "meeting-abc123",
        "sourceType": "meeting",
        "sourceId": "abc123",
        "title": "Weekly Standup",
        "startsAt": "2026-03-25T14:00:00.000Z",
        "organizationId": "ict-sf",
        "visibility": "org_admin",
        "href": "/admin/organizations/ict-sf/meetings"
      },
      {
        "id": "event-def456",
        "sourceType": "event",
        "sourceId": "def456",
        "title": "Tech Talk: AI in Education",
        "startsAt": "2026-03-26T10:00:00.000Z",
        "endsAt": "2026-03-26T11:30:00.000Z",
        "organizationId": "ict-sf",
        "status": "published",
        "visibility": "public",
        "href": "/events/def456"
      }
    ]
  }
}
```

---

## 8. Verification Checklist

| Check | Command / Action |
|-------|-----------------|
| Backend compiles | `pnpm run backend:typecheck` |
| Web compiles | `pnpm run web:typecheck` |
| API returns correct shape | `curl http://localhost:4000/api/organizations/{orgId}/calendar` (with auth cookie) |
| Calendar page loads | Navigate to `/admin/organizations/{orgId}/calendar` |
| Month grid renders | Grid cells show day numbers + event chips with colored dots |
| Sidebar appears | Right side shows day detail, upcoming section, quick stats |
| Type filters work | Click filter pills to toggle: events, meetings, tasks, votes, resources |
| Selected day shows items | Click a day cell → sidebar title changes + shows items for that day |
| Event chips link correctly | Click an event chip → navigates to source detail page |
| Upcoming section works | Shows next 7 days items sorted by date |
| Quick stats accurate | Counts match actual items in the grid |

---

## 9. Common Issues & Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Calendar page loads but no items | Backend `org-calendar.service.ts` returns wrong field names | Ensure `date` → `startsAt`, `type` → `sourceType` |
| Sidebar not visible | Screen width < 1024px (lg breakpoint not reached) | Widen browser window |
| Filter pills don't work | `activeTypes` Set not updating | Check `onToggleType` handler |
| Links not working | `href` field missing from backend response | Verify each source type builds `href` |
| TypeScript errors | Contracts type not imported | Import `CalendarItem` from `@cict/contracts/types` |

---

## 10. Files Reference

| File | Layer | Purpose |
|------|-------|---------|
| `packages/contracts/src/types/calendar.ts` | Contracts | `CalendarItem`, `CalendarSourceType` type definitions |
| `apps/backend/src/services/org-calendar.service.ts` | Backend | Aggregates 5 source models into `CalendarItem[]` for a single org |
| `apps/backend/src/services/calendar-feed.service.ts` | Backend | Aggregates across all orgs with role-based filtering |
| `apps/backend/src/controllers/organization.controller.ts` | Backend | Controller wrapper for org calendar (line 124) |
| `apps/backend/src/controllers/calendar.controller.ts` | Backend | Controller wrapper for global calendar feed |
| `apps/backend/src/routes/organization.routes.ts` | Backend | Route registration (line 480) |
| `apps/backend/src/routes/calendar.routes.ts` | Backend | Global calendar route registration |
| `apps/web/src/app/admin/calendar/page.tsx` | Frontend | Global calendar page |
| `apps/web/src/app/admin/organizations/[id]/calendar/page.tsx` | Frontend | Org calendar page |
| `apps/web/src/components/calendar/CalendarGrid.tsx` | Frontend | Month grid with dynamic 1fr rows |
| `apps/web/src/components/calendar/CalendarSidebar.tsx` | Frontend | Rich sidebar with day detail + upcoming + stats |
| `apps/web/src/components/calendar/CalendarHeader.tsx` | Frontend | Month navigation + type filter pills |
| `apps/web/src/components/calendar/CalendarEventCard.tsx` | Frontend | Reusable compact + detailed event cards |
| `apps/web/src/components/organizations/OrgSubNav.tsx` | Frontend | Sub-navigation bar with Calendar tab |
