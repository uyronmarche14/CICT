# Phase 11A: Cross-Institutional Collaboration

## Goal

Extend collaboration beyond CICT orgs to other colleges, departments, schools, and universities. Enable inter-college events, external participant management, MOA/MOU tracking, guest access, and a federation gateway for external institutions to discover and join collaborative initiatives.

## Business Role in the Platform

Phase 11A should not be a separate collaboration system. It should extend Phase 11 from internal CICT organizations to verified external institutions.

Start this phase only when Phase 11 has:
- A stable partnership lifecycle.
- Collaboration spaces that can attach to a partnership.
- Clear resource/content/task-force/mentorship workflows.
- Outcome reporting that can support official agreements.

External institutions add legal/administrative weight, so the workflow must include verification, agreement tracking, access limits, and guest accountability.

## Current Status

**Not started.** No backend or frontend implementation exists.

## Dependencies

- Phase 11 provides the partnership and collaboration framework (reused for external entities)
- Institution model is new (no existing equivalent)
- Student model is CICT-only (new external participant concept needed)
- Phase 12 should eventually expose inter-institutional event dates and guest deadlines

## Changes

### New Models (5)
- `ExternalInstitution` — external school/department/college profile with verification
- `ExternalParticipant` — guest user from another institution
- `InterInstitutionalEvent` — event spanning multiple institutions with registration limits
- `InstitutionMoa` — memorandum of agreement with lifecycle
- `InterInstitutionalAgreement` — broader agreement type

### New Routes (~15)
```
POST/GET/GET/PUT /api/admin/external-institutions — institution registry CRUD
POST/PUT/GET     /api/admin/external-participants — external participant management
POST/GET/PUT     /api/admin/moa                 — MOA management
POST/GET         /api/admin/inter-institutional-events — cross-institution events
POST             /api/public/external/register   — external self-registration
GET              /api/public/institutions        — public institution listing
```

### New Permissions (4)
`MANAGE_EXTERNAL_INSTITUTIONS`, `MANAGE_EXTERNAL_PARTICIPANTS`, `MANAGE_MOA`, `MANAGE_INTER_INSTITUTIONAL`

### New UI Pages
```
/admin/settings/external-institutions      — Institution registry
/admin/settings/external-participants      — External participant directory
/admin/settings/moa                        — MOA management
/admin/events/[id]/inter-institutional     — Inter-institutional event settings
```

## API/Data Contracts

- External institutions require admin verification before public listing
- External participants limited to event registration + attendance only
- MOA lifecycle: draft → pending_signature → active → expiring → expired → renewed
- Guest pass system for time-limited event check-in

## Connection Rules

- `ExternalInstitution` should map into the same collaboration concepts used by internal organizations, but with stricter verification.
- MOA/MOU records should attach to partnerships or inter-institutional initiatives.
- External participants should be limited-purpose identities, not full internal students.
- Inter-institutional events should reuse the existing Event, registration, attendance, and approval systems where possible.
- Calendar and analytics should be able to include external collaboration dates and outcomes after Phase 12 is available.

## Recommended Data Links

- `externalInstitutionId` on agreement, participant, guest pass, and inter-institutional event records.
- `partnershipId` or `agreementId` on external collaboration spaces and events.
- `eventId` on guest passes and external participant registrations.
- `verificationStatus`, `verifiedBy`, `verifiedAt`, `agreementStatus`, and `expiresAt` for compliance.

## Test Cases

- External institution registration requires admin verification
- External participant can register for event without CICT student login
- MOA status transitions follow defined state machine
- Inter-institutional event shows correct registration counts per institution

## Acceptance Gate

External institution registry, MOA management lifecycle, and inter-institutional event support with external participant registration and check-in all functional.

## Rollback Notes

New collections only — no changes to existing org or student data. Can be disabled by removing route banks.
