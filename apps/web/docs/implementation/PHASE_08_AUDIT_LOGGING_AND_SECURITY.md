# Phase 8: Audit Logging and Security

## Goal

Expand observability and security controls for student auth, registration, attendance, approvals, and process actions.

## Current Status

Completed for the current release scope.

- Expanded audit metadata fields were added.
- Student registration, QR, attendance, and approval-related actions now have stronger logging hooks than before.
- `/api/audit` is mounted and protected for admins with `VIEW_LOGS`.
- Security regression coverage now includes admin session revalidation, cookie settings, content ownership boundaries, scoped admin visibility, and cached unpublished-content authorization.
- Operational follow-up:
  - retention policy review
  - denial and abuse tracing review
  - review what admins should see and for how long

## Dependencies

- Student, registration, attendance, and approval modules exist.

## Changes

- Expand audit log metadata with:
  - `actorType`
  - `actorId`
  - `studentId`
  - `eventId`
  - `organizationId`
  - `outcome`
  - `severity`
  - `reasonCode`
  - `correlationId`
- Log:
  - student login/logout
  - registration create/cancel
  - QR generation
  - scan attempts
  - approval actions
  - process actions
- Harden:
  - signed QR payloads
  - token audience separation
  - stronger rate limits
  - sanitized audit payloads

## API/Data Contracts

- Sensitive actions must leave an auditable trace.
- Logs must not expose secrets or raw tokens.

## Test Cases

- Critical actions create audit entries.
- Denied actions are traceable where required.
- Security-sensitive payloads remain sanitized.

## Acceptance Gate

- Audit trails are useful for incident review and operations.
- Security controls are additive and do not break the current CMS.

## Rollback Notes

- New audit fields can remain nullable if later features are disabled.
