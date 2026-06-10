# CICT Organization System Implementation Plan

## Document Information

| Field | Details |
|---|---|
| Project | CICT Portal |
| Document Type | Organization System Feature and Implementation Plan |
| Last Updated | 2026-06-10 |
| Architecture Reference | `../architecture/CICT_ORGANIZATION_SYSTEM_CONNECTION_ARCHITECTURE.md` |
| Storage Decision | `CICT_ORGANIZATION_STORAGE_BYOK_DECISION.md` |

---

## 1. Planning Assumption

This plan assumes:

- one shared MongoDB database;
- organization-scoped records using `organizationId`;
- platform-managed storage first;
- no required BYOK/BYOS in the first implementation;
- BYOK/BYOS compatibility through a storage abstraction and metadata model;
- activity timeline as the connection layer between modules.

---

## 2. Goal

Make the organization system dynamic and connectable by turning every organization module into part of one flow:

```txt
organization profile
  -> membership
  -> meetings
  -> tasks
  -> events
  -> attendance
  -> budget
  -> resources
  -> voting
  -> files
  -> activity
  -> notifications
  -> analytics
```

---

## 3. Major Functions to Add

| Function | Priority | Why It Matters |
|---|---|---|
| Organization dashboard | P0 | Gives org admins one operational home |
| Organization activity timeline | P0 | Connects all module actions in one history |
| Storage metadata and quotas | P0 | Protects free-tier storage and enables future BYOS |
| Student membership flow on mobile | P1 | Connects student app to existing membership API |
| Student voting eligibility | P1 | Turns elections into real active-member voting |
| Organization file manager | P1 | Central place for documents, receipts, minutes, event assets |
| Meeting action item to task sync | P1 | Makes meetings operational instead of static notes |
| Budget and resource request integration | P1 | Connects financial requests to transaction history |
| Organization calendar | P2 | Combines meetings, events, vote windows, task due dates |
| Committee/subteam management | P2 | Connects members, officers, meetings, and tasks |
| Officer handover workflow | P2 | Solves recurring student-org transition problems |
| Notification center | P2 | Makes workflows visible to students/admins |
| Connected process workflow engine | P2/P3 | Turns the current Process tab into reusable infrastructure for approvals, handovers, requests, and multi-step org work |
| Advanced BYOS/BYOK | P3 | Optional only after quotas and usage prove the need |

---

## 4. Phase 0: Foundation Fixes

Purpose: make existing organization workflows reliable before adding bigger features.

| Task ID | Task | Affected Area | Acceptance Criteria |
|---|---|---|---|
| ORG-P0-001 | Verify scoped organization membership routes allow scoped org admins | Backend RBAC | Scoped org admin can approve/reject only assigned org memberships |
| ORG-P0-002 | Document organization role/permission behavior | Docs/RBAC | Admin docs explain global vs scoped org permissions |
| ORG-P0-003 | Normalize organization ID usage | Backend/models | New org-owned records consistently use organization slug or normalized ID |
| ORG-P0-004 | Add tests around membership lifecycle | Backend tests | Apply, approve, reject, resign flows covered |
| ORG-P0-005 | Review analytics cache keys | Backend analytics | Analytics cache cannot leak between scopes if any endpoint becomes scope-dependent beyond orgId |

---

## 5. Phase 1: Connection Layer

Purpose: add the shared structures that make modules connectable.

### 5.1 Organization Activity

Add an `OrganizationActivity` model.

Required fields:

- `organizationId`
- `actorType`
- `actorId`
- `action`
- `entityType`
- `entityId`
- `entityLabel`
- `sourceType`
- `sourceId`
- `metadata`
- `createdAt`

Actions to record first:

| Module | Actions |
|---|---|
| Memberships | applied, approved, rejected, resigned, role changed |
| Tasks | created, assigned, status changed, completed, deleted |
| Meetings | created, updated, minutes saved, action item added |
| Events | created, submitted, approved, published, cancelled, completed |
| Budget | budget updated, transaction created/deleted |
| Resources | requested, approved, denied, cancelled |
| Voting | vote created, vote opened, ballot cast, results viewed/exported |
| Files | uploaded, attached, deleted |

### 5.2 Related Entity References

Add optional relationship fields to modules where missing.

```ts
sourceType?: string;
sourceId?: string;
relatedEntities?: Array<{ type: string; id: string; relation?: string }>;
```

Start with:

- `OrgTask`
- `OrgMeeting`
- `OrgTransaction`
- `ResourceRequest`
- `OrgVote`
- `OrganizationFile`

---

## 6. Phase 2: Organization Dashboard

Purpose: create one operational home per organization.

### 6.1 Backend Endpoint

Add:

