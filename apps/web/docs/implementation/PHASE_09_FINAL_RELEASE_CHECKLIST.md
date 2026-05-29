# Phase 9: Final Release Checklist

## Goal

Verify the entire expansion end to end and roll it out in a safe, reversible order.

## Current Status

Completed for the current release infrastructure.

- CI quality gates exist for contracts, backend, web, mobile, security audit, secret scan, and dependency review.
- Render staging/production backend deploy workflows exist.
- Vercel production frontend deployment is wired in the production workflow.
- Each new expansion phase still needs a fresh release signoff using this checklist before merge/deploy.

## Dependencies

- Prior phases have passed their acceptance gates.

## Changes

- Validate in this order:
  - admin auth and RBAC
  - student auth
  - academic data management
  - event registration
  - QR retrieval
  - attendance scanning
  - approval workflow
  - process linkage
  - audit visibility
- Enable modules in this order:
  - student data
  - student auth
  - event registration
  - attendance scanner
  - approval workflow
  - process module

## API/Data Contracts

- Existing public pages remain on their current published-content behavior unless a new flow is explicitly enabled.

## Test Cases

- Public content routes still work.
- Admin modules still work.
- Student routes enforce isolation and ownership.
- Approval and audit flows are complete.

## Acceptance Gate

- No regression in current public or admin features.
- New modules are secure, permission-safe, and release-ready.

## Rollback Notes

- Disable the newest phase first if an issue appears.
- Keep original admin and public routes operational as the stable fallback.
