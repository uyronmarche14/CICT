# Phase 11: Inter-Org Collaboration Framework

## Goal

Enable organizations to form partnerships, collaborate in shared spaces, share content across org feeds, create cross-org task forces, pool resources, and establish mentorship relationships. Transform CICT from isolated single-org management into a connected org ecosystem.

## Business Role in the Platform

Phase 11 should make collaboration measurable and operational, not just social. The business goal is to help organizations plan joint work, share resources, document outcomes, and prove impact.

The strongest product model is partnership-centered:

```
Partnership
  -> collaboration space
  -> shared tasks and meetings
  -> shared content, events, resource requests, mentorship, or task force
  -> deliverables and evidence
  -> completion report
  -> analytics and calendar visibility
```

This makes `OrgPartnership` the parent relationship for most cross-org activity. The other modules should either attach to a partnership or clearly explain why they are independent.

## Current Status

**Complete baseline.** All 6 features implemented with backend (7 models, 35 routes) and frontend (6 pages with CRUD). Workflow consolidation and deeper data links are still needed before this phase should be treated as product-complete.

**Backend (7 models, 35 routes):**
- `OrgPartnership` — Formal relationships with invite/accept/decline/terminate lifecycle. Auto-updates `Organization.partnerItems[]`
- `CollaborationSpace` + `CollaborationMessage` — Shared workspaces with participant orgs, threaded messaging
- `CrossOrgContentShare` — Share news/announcements/events across org feeds
- `OrgTaskForce` — Temporary cross-org teams with objectives, status lifecycle
- `ResourceRequest` — Request/approve/deny resources (venue, equipment, budget, personnel)
- `OrgMentorship` — Mentor/mentee relationships with focus areas and meeting history

**Frontend (6 pages + 6 API services):**
- All pages use OrgPageLayout with loading/empty/content states
- Create dialogs for all 6 features (shadcn Dialog)
- Approval workflow buttons (Accept/Decline, Approve/Deny)
- Bilateral queries show content relevant to the org from both sides
- Navigation: sidebar tree + OrgSubNav for all 6 features

## Dependencies

- Phase 10 provides the org admin tooling framework (permissions, OrgPageLayout, patterns)
- Organization model exists with slug-based lookups
- Permission system supports org-scoping
- Phase 10A should consume Phase 11 outcome data after collaboration records are linked
- Phase 12 should consume Phase 11 dates and milestones after calendar feed contracts exist

## Changes

### Models (7)
- `OrgPartnership` — orgIdA, orgIdB, status, partnershipType, initiatedBy, signed dates
- `CollaborationSpace` — organizationId, name, description, participantOrgIds, participantUserIds
- `CollaborationMessage` — spaceId, authorId, authorName, content, attachments
- `CrossOrgContentShare` — contentType, contentId, sourceOrgId, targetOrgIds, sharedBy
- `OrgTaskForce` — organizationId, name, description, participantOrgIds, objectives, dates, status
- `ResourceRequest` — organizationId, providingOrgId, resourceType, description, status, reviewedBy
- `OrgMentorship` — mentorOrgId, menteeOrgId, focusAreas, startDate, status, meetings

### Routes (35)
All mounted at `/api/organizations` with `protect` + `requireAdminAccess`:
- Partnerships: 6 routes (CRUD + accept/decline/terminate)
- Collaboration Spaces: 8 routes (space CRUD + messages CRUD)
- Shared Content: 4 routes (share + incoming/outgoing/remove)
- Task Forces: 5 routes (CRUD)
- Resource Pooling: 7 routes (outgoing/incoming + request CRUD + approve/deny/cancel)
- Mentorship: 5 routes (CRUD + status update)

### Permissions (6)
`MANAGE_ORG_PARTNERSHIPS`, `MANAGE_ORG_COLLABORATION`, `SHARE_CONTENT_CROSS_ORG`, `MANAGE_ORG_TASK_FORCES`, `MANAGE_ORG_RESOURCE_POOLING`, `MANAGE_ORG_MENTORSHIP`

### Frontend Pages (6)
- Partnerships — Card list + invite dialog + Accept/Decline/Terminate buttons
- Collaboration Spaces — Card list with click-to-view messages, send message form
- Shared Content — Tabs (Incoming/Outgoing) + share content dialog
- Task Forces — Card list with status badges + create dialog
- Resource Pooling — Tabs (My Requests/Incoming) + approve/deny/cancel
- Mentorship — Card list with role badges (Mentor/Mentee) + create dialog

## Recommended Stronger Data Model

Current implementation is a working baseline. To make the workflow modern and easier to report, add relationship fields instead of leaving each module isolated.

