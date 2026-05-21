# Organizations and Leaders Audit

Last updated: 2026-05-20

## Purpose

This document covers the current organization profile and member/leader profile system, with emphasis on the missing data and admin functions needed for student-organization operations.

## Current organization and member surfaces

- Public organization page: `/organization/[id]`
- Public member page: `/member/[id]`
- Admin organization management: `/admin/organizations`
- Backend organization model: `cict-backend/src/models/Organization.ts`

## What already works

- Organizations already store:
  `slug`, `name`, `fullName`, `description`, `longDescription`, `mission`, `vision`, `established`, `values`, `achievements`, `logo`, `banner`, and theme colors.
- Member records already support richer profile fields such as:
  `achievements`, `responsibilities`, `skills`, `timeline`, `gallery`, and social links.
- The public member page already renders many of those rich fields.
- The admin organization form already supports more profile depth than the member form.

## Current code anchors

- Public organization page: `/home/ronmarche14/projects/CICT/cictv4/src/app/organization/[id]/page.tsx`
- Public member page: `/home/ronmarche14/projects/CICT/cictv4/src/app/member/[id]/page.tsx`
- Admin organization form: `/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/AdminOrganizationForm.tsx`
- Admin member form: `/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/AdminMemberForm.tsx`
- Team section: `/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/sections/TeamSection.tsx`
- Achievements section: `/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/sections/AchievementsSection.tsx`
- Backend model: `/home/ronmarche14/projects/CICT/cict-backend/src/models/Organization.ts`

## Current gaps

### 1. Member data exists in the model, but admin cannot fully manage it

The public member page can display rich leader information, but the admin member form still only captures a smaller profile subset. This is one of the clearest backend-to-admin mismatch points in the system.

### 2. Public organization pages do not use all stored organization data

The organization model requires and stores richer content such as `longDescription`, but the current public organization page still leans on the short description and leaves several dynamic sections empty.

### 3. Leadership presentation is still flat

The team section is labeled as leadership-oriented, but it does not yet distinguish advisers, executive officers, committee heads, members, alumni, or past officers.

### 4. Achievements are too shallow

Organization achievements are still treated like plain strings. The public section then fills in generic display details, which means award data is not yet structured enough for confident reuse.

## Missing organization data to add next

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

## Missing leader and member data to add next

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

## Missing functions

- Full admin editing for leader achievements, responsibilities, skills, timeline, and gallery
- Role grouping and display ordering on public team pages
- Organization join-information rendering on public pages
- Structured organization achievements with year, title, description, and proof media
- Better linkage between organizations and their news, announcements, and events

## Priority recommendations

1. Bring the admin member form up to the level already supported by the model and public member page.
2. Expand the public organization page to use `longDescription` and real join/program data.
3. Add structured leadership grouping and term data.
4. Replace plain-string organization achievements with structured records.
