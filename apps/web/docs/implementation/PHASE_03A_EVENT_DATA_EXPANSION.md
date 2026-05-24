# Phase 3A: Event Data Expansion

## Goal

Expand event data beyond basic editorial fields so student-organization events can support richer registration, venue, speaker, attachment, and public-display needs.

## Current Status

Not started.

- Core event workflow and registration foundations exist.
- Rich event metadata from the audit has not yet been added as structured fields end to end.

## Dependencies

- Phase 3 registration foundation exists.
- Phase 4 attendance logic can consume expanded event fields later, but does not block this phase.
- [EVENTS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/EVENTS_SYSTEM_AUDIT.md:1) is the content-gap reference.

## Changes

- Add event profile fields such as:
  - `registrationUrl`
  - `registrationDeadline`
  - `contactName`
  - `contactEmail`
  - `contactPhone`
  - `hostOrganizationIds`
  - `coHostOrganizationIds`
  - `speakerItems`
  - `audience`
  - `eligibility`
  - `feeLabel`
  - `certificateInfo`
  - `venueDetails`
  - `mapUrl`
  - `meetingUrl`
  - `requirements`
  - `attachmentItems`
  - `posterCaption`
- Add public and admin filters that use the richer event structure.
- Improve organization event presentation and event ranking inputs.

## API/Data Contracts

- New fields must be additive and optional until all UIs consume them.
- Expanded event fields must not break current public event rendering.
- Registration and attendance logic continues to use dedicated registration and attendance collections.

## Test Cases

- Existing event create/edit still works when new fields are omitted.
- Expanded event fields save and render correctly.
- Public event lists and detail pages remain stable with mixed old and new records.

## Acceptance Gate

- Event records can represent real campus event operations without free-form overloading.
- Admin forms and public event pages both use the new structured fields.

## Rollback Notes

- Expanded event fields can remain nullable and hidden from UI if a subset needs to be disabled.
