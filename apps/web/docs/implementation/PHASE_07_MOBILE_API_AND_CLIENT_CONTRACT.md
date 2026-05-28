# Phase 7: Mobile API and Client Contract

## Goal

Define and implement a stable student-facing API contract for future mobile clients.

## Current Status

Complete.

- Student auth routes (register, login, refresh, logout, me, forgot-password, reset-password) all exist with separate JWT secrets.
- Student profile, events list/detail/register/cancel/QR, registrations, attendance history endpoints all exist.
- Student memberships (list, apply, resign) endpoints exist.
- Mobile API client has 8 service files (client, auth, student, events, news, announcements, public-announcements, memberships).
- 17 React Query hooks across auth, events, attendance, profile, news, announcements, orgs, settings.
- Mobile app has 17 route files with tabs (home, events, orgs, updates, settings).
- Push notification registration/unregister endpoints and Expo notifications integrated.
- This phase is fully implemented — the doc was incorrectly marked as in-progress.
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
