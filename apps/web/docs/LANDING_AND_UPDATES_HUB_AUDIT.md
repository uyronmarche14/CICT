# Landing Page and Updates Hub Audit

Last updated: 2026-05-29

## Purpose

This document covers the dynamic content behavior of the home landing page and the `/updates` hub, especially how news, announcements, organization content, and events are currently surfaced.

## Current surfaces

- Landing page: `/`
- Updates hub: `/updates`
- Shared updates logic: `apps/web/src/lib/updates-hub.ts`

## What already works

- The landing page already combines several editorial sources in one place.
- The updates hub already normalizes content from official and organization sources into a shared feed.
- The system already distinguishes several content groups such as official news, official announcements, community activity, and events.
- Organization spotlight and achievement spotlight landing sections are implemented.
- Updates hub event ordering now uses schedule proximity instead of raw creation time.

## Current code anchors

- Landing layout: `/home/ronmarche14/projects/CICT/apps/web/src/components/layout/landingPage.tsx`
- Landing news section: `/home/ronmarche14/projects/CICT/apps/web/src/components/sections/landingpage/newsSection.tsx`
- Updates page: `/home/ronmarche14/projects/CICT/apps/web/src/app/updates/page.tsx`
- Updates client: `/home/ronmarche14/projects/CICT/apps/web/src/components/updates/UpdatesHubClient.tsx`
- Updates hook: `/home/ronmarche14/projects/CICT/apps/web/src/hooks/use-updates-hub.ts`
- Updates normalization logic: `/home/ronmarche14/projects/CICT/apps/web/src/lib/updates-hub.ts`

## Current gaps

### 1. The landing page still needs a leadership spotlight

The home page now has organization and achievement spotlight surfaces, but it still lacks a student-leadership spotlight backed by `OrganizationMember` data.

### 2. Community content preview is still thin

Community cards on the landing page largely emphasize title and ownership labels. They do not yet surface richer summaries such as officer changes, flagship events, or organization achievements.

### 3. Official vs. organization grouping can be richer

The updates hub distinguishes ownership, but the visual grouping and summaries can better separate official CICT updates from organization-owned activity.

### 4. Future categories are still placeholders

Some hub categories such as achievements and member highlights still read like planned buckets rather than fully connected live feature groups.

## Missing data and display inputs

- Leadership spotlight items
- Community summary text tuned for cards
- Cross-links between updates and the source organization or member profile

## Missing functions

- Landing-page leadership spotlight section
- Richer community card summaries
- Dedicated highlight rows for achievements, recognitions, and member milestones
- Better feed grouping between official and organization-owned activity

## Priority recommendations

1. Add a leadership spotlight backed by member data.
2. Improve official versus organization-owned feed grouping.
3. Add richer community summary inputs for officer changes, flagship events, and achievement highlights.
4. Replace placeholder future categories with live connected content types once the underlying models exist.