Recommended fields:
- `partnershipId` on `CollaborationSpace`, `CrossOrgContentShare`, `OrgTaskForce`, `ResourceRequest`, and `OrgMentorship`.
- `linkedEventIds`, `linkedTaskIds`, `linkedMeetingIds`, and `processInstanceId` where collaboration work relates to existing system objects.
- `leadOrgId`, `participantOrgIds`, `ownerUserId`, `adviserUserId`, `academicYear`, and `semester` for ownership and reporting.
- `goals`, `deliverables`, `successMetrics`, `evidenceAttachments`, `completionNotes`, and `postEvaluation` for outcomes.
- `statusHistory[]` with actor, action, fromStatus, toStatus, reason, and timestamp.

Recommended parent-child relationships:
- Partnership owns collaboration spaces.
- Collaboration space owns messages and linked deliverables.
- Task force belongs to a partnership or collaboration space when it is cross-org.
- Resource request can belong to a partnership, event, task force, or standalone org request.
- Shared content can belong to a partnership, event, or announcement/news source.
- Mentorship can belong to a partnership or be standalone if it is a formal mentor-mentee program.

## Clear Feature Purpose

- Partnerships: formal relationship and permission boundary for cross-org work.
- Collaboration Spaces: shared workroom for discussion, files, deliverables, and updates.
- Shared Content: syndication path for approved news, announcements, and events to target org feeds.
- Task Forces: temporary execution team with objectives, dates, participants, and outcomes.
- Resource Pooling: request/approval/fulfillment record for venues, equipment, budget, and personnel.
- Mentorship: guided support relationship with focus areas, sessions, and measurable progress.

## Business Workflow Requirements

A production-strength Phase 11 should support these flows:

1. **Partnership lifecycle**
   - Invite partner org.
   - Target org accepts or declines.
   - Active partnership becomes available to collaboration spaces, shared content, resources, task forces, and mentorship.
   - Partnership closes with terminated/completed status and outcome notes.

2. **Collaboration execution**
   - Create collaboration space under a partnership.
   - Add participant orgs and users.
   - Attach shared tasks, meetings, resources, and content.
   - Track deliverables and status.

3. **Resource accountability**
   - Request resource from a provider org.
   - Provider approves, denies, or asks for revision.
   - Request moves to fulfilled/cancelled with notes and optional evidence.
   - Calendar shows reservation/request dates when relevant.

4. **Shared content distribution**
   - Source org shares approved content.
   - Target org receives and can view it in incoming list.
   - If accepted/published to the target audience, it appears in the correct news/event/announcement feed.
   - Analytics tracks outgoing and incoming reach.

5. **Outcome reporting**
   - Partnership, task force, mentorship, and resource workflows record outcome summaries.
   - Analytics reports active work, completed work, overdue work, and impact.
   - Calendar surfaces dates and deadlines.

## API/Data Contracts

- All routes use bilateral queries: partnerships/mentorships check BOTH sides of the relationship
- Collaboration spaces check participantOrgIds for access
- Resource pooling separates outgoing (my requests) from incoming (requests to me)
- Partnership activation auto-updates `Organization.partnerItems[]` on both orgs
- All features use string org slugs for cross-org references (same pattern as Event.hostOrganizationIds)

## Product-Completeness Gaps to Close

The baseline is connected to backend and frontend, but these gaps should be closed before treating Phase 11 as product-complete:

- Make scoped authorization work for org-admin users, not only global admins.
- Add specific frontend permission gates per Phase 11 tool.
- Add `partnershipId` or equivalent parent links so collaboration data can be grouped.
- Integrate shared content into real news/event/announcement feeds or clearly mark it as an incoming/outgoing share registry only.
- Fix partnership termination so it removes only the matching partner entry, not all partner entries.
- Add status history and outcome fields for audit and reporting.
- Add integration tests for scoped users, cross-org visibility, and partnership-linked workflows.

## Test Cases

- Partnership invite → accept flow correctly updates partnerItems on both orgs
- Collaboration space message is visible to all participant orgs
- Shared content appears in incoming list of target orgs
- Task force lists both owned and participating task forces
- Resource request approval shows under approved status
- Mentorship prevents self-mentorship

## Acceptance Gate

All 6 features have working CRUD operations through both backend API and admin frontend UI, with proper org-scoping and bilateral visibility.

For product-complete acceptance, the following must also be true:
- A partnership can act as the parent for at least collaboration spaces and one additional collaboration feature.
- Shared content has a clear publish/display path or is intentionally scoped to registry-only behavior.
- Resource requests and task forces can be measured in analytics.
- Collaboration-related dates can be exposed to Phase 12 calendar feed.
- Permission gates are consistent between backend and frontend.

## Rollback Notes

Each feature can be disabled independently by removing its route bank and sidebar entry. All use separate collections. Partnership activation writes to Organization.partnerItems — the other 5 features don't modify existing models.
