# Phase 7: Mobile API and Client Contract

## Goal

Define and implement a stable student-facing API contract for future mobile clients.

## Current Status

In progress.

- Separate student auth routes exist.
- Student profile, event, registration, QR, and attendance endpoints have been started.
- Remaining work:
  - full client-contract review
  - response consistency hardening
  - end-to-end mobile UX alignment
  - final validation that the mobile-facing API covers all required student scenarios cleanly

## Dependencies

- Student auth exists.
- Student event registration and attendance data exist.

## Changes

- Add student API namespaces:
  - `/api/student/auth/*`
  - `/api/student/profile/*`
  - `/api/student/events/*`
  - `/api/student/registrations/*`
  - `/api/student/attendance/*`
  - `/api/student/qr/*`
- Keep student access scoped to the authenticated student only.

## API/Data Contracts

- Student bearer tokens are separate from admin cookie auth.
- Student can access only:
  - own profile
  - own registrations
  - own QR codes
  - own attendance history

## Test Cases

- Student token cannot access admin routes.
- Admin session cannot accidentally satisfy student ownership checks.
- QR and attendance endpoints return only self-owned data.

## Acceptance Gate

- Mobile clients can integrate without requiring admin-specific behavior.

## Rollback Notes

- Student routes can be disabled independently of admin routes and public content routes.
