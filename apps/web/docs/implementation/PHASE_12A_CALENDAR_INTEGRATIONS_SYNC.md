# Phase 12A: Calendar Integrations and External Sync

## Goal

Add external calendar integration (iCal/Google Calendar export), recurring event support, push notification reminders, calendar search, mobile calendar sync, and print-friendly calendar output.

## Business Role in the Platform

Phase 12A makes the unified calendar portable and proactive. It should help users keep CICT work visible outside the web admin dashboard through personal calendars, reminders, mobile views, search, and print output.

This phase depends on Phase 12. It should export and enhance the unified calendar feed instead of rebuilding calendar logic per integration.

## Current Status

**Not started.** No backend or frontend implementation exists.

## Dependencies

- Phase 12 provides the core calendar aggregation system
- Mobile app exists with push notification infrastructure (PushToken model, Expo notifications)
- Phase 12 enables CalendarFeedService, preferences, and schedule model
- Event registration and attendance flows provide student-facing calendar relevance

## Changes

### Backend Features
- **iCal/Google Calendar Export** — Generate `.ics` from calendar feed with per-user unique feed URL
- **Recurring Events** — Extend Event model with `recurrenceRule` (RFC 5545 RRULE), calendar feed expands recurring events into occurrences
- **Push Notification Reminders** — Cron job checks upcoming items every 15 minutes, sends push via Expo
- **Calendar Search** — Full-text search across title, description, org name, location

### New Routes (~3)
```
GET  /api/calendar/export/ical  — generate .ics feed
GET  /api/calendar/search       — search calendar items
GET  /api/admin/calendar/print  — print-optimized view
```

### New Mobile Screens
```
(tabs)/calendar                    — Calendar tab in bottom nav
(tabs)/calendar/[date]            — Items for specific date
(tabs)/calendar/event/[id]        — Event detail from calendar
```

### New Components
- CalendarRecurrenceEditor, CalendarReminderSelector, CalendarSearchBar, CalendarPrintView, MobileCalendarList, MobileCalendarDay

## API/Data Contracts

- iCal export uses standard `text/calendar` MIME type with `.ics` filename
- Recurrence rules follow RFC 5545 RRULE format
- Push notification reminders checked via scheduled job
- Calendar search uses MongoDB text indexes on aggregated sources
- Mobile calendar uses same API as web with from/to range params

## Connection Rules

- iCal export should use the same permission-filtered feed as Phase 12.
- Reminder jobs should reference source records and avoid copying stale event/task data.
- Search should return normalized calendar items with links back to source modules.
- Mobile calendar should use the same feed contract as web.
- Print view should be a presentation layer over the same feed, not a separate query system.

## Recommended Feature Tasks

- Generate per-user iCal tokens that can be revoked.
- Support public calendar feeds only for public/published items.
- Add reminder preferences per source type, such as events only, meetings only, or all due dates.
- Add recurrence expansion in the feed layer with date-range limits.
- Add search filters by type, organization, status, and date range.
- Add mobile offline-friendly caching for upcoming items.

## Test Cases

- iCal export generates valid `.ics` importable by Google Calendar
- Recurring weekly event appears correctly in month view
- Push notification fires within 1 minute of reminder window
- Calendar search returns correct results for title matches
- Print view renders clean calendar grid suitable for PDF/paper

## Acceptance Gate

External calendar sync, recurring events, push notification reminders, calendar search, mobile calendar view, and print calendar all functional.

## Rollback Notes

All features are additive — disabling calendar integration has no effect on the core calendar or any underlying content.
