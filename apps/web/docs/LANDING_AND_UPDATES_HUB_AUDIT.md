# Landing Page and Updates Hub Audit

Last updated: 2026-05-20

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

## Current code anchors

- Landing layout: `/home/ronmarche14/projects/CICT/apps/web/src/components/layout/landingPage.tsx`
- Landing news section: `/home/ronmarche14/projects/CICT/apps/web/src/components/sections/landingpage/newsSection.tsx`
- Updates page: `/home/ronmarche14/projects/CICT/apps/web/src/app/updates/page.tsx`
- Updates client: `/home/ronmarche14/projects/CICT/apps/web/src/components/updates/UpdatesHubClient.tsx`
- Updates hook: `/home/ronmarche14/projects/CICT/apps/web/src/hooks/use-updates-hub.ts`
- Updates normalization logic: `/home/ronmarche14/projects/CICT/apps/web/src/lib/updates-hub.ts`

## Current gaps

### 1. The landing page has no dedicated organization or leadership spotlight

The home page has strong general editorial blocks, but it still lacks a deeper student-organization and student-leadership feature surface.

### 2. Community content preview is still thin

Community cards on the landing page largely emphasize title and ownership labels. They do not yet surface richer summaries such as officer changes, flagship events, or organization achievements.

### 3. Event ranking in the updates hub uses creation time

The updates hub currently normalizes event items with a display date based on `startDate`, but sorting still depends on `createdAt`. This can push a newly created far-future event above a more urgent near-future event.

### 4. Future categories are still placeholders

Some hub categories such as achievements and member highlights still read like planned buckets rather than fully connected live feature groups.

## Missing data and display inputs

- Featured organization of the week
- Leadership spotlight items
- Organization achievement spotlight items
- Event urgency or proximity ranking
- Community summary text tuned for cards
- Cross-links between updates and the source organization or member profile

## Missing functions

- Landing-page organization spotlight section
- Landing-page leadership spotlight section
- Smarter event ordering in the updates hub using event date logic
- Richer community card summaries
- Dedicated highlight rows for achievements, recognitions, and member milestones
- Better feed grouping between official and organization-owned activity

## Priority recommendations

1. Add at least one dedicated organization-focused block to the landing page.
2. Change updates-hub event ranking to use event schedule data rather than creation time.
3. Add spotlight-ready fields so news, announcements, organizations, and leaders can feed the landing page cleanly.
4. Replace placeholder future categories with live connected content types once the underlying models exist.