```txt
GET /api/organizations/:orgId/dashboard
```

Response:

```ts
type OrganizationDashboard = {
  summary: {
    activeMembers: number;
    pendingApplications: number;
    tasksOpen: number;
    tasksOverdue: number;
    upcomingMeetings: number;
    upcomingEvents: number;
    activeVotes: number;
    pendingResourceRequests: number;
    budgetUtilization: number;
    storageUtilization: number;
  };
  pendingActions: Array<{
    type: string;
    id: string;
    label: string;
    priority: 'low' | 'normal' | 'high';
    dueAt?: string;
  }>;
  recentActivity: OrganizationActivityItem[];
  calendar: OrganizationCalendarItem[];
};
```

### 6.2 Web Page

Update `/admin/organizations/[id]` so the Overview tab becomes the real dashboard.

Include:

- summary metrics;
- pending applications;
- overdue tasks;
- upcoming meetings;
- upcoming events;
- budget/storage warning;
- recent activity;
- quick actions.

---

## 7. Phase 3: Storage Metadata and Quotas

Purpose: protect free-tier storage and prepare future BYOS.

### 7.1 Add Models

Add:

- `OrganizationFile`
- `OrganizationStorageQuota`

Do not add organization-managed credentials yet.

### 7.2 Refactor Uploads

Replace direct upload usage with:

```txt
OrganizationStorageService.upload()
```

Flow:

```txt
validate permission
validate file
check quota
build org folder
upload to Cloudinary
save OrganizationFile metadata
update quota usage
write activity
return normalized file record
```

### 7.3 Admin File Manager

Add an admin file view:

```txt
/admin/organizations/{orgId}/files
```

Minimum features:

- list files;
- filter by type/module;
- show storage used;
- upload file;
- attach file to module;
- archive/delete file;
- warn near quota.

---

## 8. Phase 4: Process Engine Infrastructure

Purpose: keep the Process tab, but improve it into connected workflow infrastructure instead of leaving it as a separate admin-only feature.

This phase should not replace the organization modules. It should make the Process tab able to coordinate them.

### 8.1 Current Process Position

Current capability:

- templates define workflow nodes and edges;
- instances can run from templates;
- instances can store `organizationId`;
- instances can link to content through `linkedContentType` and `linkedContentId`;
- node assignment data supports users, roles, and organizations in the backend model.

Current limitation:

- runtime assignment checks are not yet a full participant resolver;
- the UI assignee picker is mostly user-based;
- module links are not standardized for all organization modules;
- process updates do not consistently create activity timeline records or notifications;
- process approval is not yet the same as content approval.

### 8.2 Add Participant Resolver

Add a service that resolves process participants into real actors.

Recommended participant types:

```ts
type ProcessParticipantType =
  | 'user'
  | 'role'
  | 'organization'
  | 'organization_admin'
  | 'committee'
  | 'officer_position'
  | 'student_member'
  | 'student_applicant';
```

Resolution examples:

| Assignment Type | Resolution Rule |
|---|---|
| `user` | Direct admin user id |
| `role` | Users with that global role |
| `organization` | Admins assigned to the process organization |
| `organization_admin` | Scoped org admins with required permission |
| `committee` | Members/admins attached to an organization committee |
| `officer_position` | Active membership with matching officer position |
| `student_member` | Active organization member |
| `student_applicant` | Student tied to a membership application |

### 8.3 Add Module Link Registry

Create a registry that defines how each module links to a process instance.

Recommended linked modules:

| Module | Link Field | Example Use |
|---|---|---|
| News | `processInstanceId` | Content approval workflow |
| Announcement | `processInstanceId` | Announcement review workflow |
| Event | `processInstanceId` | Event proposal and approval |
| OrgTask | `processInstanceId` | Task checklist workflow |
| OrgMeeting | `processInstanceId` | Meeting preparation workflow |
| OrgBudget | `processInstanceId` | Budget approval workflow |
| OrgTransaction | `processInstanceId` if added | Expense review workflow |
| ResourceRequest | `processInstanceId` if added | Cross-org request workflow |
| OrganizationMembership | `processInstanceId` if added | Application review workflow |
| OrganizationFile | `processInstanceId` if added | Document approval workflow |
| OrgTaskForce | `processInstanceId` if added | Project workflow |

### 8.4 Add Process Events

Every process action should emit organization activity.

Process events:

- instance created;
- instance started;
- step assigned;
- step approved;
- step rejected;
- requirement completed;
- comment added;
- instance completed;
- instance archived;
- module linked.

These events should feed:

- organization activity timeline;
- organization dashboard;
- notifications;
- analytics.

### 8.5 Add Process Automation Actions

Start with simple actions:

