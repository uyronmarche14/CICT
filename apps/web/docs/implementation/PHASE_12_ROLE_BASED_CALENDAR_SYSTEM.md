# Phase 12: Role-Based Calendar System

## Goal

Build a unified, interactive calendar dashboard that aggregates events, announcements, meetings, tasks, deadlines, and academic milestones into a single view. Calendar content is dynamically filtered based on user role (super admin, org admin, semi-admin, student, public) and org scope.

## Business Role in the Platform

Phase 12 is the coordination layer for the whole system. It should help users answer: "What is happening, what is due, and what needs my attention?"

The calendar should aggregate real records from existing modules. It must not become a second place where admins create duplicate events or deadlines.

Primary use cases:
- Officers see org tasks, meetings, votes, event deadlines, and collaboration milestones.
- Advisers/moderators see the schedules of assigned organizations.
- Super admins see system-wide events, deadlines, and risk points.
- Students see published events, registered events, reminders, and relevant announcements.
- Collaboration participants see shared partnership/task-force/resource dates.

## Current Status

**Not started.** No backend or frontend implementation exists.

## Dependencies

- Phase 10 provides OrgMeeting, OrgTask models (calendar data sources)
- Phase 11 adds collaboration events and cross-org content
- Event, Announcement, News models exist with date fields
- Permission system provides role-scoping logic
- ProcessInstance provides approval/workflow deadlines when nodes or requirements become due

## Changes

### New Models (3)
- `CalendarViewPreference` — per-user calendar settings (default view, visible types/orgs, timezone)
- `CalendarSchedule` — recurring schedule entries with RRULE
- `CalendarEventReminder` — reminder preferences with push/email/in-app methods

### New Backend Service
- `CalendarFeedService` — aggregates across Event, Announcement, OrgMeeting, OrgTask into unified feed

Recommended feed sources:
- Event: startDate, endDate, registrationDeadline, registrationCloseAt.
- Announcement: effectiveDate, expiresAt, termStart, termEnd.
- OrgMeeting: date and duration.
- OrgTask: dueDate.
- OrgVote: startDate and endDate.
- OrgBudget/OrgTransaction: fiscal deadlines if added later.
- ProcessInstance: approval due dates if added later.
- Phase 11 records: resource dateNeeded, mentorship meetings, task-force start/end dates, partnership milestones.

### New Routes (~11)
```
GET  /api/calendar/feed — aggregated calendar items with date range + type + org filters
GET  /api/calendar/feed/upcoming — next N items
GET  /api/calendar/feed/today — today's items
GET  /api/calendar/schedules — list recurring schedules
POST/PUT/DELETE /api/calendar/schedules — manage schedules
GET/PUT /api/calendar/preferences — user preferences
GET  /api/calendar/icals — iCal feed URL generation
```

### New UI Pages & Components
```
/admin/calendar               — Full calendar dashboard page
/admin/calendar/widget        — Sidebar mini calendar widget
```
Components: CalendarView, CalendarMonthView, CalendarWeekView, CalendarDayView, CalendarAgendaView, CalendarFilterBar, MiniCalendar

## API/Data Contracts

- Calendar feed aggregates from multiple collections server-side into unified response
- Auth boundaries: students see published events + registered events; org admins see their org's content; super admins see everything
- Calendar is read-only aggregation — never a source of truth
- iCal export generates valid `.ics` file

## Unified Calendar Item Contract

Every feed item should normalize to a common shape:

```
{
  id: string,
  sourceType: 'event' | 'announcement' | 'task' | 'meeting' | 'vote' | 'process' | 'resource' | 'mentorship' | 'task_force',
  sourceId: string,
  title: string,
  description?: string,
  startsAt: string,
  endsAt?: string,
  allDay?: boolean,
  organizationId?: string,
  relatedOrganizationIds?: string[],
  status?: string,
  priority?: string,
  visibility: 'public' | 'student' | 'org_admin' | 'admin',
  href: string
}
```

## Business Logic Guardrails

- Calendar must respect the same org-scoped permissions as the source modules.
- Calendar items should link back to their source detail pages.
- Drag-and-drop rescheduling should only be enabled when the source module supports editing that date.
- Color should represent source type or organization consistently.
- Date filters should be server-side to avoid loading unnecessary historical data.
- Calendar should support fiscal year/semester views when reporting requires it.

## Test Cases

- Super admin calendar shows all org events, meetings, tasks
- Scoped org admin only sees their org's content
- Student calendar shows published events + registered events only
- Clicking calendar event navigates to correct detail page
- Filtering by type correctly removes other types

## Acceptance Gate

Calendar dashboard with month/week/day/agenda views is functional, role-based filtering works for all user types.

## Rollback Notes

Calendar is read-only aggregate view — disabling it has no data loss. All underlying content survives independently.
