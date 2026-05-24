# Phase 5: Approval Workflow

## Goal

Add a content approval workflow for news, announcements, and events without breaking current content management.

## Current Status

In progress.

- Backend approval states and guarded transitions exist for news, announcements, and events.
- Approval history model exists.
- Admin content list pages now expose submit, approve, reject, and publish actions based on workflow state.
- Remaining work:
  - dedicated approval queue
  - approval history timeline UI
  - clearer rejection reason surfacing
  - tighter reviewer-focused UX for approvers

## Dependencies

- Current content CRUD remains stable.
- Full Admin remains the only approver in v1.

## Changes

- Extend content states to include:
  - `draft`
  - `pending_approval`
  - `approved`
  - `rejected`
  - `published`
- Add `ContentApprovalAction`.
- Add actions:
  - submit for approval
  - approve
  - reject with reason
- Prevent direct publish from non-approved content once approval mode is enabled.

## API/Data Contracts

- Content creator can save draft and submit for approval.
- Full Admin can approve or reject.
- Rejection requires a reason.
- Publish requires `approved` state first.

## Test Cases

- Draft can be submitted.
- Non-approver cannot approve.
- Rejected content stores reason.
- Publish before approval is blocked.

## Acceptance Gate

- Approval state is enforceable from the backend.
- Update endpoints cannot bypass workflow rules.

## Rollback Notes

- Approval endpoints can be disabled while preserving existing content records.
