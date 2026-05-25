# Data Expansion Plan — Phases 3A + 5A (Event, News, Announcement)

## Objective

Add ~40 structured fields across Event, News, Announcement and extend `ContentSection` with richer capabilities (image, link, embed). Unify types under `@cict/contracts` so backend, web, and mobile share a single source of truth.

## New Fields Summary

### Event additions
`registrationUrl`, `registrationDeadline`, `contactName`, `contactEmail`, `contactPhone`, `hostOrganizationIds[]`, `coHostOrganizationIds[]`, `speakerItems[]`, `audience`, `eligibility`, `feeLabel`, `certificateInfo`, `venueDetails`, `mapUrl`, `meetingUrl`, `requirements`, `attachmentItems[]`, `posterCaption`

### News additions
`category`, `featured`, `pinned`, `sourceUrl`, `referenceLinks[]`, `attachmentItems[]`, `readingTime`, `authorDisplayName`, `authorRole`, `associatedEventId`, `associatedOrganizationId`, `spotlightLabel`, `seoDescription`, `canonicalSlug`, `relatedArticleIds[]`

### Announcement additions
`subtype`, `effectiveDate`, `termStart`, `termEnd`, `relatedOrganizationId`, `relatedEventId`, `approvalSource`, `contactName`, `contactEmail`, `ctaLabel`, `ctaUrl`, `officerItems[]`, `outgoingOfficerItems[]`, `awardItems[]`, `attachmentItems[]`

### ContentSection extension
`image?: MediaAsset`, `link?: { url: string; label: string }`, `embed?: { type: 'video' | 'map' | 'form'; url: string }`

---

## Steps

### Step 0: Extract shared `contentSectionSchema` (refactor)

**Context:** The identical `contentSectionSchema` is copy-pasted across `Event.ts`, `News.ts`, `Announcement.ts`. Before adding fields, extract to a shared file.

**Task list:**
- Create `apps/backend/src/models/schemas/shared.ts`
- Define and export `contentSectionSchema` (identical to current inline definition)
- Remove inline definitions from Event.ts, News.ts, Announcement.ts
- Import shared schema in all 3 models

**Files to modify:**
- `apps/backend/src/models/schemas/shared.ts` (NEW)
- `apps/backend/src/models/Event.ts`
- `apps/backend/src/models/News.ts`
- `apps/backend/src/models/Announcement.ts`

**Verification:**
- `pnpm run backend:typecheck` passes
- `pnpm run backend:test` passes (existing tests)
- No behavioral change

**Exit criteria:** Identical schemas removed from 3 models, imported from one shared location.

---

### Step 1: Contracts — Add shared full-content types

**Context:** Currently `@cict/contracts` only has `StudentEvent`, `ContentSection`, `StudentEventSection` — no `Event`, `News`, or `Announcement` types. Add them plus extended `ContentSection`.

**Task list:**
- Add `Event` type to `packages/contracts/src/index.ts`
- Add `News` type to `packages/contracts/src/index.ts`
- Add `Announcement` type to `packages/contracts/src/index.ts`
- Extend `ContentSection` with `image?`, `link?`, `embed?`
- Add shared sub-types: `SpeakerItem`, `AttachmentItem`, `VenueDetails`, `OfficerItem`, `AwardItem`, `ReferenceLink`
- Add Zod schemas for new types
- Add `AdminModuleKey` updates if needed for new field-driven modules
- Export all new types

**Files to modify:**
- `packages/contracts/src/index.ts`

**Verification:**
- `pnpm --filter @cict/contracts build` passes
- New types are consumable from another package

**Exit criteria:** Contracts export `Event`, `News`, `Announcement`, extended `ContentSection`, and all new sub-types.

---

### Step 2: Backend types + Mongoose schemas

**Context:** Backend `IEvent`, `INews`, `IAnnouncement` interfaces and Mongoose schemas need to match the new contract types.

**Task list:**
- Update `IContentSection` in `apps/backend/src/types/index.ts` (add image, link, embed)
- Update `IEvent` with all new fields (optional)
- Update `INews` with all new fields (optional)
- Update `IAnnouncement` with all new fields (optional)
- Add new sub-type interfaces: `ISpeakerItem`, `IAttachmentItem`, `IVenueDetails`, `IOfficerItem`, `IAwardItem`, `IReferenceLink`
- Add new fields to `contentSectionSchema` in shared schemas file
- Add new fields to Mongoose schemas in Event.ts, News.ts, Announcement.ts
- All new fields optional, backward-compatible

