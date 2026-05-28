# Phase 7A: Landing Page and Updates Hub Expansion

## Goal

Upgrade the landing page and updates hub so the richer event, news, announcement, organization, and leader data can be surfaced as meaningful dynamic features.

## Current Status

Partially complete.

**Completed:**
- Event ordering by schedule proximity — `normalizeEventUpdateItem()` in `updates-hub.ts` now sorts by `startDate` instead of `createdAt`.
- **Organization Spotlight section** — `spotlightOrganizationsSection.tsx` added to landing page between Story and News sections. Shows up to 4 active orgs in a card grid with banner, logo, tagline, type badge, and member count.
- **Achievement Spotlight section** — `spotlightAchievementsSection.tsx` added below the org spotlight. Pulls from `structuredAchievements[]` and `achievements[]` fields on org data, sorted by date, up to 6 items in a 3-column grid with category icons and org color accents.

**Remaining:**
- Leadership spotlight block — depends on member data from `OrganizationMember` collection (separated by Migration 002). Needs a backend endpoint or a new data fetch pattern.
- Richer grouping of official vs. organization activity in the updates hub.
- Richer community card summaries (officer changes, flagship events, achievement badges on feed cards).

## Dependencies

- Phase 3A, Phase 5A, and Phase 6A provide most of the structured data this phase will consume.
- [LANDING_AND_UPDATES_HUB_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/LANDING_AND_UPDATES_HUB_AUDIT.md:1) defines the current gaps.

## Changes

- Add landing blocks for:
  - organization spotlight
  - leadership spotlight
  - achievement spotlight
- Improve updates hub ranking:
  - event ordering by schedule proximity rather than creation time
  - richer grouping of official versus organization activity
- Improve summary inputs for:
  - community cards
  - leadership updates
  - achievement highlights
  - organization cross-links

## API/Data Contracts

- Landing and updates features should consume structured metadata rather than guessing from body text.
- Existing public routes remain stable while new spotlight sections are introduced additively.

## Test Cases

- Updates hub event ordering matches event urgency and schedule.
- Landing sections render cleanly when some spotlight data is missing.
- Cross-links between updates, organizations, leaders, and source content remain valid.

## Acceptance Gate

- Landing and updates surfaces feel intentionally data-driven rather than placeholder-driven.
- Spotlight features reuse structured content across modules cleanly.

## Rollback Notes

- Spotlight sections and ranking logic can be toggled off without affecting the underlying content records.
