# Phase 2: Student and Academic Data

## Goal

Add the student identity domain and academic grouping foundation for later mobile, registration, and attendance features.

## Current Status

Completed for the planned v1 foundation.

- Student, program, year level, section, and session models were added.
- Admin student management and academic settings pages were added.
- Student status, filtering, and academic relationships now exist end to end.
- Future work stays in later phases: richer student UX, mobile consumption, and attendance-facing flows.

## Dependencies

- Phase 1 guardrails are active.
- Admin-only identity remains separate from student identity.

## Changes

- Add models:
  - `Program`
  - `YearLevel`
  - `Section`
  - `Student`
  - `StudentSession`
- Add admin modules:
  - `Students`
  - `Student settings`
- Add admin flows:
  - create student
  - update student
  - activate/deactivate student
  - filter by program, year level, section, and status
- Add academic settings flows:
  - create/update programs
  - create/update year levels
  - create/update sections

## API/Data Contracts

- Student login identity supports `student number or email`.
- Student records include:
  - `studentNumber`
  - `email`
  - `passwordHash`
  - `firstName`
  - `lastName`
  - `middleName`
  - `programId`
  - `yearLevelId`
  - `sectionId`
  - `status`
  - `isActive`
  - `lastLoginAt`
  - `qrVersion`
- Program records include:
  - `code`
  - `name`
  - `isActive`
  - `sortOrder`
- Year level records include:
  - `code`
  - `label`
  - `numericLevel`
  - `isActive`
  - `sortOrder`
- Section records include:
  - `programId`
  - `yearLevelId`
  - `name`
  - `displayName`
  - `isActive`

## Test Cases

- Student number uniqueness is enforced.
- Program, year level, and section references validate correctly.
- Admin can create and filter students.
- Disabled students cannot use student auth later.

## Acceptance Gate

- Admin can manage students and academic records end to end.
- Data relationships remain consistent and filterable.

## Rollback Notes

- Student and academic modules can be disabled without affecting current admin users or public content.