**Files to modify:**
- `apps/backend/src/types/index.ts`
- `apps/backend/src/models/schemas/shared.ts`
- `apps/backend/src/models/Event.ts`
- `apps/backend/src/models/News.ts`
- `apps/backend/src/models/Announcement.ts`

**Verification:**
- `pnpm run backend:typecheck` passes

**Exit criteria:** All 3 types expanded, new sub-types defined, schemas match types.

---

### Step 3: Backend normalization utility

**Context:** `normalizeSections()` in `apps/backend/src/utils/content.ts` needs extension for new section fields. New normalizer functions needed for sub-types (speaker items, officer items, attachments, etc.).

**Task list:**
- Extend `normalizeSections()` to handle `image`, `link`, `embed` on section items
- Add `normalizeSpeakerItems(value: unknown): ISpeakerItem[]`
- Add `normalizeOfficerItems(value: unknown): IOfficerItem[]`
- Add `normalizeAttachmentItems(value: unknown): IAttachmentItem[]`
- Add `normalizeAwardItems(value: unknown): IAwardItem[]`
- Add `normalizeReferenceLinks(value: unknown): IReferenceLink[]`
- Add `normalizeVenueDetails(value: unknown): IVenueDetails | undefined`

**Files to modify:**
- `apps/backend/src/utils/content.ts`
- `apps/backend/src/utils/content.test.ts` (add tests)

**Verification:**
- `pnpm run backend:test` passes (including new normalization tests)

**Exit criteria:** All normalization functions handle valid/invalid/empty input, `tsc` passes.

---

### Step 4: Backend validators

**Context:** Express validator chains need to validate new field types.

**Task list:**
- Add shared validators in `shared.ts`:
  - `validateSpeakerItems()`, `validateOfficerItems()`, `validateAttachmentItems()`, `validateAwardItems()`
  - `validateReferenceLinks()`, `validateVenueDetails()`
  - `validateUrl()`, `validateDateString()`
  - `validateContentSectionExtended()` (updated from `validateSections()`)
- Update `event.validator.ts` — add validation chains for event-specific new fields
- Update `news.validator.ts` — add validation chains for news-specific new fields
- Update `announcement.validator.ts` — add validation chains for announcement-specific new fields

**Files to modify:**
- `apps/backend/src/validators/shared.ts`
- `apps/backend/src/validators/event.validator.ts`
- `apps/backend/src/validators/news.validator.ts`
- `apps/backend/src/validators/announcement.validator.ts`

**Verification:**
- `pnpm run backend:typecheck` passes
- `pnpm run backend:test` passes

**Exit criteria:** All new fields have validation in create + update chains.

---

### Step 5: Backend controllers

**Context:** Controller CRUD logic needs to destructure, normalize, and store new fields.

**Task list:**
- Update `news.controller.ts`:
  - Add new fields to `NEWS_EDITABLE_FIELDS`
  - Destructure new fields from `req.body` in create + update
  - Pass through normalizers for structured sub-types
- Update `announcement.controller.ts`:
  - Add new fields to `ANNOUNCEMENT_EDITABLE_FIELDS`
  - Same pattern for create + update
- Update `event.controller.ts`:
  - Add new fields to `EVENT_EDITABLE_FIELDS`
  - Same pattern for create + update
- Ensure public/student endpoints include new fields in response when present

**Files to modify:**
- `apps/backend/src/controllers/news.controller.ts`
- `apps/backend/src/controllers/announcement.controller.ts`
- `apps/backend/src/controllers/event.controller.ts`

**Verification:**
- `pnpm run backend:typecheck` passes
- `pnpm run backend:test` passes

**Exit criteria:** New fields flow through create/update/get/list endpoints.

---

### Step 6: Frontend types + API layer

**Context:** Web frontend types must match contracts. API services need full CRUD.

**Task list:**
- Update `apps/web/src/types/index.ts`:
  - Extend `News` and `Announcement` with all new fields
  - Import/export new sub-types from contracts
- Update `apps/web/src/lib/api/event.ts`:
  - Extend `Event` and `EventMutationPayload` with all new fields
- Update `apps/web/src/lib/api/news.ts`:
  - Add full CRUD endpoints (create, update, delete, list, getById)
  - Keep existing workflow endpoints