| Process Node Action | Result |
|---|---|
| Create task | Creates an `OrgTask` linked to the process |
| Request document | Creates document/file requirement |
| Send notification | Notifies assigned actors |
| Update linked status | Updates linked module status if allowed |
| Add checklist | Adds checklist items to the active process node |

Avoid complex automation until permission checks and activity logging are stable.

### 8.6 Recommended Process Use Cases

First process-backed organization workflows:

1. Officer handover checklist.
2. Budget request approval.
3. Event proposal workflow.
4. Membership application review.
5. Document approval.

Acceptance criteria:

- process steps can be assigned to users, roles, organization admins, committees, officer positions, and student participants where applicable;
- linked modules can open their related process instance;
- process instance pages show linked module details;
- process actions write organization activity entries;
- process actions can trigger notifications;
- scoped organization admins can only view and act on allowed org process instances.

---

## 9. Phase 5: Student Membership on Mobile

Purpose: expose existing membership functionality to students.

### 8.1 Mobile Organization Detail

Add membership state:

| State | UI |
|---|---|
| No membership | Apply button |
| Applied | Pending badge |
| Active | Active member badge and resign option |
| Rejected | Can reapply if policy allows |
| Resigned | Can reapply if policy allows |

### 8.2 Backend Support

Existing endpoints:

```txt
GET /api/student/memberships
POST /api/student/organizations/:orgId/apply
POST /api/student/memberships/:id/resign
```

Add if needed:

```txt
GET /api/student/organizations/:orgId/membership-status
```

This avoids mobile fetching all memberships just to determine one organization state.

---

## 10. Phase 6: Student Voting and Elections

Purpose: turn voting from an admin-only tool into a real organization election flow.

### 9.1 Backend Changes

Add student voting endpoints:

```txt
GET /api/student/organizations/:orgId/votes
GET /api/student/organizations/:orgId/votes/:voteId
POST /api/student/organizations/:orgId/votes/:voteId/cast
GET /api/student/organizations/:orgId/votes/:voteId/results
```

Eligibility:

```txt
student has active OrganizationMembership for orgId
vote is active by date/status
student has not voted yet
student memberType is allowed by vote settings
```

### 9.2 Web Admin

Admin creates and manages elections.

Add settings:

- eligible member types;
- anonymous or named ballot;
- results visibility;
- candidate requirements;
- voting period.

### 9.3 Mobile

Student can:

- see active elections;
- cast ballot;
- view confirmation;
- view results if allowed.

---

## 11. Phase 7: Meetings, Tasks, and Committees

Purpose: make organization operations connected.

### 10.1 Action Item Sync

Improve meeting action item promotion:

- create linked task;
- keep `meetingId` and `actionItemIndex`;
- reflect linked task completion in meeting action item;
- show task status on meeting page.

### 10.2 Committees

Add committee/subteam model or formalize existing `committeeItems`.

Recommended model:

```ts
type OrganizationCommittee = {
  organizationId: string;
  name: string;
  description?: string;
  headMembershipId?: string;
  memberMembershipIds: string[];
  status: 'active' | 'inactive';
};
```

Connect committees to:

- tasks;
- meetings;
- members;
- files;
- dashboard.

---

## 12. Phase 8: Budget and Resources

Purpose: connect money, requests, and proof documents.

### 11.1 Resource to Budget

When a budget resource request is approved:

- create or link budget transaction;
- attach request reason;
- attach receipt/supporting file if present;
- record activity.

### 11.2 Receipts

Use `OrganizationFile` for receipt uploads.

Receipt attachment:

```ts
attachedTo: [
  { type: 'budget_transaction', id: transactionId, relation: 'receipt' },
  { type: 'resource_request', id: requestId, relation: 'supporting_document' }
]
```

---

## 13. Phase 9: Organization Calendar

Purpose: create a unified time-based view.

Calendar items:

| Source | Calendar Data |
|---|---|
| Meetings | meeting date/time |
| Events | event schedule |
| Tasks | due date |
| Votes | start/end date |
| Resource requests | date needed |
| Membership | application deadline if added |

Add:

```txt
GET /api/organizations/:orgId/calendar
```

---

## 14. Phase 10: Notifications

Purpose: make connected events visible.

Notification triggers:

| Trigger | Recipient |
|---|---|
| New application | Org membership admins |
| Application approved/rejected | Student |
| Task assigned | Assignee |
| Meeting scheduled | Attendees |
| Vote opened | Eligible active members |
| Resource request received | Provider org admins |
| Budget warning | Org budget admins |
| Storage warning | Org storage admins |
| Content approved/published | Creator and org admins |

Start with in-app notification records, then connect push/email.

---

## 15. Phase 11: Optional BYOS/BYOK

Purpose: support organization-owned storage only if needed.

