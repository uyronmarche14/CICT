# Phase 5A: News and Announcement Data Expansion

## Goal

Expand news and announcement records so approval workflow operates on richer editorial and organization-specific data rather than only basic body content.

## Current Status

Complete.

- All 15 expanded News fields exist on the model: category, featured, pinned, sourceUrl, referenceLinks, readingTime, authorDisplayName, authorRole, associatedEventId, associatedOrganizationId, spotlightLabel, seoDescription, canonicalSlug, relatedArticleIds, attachmentItems.
- All 15 expanded Announcement fields exist on the model: subtype, effectiveDate, termStart, termEnd, relatedOrganizationId, relatedEventId, approvalSource, contactName, contactEmail, ctaLabel, ctaUrl, officerItems, outgoingOfficerItems, awardItems, attachmentItems.
- Admin NewsForm and AnnouncementForm expose all fields.
- This phase is fully implemented — the doc was incorrectly marked as not started.

## Dependencies

- Phase 5 approval workflow exists.
- [NEWS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/NEWS_SYSTEM_AUDIT.md:1) and [ANNOUNCEMENTS_SYSTEM_AUDIT.md](/home/ronmarche14/projects/CICT/apps/web/docs/ANNOUNCEMENTS_SYSTEM_AUDIT.md:1) define the missing data.

## Changes

- Expand news with fields such as:
  - `category`
  - `featured`
  - `pinned`
  - `sourceUrl`
  - `referenceLinks`
  - `attachmentItems`
  - `readingTime`
  - `authorDisplayName`
  - `authorRole`
  - `associatedEventId`
  - `associatedOrganizationId`
  - `spotlightLabel`
  - `seoDescription`
  - `canonicalSlug`
  - `relatedArticleIds`
- Expand announcements with fields such as:
  - `subtype`
  - `effectiveDate`
  - `termStart`
  - `termEnd`
  - `relatedOrganizationId`
  - `relatedEventId`
  - `approvalSource`
  - `contactName`
  - `contactEmail`
  - `ctaLabel`
  - `ctaUrl`
  - `officerItems`
  - `outgoingOfficerItems`
  - `awardItems`
  - `attachmentItems`
- Add subtype-aware public and admin presentation.

## API/Data Contracts

- Approval workflow remains explicit and backend-enforced.
- Existing records remain valid even when new metadata is absent.
- Structured fields should replace free-form downstream interpretation wherever possible.

## Test Cases

- Existing news and announcement create/edit continues to work.
- Approval state changes still work with expanded data.
- Public lists and detail pages handle both old and enriched records safely.

## Acceptance Gate

- News and announcements can drive richer landing, updates, and organization experiences without relying on body parsing.
- Leadership and recognition announcements can be represented structurally.

## Rollback Notes

- New metadata can stay optional and be hidden from public UI until the consuming surfaces are ready.