- Update `apps/web/src/lib/api/announcements.ts`:
  - Same as news

**Files to modify:**
- `apps/web/src/types/index.ts`
- `apps/web/src/lib/api/event.ts`
- `apps/web/src/lib/api/news.ts`
- `apps/web/src/lib/api/announcements.ts`

**Verification:**
- `pnpm run web:typecheck` passes

**Exit criteria:** Frontend types match contracts, API layer has complete CRUD.

---

### Step 7: Frontend admin forms + ContentSectionsEditor

**Context:** Admin forms need new field inputs. ContentSectionsEditor needs image/link/embed controls.

**Task list:**
- Update `ContentSectionsEditor.tsx`:
  - Add optional image upload per section
  - Add link URL + label inputs per section
  - Add embed type select + URL per section
- Update `EventForm.tsx` + `EditEventForm.tsx`:
  - Add registration fields (url, deadline)
  - Add contact fields (name, email, phone)
  - Add org fields (hostOrganizationIds, coHostOrganizationIds)
  - Add speaker items editor
  - Add venue details section
  - Add audience/eligibility/fee/certificate fields
  - Add requirements, attachment items
  - Add poster caption, map url, meeting url
- Update `NewsForm.tsx`:
  - Add category select, featured toggle, pinned toggle
  - Add source URL, reference links, attachment items
  - Add reading time, author display name/role
  - Add associated event/organization selectors
  - Add spotlight label, SEO fields, related articles
- Update `AnnouncementForm.tsx`:
  - Add subtype select
  - Add effective date, term start/end
  - Add related org/event selectors
  - Add contact fields, CTA fields
  - Add officer items, outgoing officer items, award items
  - Add attachment items

**Files to modify:**
- `apps/web/src/components/admin/ContentSectionsEditor.tsx`
- `apps/web/src/components/admin/EventForm.tsx`
- `apps/web/src/components/admin/EditEventForm.tsx`
- `apps/web/src/components/admin/NewsForm.tsx`
- `apps/web/src/components/admin/AnnouncementForm.tsx`

**Verification:**
- `pnpm run web:typecheck` passes
- `pnpm run web:lint` passes
- `pnpm run web:test` passes

**Exit criteria:** All forms have inputs for every new optional field.

---

### Step 8: Frontend admin detail pages

**Context:** Admin detail pages need to display new fields in structured layouts.

**Task list:**
- Update `admin/events/[id]/page.tsx` + `EventOverview.tsx`:
  - Display registration info, contact info, venue, speakers, attachments
  - Organized into logical sections/cards
- Update `admin/news/[id]/page.tsx`:
  - Display category, featured/pinned status, source, meta fields, related
  - Display extended section content (image, link, embed)
- Update `admin/announcements/[id]/page.tsx`:
  - Display subtype, dates, contact, CTA, officers, awards, attachments
  - Display extended section content

**Files to modify:**
- `apps/web/src/app/admin/events/[id]/page.tsx`
- `apps/web/src/components/admin/EventDetail/EventOverview.tsx`
- `apps/web/src/app/admin/news/[id]/page.tsx`
- `apps/web/src/app/admin/announcements/[id]/page.tsx`

**Verification:**
- `pnpm run web:typecheck` passes

**Exit criteria:** All new fields render on admin detail pages.

---

### Step 9: Frontend admin list pages

**Context:** List pages need filters and table columns for categorized fields.

**Task list:**
- Update `admin/events/page.tsx`:
  - Add filter for featured status, category, venue type
  - Add relevant columns
- Update `admin/news/page.tsx`:
  - Add category filter, featured/pinned filter
  - Add columns for category, featured, reading time
- Update `admin/announcements/page.tsx`:
  - Add subtype filter, priority filter
  - Add columns for subtype, effective date, contact

**Files to modify:**
- `apps/web/src/app/admin/events/page.tsx`
- `apps/web/src/app/admin/news/page.tsx`
- `apps/web/src/app/admin/announcements/page.tsx`

**Verification:**
- `pnpm run web:typecheck` passes

**Exit criteria:** List pages have new filters and display relevant expanded fields.

---

### Step 10: Frontend public pages + shared components

**Context:** Public facing pages should show relevant new fields. `StructuredContent` must handle extended sections.