Do not begin this phase until:

- organization file metadata exists;
- quota reporting exists;
- storage usage shows a real need;
- provider abstraction is already stable.

Minimum pilot:

- one provider;
- one test organization;
- encrypted credentials;
- validation upload/delete;
- fallback mode;
- audit logs;
- new files only.

Reference: `CICT_ORGANIZATION_STORAGE_BYOK_DECISION.md`.

---

## 16. Recommended Backlog

| Backlog ID | Priority | Task | Effort | Dependencies | Status |
|---|---|---|---|---|---|
| ORG-BL-001 | P0 | Add organization activity model and activity service | M | None | Pending |
| ORG-BL-002 | P0 | Emit activity from memberships, tasks, meetings, budget, resources | M | ORG-BL-001 | Pending |
| ORG-BL-003 | P0 | Add organization dashboard endpoint | M | ORG-BL-001 | Pending |
| ORG-BL-004 | P0 | Build admin organization dashboard UI | M | ORG-BL-003 | Pending |
| ORG-BL-005 | P0 | Add OrganizationFile metadata model | M | Storage decision | Pending |
| ORG-BL-006 | P0 | Add OrganizationStorageQuota model and checks | M | ORG-BL-005 | Pending |
| ORG-BL-007 | P1 | Refactor uploads into OrganizationStorageService | L | ORG-BL-005, ORG-BL-006 | Pending |
| ORG-BL-008 | P1 | Add mobile apply/pending/active/resign UI | M | Existing membership API | Pending |
| ORG-BL-009 | P1 | Add student membership status endpoint | S | Existing membership API | Pending |
| ORG-BL-010 | P1 | Add student voting eligibility service | M | Membership model | Pending |
| ORG-BL-011 | P1 | Add student voting endpoints | M | ORG-BL-010 | Pending |
| ORG-BL-012 | P1 | Add mobile voting flow | M | ORG-BL-011 | Pending |
| ORG-BL-013 | P1 | Sync meeting action item completion with linked tasks | M | Existing task/meeting fields | Pending |
| ORG-BL-014 | P1 | Connect resource budget requests to transactions | M | Budget/resource models | Pending |
| ORG-BL-015 | P2 | Add organization file manager UI | M | ORG-BL-007 | Pending |
| ORG-BL-016 | P2 | Add organization calendar endpoint/UI | M | Dashboard/activity | Pending |
| ORG-BL-017 | P2 | Add committee/subteam model and UI | L | Membership model | Pending |
| ORG-BL-018 | P2 | Add officer handover workflow | L | Committees/tasks/files | Pending |
| ORG-BL-019 | P2 | Add notification records from activity events | M | ORG-BL-001 | Pending |
| ORG-BL-020 | P2 | Add process participant resolver | M | Process model/RBAC | Pending |
| ORG-BL-021 | P2 | Add process module link registry | M | Process model/module models | Pending |
| ORG-BL-022 | P2 | Emit organization activity from process actions | M | ORG-BL-001, ORG-BL-020 | Pending |
| ORG-BL-023 | P3 | Add process automation actions for tasks, documents, notifications, and status updates | L | ORG-BL-020, ORG-BL-021, ORG-BL-022 | Pending |
| ORG-BL-024 | P3 | Add BYOS provider config behind feature flag | L | Stable storage abstraction | Pending |

---

## 17. Acceptance Criteria for a Connected System

The organization system can be considered connected when:

- each org-owned module has `organizationId`;
- dashboards aggregate connected modules;
- activity timeline records cross-module actions;
- storage records are metadata-based and quota-aware;
- membership state appears in mobile;
- active members can vote in student elections;
- meeting action items and tasks stay linked;
- budget resource approvals can create/link transactions;
- files can attach to meetings, events, budget, and documents;
- notifications are triggered from activity events;
- process instances can resolve assigned users, roles, organizations, committees, officer positions, and student participants;
- process instances can link to core organization modules through a registry;
- analytics matches dashboard source data.

---

## 18. Recommended Implementation Order

1. Fix scoped membership permission behavior.
2. Add organization activity model/service.
3. Add dashboard endpoint and admin dashboard UI.
4. Add storage metadata and quotas.
5. Refactor Cloudinary uploads behind storage service.
6. Add process participant resolver and module link registry.
7. Add mobile membership state and actions.
8. Add student voting eligibility and mobile voting.
9. Improve meeting-to-task synchronization.
10. Connect resource requests to budget transactions.
11. Add org file manager and calendar.
12. Add notifications.
13. Add process automation actions only after activity and notifications are stable.
14. Consider BYOS/BYOK only after storage usage proves need.

This order gives the most useful connected system without jumping into provider credential complexity too early.
