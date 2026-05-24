# Phase 4: Attendance and Scanner

## Goal

Add event-scoped attendance scanning with single check-in behavior, duplicate detection, and manual fallback.

## Current Status

In progress.

- Attendance log model exists.
- Backend attendance scanning logic and result codes exist.
- QR validation, duplicate protection, and walk-in-aware backend logic exist.
- Remaining work:
  - scanner page
  - attendance list and summary UI
  - manual fallback search UI
  - event detail tabs for registrations, attendance, and scanner

## Dependencies

- Phase 3 event registrations and QR payloads exist.

## Changes

- Add `EventAttendanceLog`.
- Add admin event tabs:
  - `Overview`
  - `Registrations`
  - `Attendance`
  - `Scanner`
- Add scanner rules:
  - single successful scan marks attendance
  - repeated valid scan returns `duplicate`
  - walk-ins remain admin-controlled only
- Add manual fallback search by:
  - student name
  - student number
  - registration record

## API/Data Contracts

- Allowed scan results:
  - `success`
  - `duplicate`
  - `not_registered`
  - `event_full`
  - `not_eligible`
  - `registration_closed`
  - `invalid_qr`
  - `denied`

## Test Cases

- Valid scan succeeds once.
- Replay scan returns `duplicate`.
- Tampered QR returns `invalid_qr`.
- Manual fallback cannot bypass permissions or eligibility rules.

## Acceptance Gate

- Attendance is reliable and auditable.
- Failed scans still leave meaningful trace records.

## Rollback Notes

- Scanner UI and scan endpoints can be disabled without disabling student registrations.