**Task list:**
- Update `StructuredContent.tsx`:
  - Render section.image
  - Render section.link as anchor
  - Render section.embed as iframe (type-aware)
- Update public event detail `events/[id]/page.tsx`:
  - Display venue, speakers, contact, registration, etc.
- Update public news detail `news/[id]/page.tsx`:
  - Display author info, source, category, reading time, related
  - Display extended section content
- Update public announcement detail `announcements/[id]/page.tsx`:
  - Display subtype, contact, CTA, officers, effective dates
  - Display extended section content
- Update public list pages to show relevant new summary fields

**Files to modify:**
- `apps/web/src/components/StructuredContent.tsx`
- `apps/web/src/app/events/[id]/page.tsx`
- `apps/web/src/app/events/page.tsx`
- `apps/web/src/app/news/[id]/page.tsx`
- `apps/web/src/app/news/page.tsx`
- `apps/web/src/app/announcements/[id]/page.tsx`
- `apps/web/src/app/announcements/page.tsx`
- `apps/web/src/components/events/EventCard.tsx`

**Verification:**
- `pnpm run web:typecheck` passes

**Exit criteria:** Public pages render new fields gracefully; old records without new fields render fine.

---

### Step 11: Frontend student portal

**Context:** Student event pages should show enriched event data.

**Task list:**
- Update `student/events/page.tsx` — show relevant event summary data
- Update `student/events/[id]/page.tsx` — show venue, speakers, contact, registration details

**Files to modify:**
- `apps/web/src/app/student/events/page.tsx`
- `apps/web/src/app/student/events/[id]/page.tsx`

**Verification:**
- `pnpm run web:typecheck` passes

**Exit criteria:** Student portal shows enriched event data.

---

### Step 12: Mobile types

**Context:** Mobile's stripped-down `News`, `Announcement`, `UpdateItem` types must expand to match contracts.

**Task list:**
- Expand `News` type in `apps/mobile/src/types/models.ts` with all new fields
- Expand `Announcement` type with all new fields
- Expand `HomeUpdate`/`UpdateItem` types if applicable
- Import new sub-types from contracts where they exist
- Ensure all fields are optional for backward compatibility

**Files to modify:**
- `apps/mobile/src/types/models.ts`

**Verification:**
- `pnpm run mobile:typecheck` passes

**Exit criteria:** Mobile types match contract types.

---

### Step 13: Mobile API services

**Context:** Mobile API calls need to handle new fields in responses.

**Task list:**
- Update `apps/mobile/src/services/api/events.ts` — no changes needed if API returns new fields automatically (just type updates)
- Update `apps/mobile/src/services/api/news.ts` — ensure `getById` returns full news data
- Update `apps/mobile/src/services/api/announcements.ts` — ensure normalization works with new fields
- Update `apps/mobile/src/services/api/public-announcements.ts` — same

**Files to modify:**
- `apps/mobile/src/services/api/events.ts`
- `apps/mobile/src/services/api/news.ts`
- `apps/mobile/src/services/api/announcements.ts`
- `apps/mobile/src/services/api/public-announcements.ts`

**Verification:**
- `pnpm run mobile:typecheck` passes

**Exit criteria:** Mobile API layers handle expanded data.

---

### Step 14: Update tests

**Context:** All test files need updates for new fields.

**Task list:**
- Backend: update `content.test.ts` — tests for new normalization functions
- Backend: update `security.integration.test.ts` — seed data includes new fields
- Backend: update controller tests if any
- Frontend: update `handlers.ts` mock data with new fields
- Frontend: update `event.test.ts`, `news.test.ts`, `announcement.test.ts`
- Frontend: update form component tests
- Frontend: update detail page tests if any
- Mobile: update any relevant tests

**Verification:**
- All test suites pass

**Exit criteria:** All existing + new tests pass.

---

### Step 15: Final verification

**Context:** Ensure everything works end-to-end.

**Task list:**
- Run `pnpm run backend:typecheck` — pass
- Run `pnpm run backend:lint` — pass
- Run `pnpm run backend:test` — pass
- Run `pnpm run web:typecheck` — pass
- Run `pnpm run web:lint` — pass
- Run `pnpm run web:test` — pass
- Run `pnpm run mobile:typecheck` — pass
- Run `pnpm run mobile:lint` — pass

**Verification:** all of the above.

**Exit criteria:** Every check passes.
