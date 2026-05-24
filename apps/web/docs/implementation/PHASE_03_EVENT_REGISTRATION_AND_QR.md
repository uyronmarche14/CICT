# Phase 3: Event Registration and QR

## Goal

Add student event registration with event-specific QR issuance and capacity-safe registration rules.

## Current Status

Complete.

- Backend registration model and core registration APIs exist.
- Student registration listing, own registration lookup, cancellation, and QR payload generation exist.
- Event capacity and eligibility checks exist in the backend foundation.
- Admin event detail page with registrations tab at `/admin/events/[id]`.
- Student portal at `/student/login`, `/student/events`, `/student/events/[id]`, `/student/registrations`, `/student/events/[id]/qr`.
- QR code display using `qrcode.react` with download support.
- Admin scan page at `/admin/events/[id]/scan` with manual check-in fallback.
- Public EventCard and event detail page now link to the student portal for registration.
- Legacy `/join` and `/leave` deprecated, redirect to student registration flow.
- Admin EventForm and EditEventForm expose registration settings (open/close, walk-ins).

## Dependencies

- Phase 2 student and academic records exist.
- Student identity is separate from admin identity.

## Changes

- Add `EventRegistration` as the source of truth for student participation.
- Extend events with:
  - `registeredCount`
  - `checkedInCount`
  - `registrationCloseAt`
  - `allowWalkIns`
  - `targetProgramIds`
  - `targetYearLevelIds`
  - `targetSectionIds`
  - `approvalSummary`
  - `processInstanceId`
- Add student APIs:
  - browse eligible events
  - register
  - cancel registration
  - view registration status
  - fetch event-specific QR payload

## API/Data Contracts

- Registration is allowed only when:
  - event is published
  - registration is open
  - capacity is available
  - student matches targeting rules
  - student has no active registration yet
- QR payload is server-signed and contains:
  - event identity
  - registration identity
  - student identity
  - nonce or version data

## Test Cases

- Duplicate registration is rejected.
- Full events reject new registration.
- Non-eligible students are rejected.
- QR payload is only available to the owning student registration.

## Acceptance Gate

- Registration counts remain correct under repeated requests.
- Student registration logic does not depend on legacy `Event.attendees`.

## Rollback Notes

- Student registration routes can be disabled independently from current public event display pages.
