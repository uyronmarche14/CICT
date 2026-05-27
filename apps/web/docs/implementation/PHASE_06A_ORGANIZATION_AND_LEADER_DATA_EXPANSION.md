# Phase 6A: Organization and Leader Data Expansion

## Goal

Bring organization and leader data up to the level already implied by the public pages and audit findings, so organizations, officers, advisers, and achievements can be managed structurally.

## Current Status

**Completed.**

- Organization and member models expanded with all requested fields.
- All new types added to contracts with Zod schemas.
- Backend types and Mongoose schema extended with structured subdocuments.
- Validators updated with optional field support.
- Controller whitelist expanded to pass through new fields.
- AdminOrganizationForm expanded with Profile, Membership, and Location sections.
- AdminMemberForm expanded with Leadership Details section.
- All new fields are optional — existing records work without migration.

## Dependencies

- Phase 6 process module can later attach to organization workflows, but does not block this phase.
- [ORGANIZATIONS_AND_LEADERS_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/ORGANIZATIONS_AND_LEADERS_AUDIT.md:1) defines the missing fields and functions.

## Changes

- Expand organization data with fields such as:
  - `tagline`
  - `officialEmail`
  - `socialLinks`
  - `adviserItems`
  - `officeLocation`
  - `meetingSchedule`
  - `membershipSize`
  - `joinRequirements`
  - `joinSteps`
  - `joinUrl`
  - `benefits`
  - `programs`
  - `flagshipEvents`
  - `partnerItems`
  - `committeeItems`
- Expand leader and member data with fields such as:
  - `termStart`
  - `termEnd`
  - `leadershipStatus`
  - `course`
  - `yearLevel`
  - `department`
  - `committee`
  - `displayOrder`
  - `isAdviser`
  - `contactNumber`
  - `projectItems`
  - `milestoneItems`
- Add structured achievement records instead of plain-string-only achievements.
- Improve team grouping and ordering on public pages.

## API/Data Contracts

- Existing member pages must continue to render older records safely.
- Admin forms should expose all structured fields already supported by the public surfaces.
- Organization-to-news, event, and announcement linkage should reuse IDs rather than free-form text.

## Test Cases

- Admin can create and edit enriched leader profiles.
- Public organization and member pages render grouped and ordered leadership data correctly.
- Structured achievements display without fallback fabrication.

## Acceptance Gate

- Admin organization/member editing matches the richness expected by the public pages.
- Organization join info, leadership grouping, and achievements are data-driven instead of placeholder-driven.

## Rollback Notes

- New organization and leader fields can remain optional if selected views are paused or hidden.
