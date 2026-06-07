# CICT System-Wide Lookup Protocol

Last updated: 2026-06-06

This document defines how forms choose dropdown data in the CICT monorepo. The goal is simple: forms should use real system data, configurable reference data, or shared enums from the correct source. Admins should not need to paste raw IDs for records that already exist in the system.

## Source Rules

| Field type | Source of truth | Examples |
|---|---|---|
| Entity relationship | Backend lookup registry | organizations, users, students, events, news, tasks |
| Configurable business label | Settings reference data | resource types, committees, categories, partnership types |
| System workflow state | Shared contracts/enums | status, priority, owner type, permissions |
| Page/table data | Existing list APIs | admin tables, dashboards, detail pages |

Use lookups for selectors, filters, and relationships. Do not replace full table/list APIs only because a lookup exists.

## Backend Lookup API

The canonical admin lookup route is:

```txt
GET /api/admin/lookups/:kind
GET /api/admin/lookups/reference-data
```

Every lookup kind returns the same shape:

```ts
{
  items: Array<{
    id: string;
    value: string;
    label: string;
    description?: string;
    status?: string;
    badge?: string;
    imageUrl?: string;
    meta?: Record<string, unknown>;
  }>;
  total: number;
  activeCount: number;
  inactiveCount: number;
  suggested: LookupItem[];
  source: string;
}
```

Supported admin lookup kinds:

```txt
organizations
users
students
org-members
org-officers
roles
programs
year-levels
sections
news
announcements
events
tasks
meetings
process-templates
org-templates
content
```

Org-scoped kinds such as `org-members`, `org-officers`, `tasks`, and `meetings` require `orgId`. Content lookups must respect content permissions and organization ownership scope.

## Backend Validation Rules

Frontend lookup controls are not enough. Backend services and validators must enforce the same source:

- Entity fields must verify that the referenced record exists.
- Organization-scoped entity fields must verify the current admin can access that organization scope.
- Reference-data fields must validate against settings reference data, with defaults used when settings are missing.
- Enum-backed fields must remain contract-backed and should not become settings-managed labels.
- Array validators must validate item types, not only that the parent value is an array.

Reusable helper direction lives in `apps/backend/src/services/lookup.service.ts`, including organization/user/student/role existence checks and reference-data validation.

## Frontend Components

Admin forms should use these shared components:

| Component | Use for |
|---|---|
| `LookupCombobox` | Single entity relationship |
| `LookupMultiCombobox` | Multiple entity relationships |
| `ReferenceDataSelect` | Single settings-backed business label |
| `ReferenceDataMultiSelect` | Multiple settings-backed business labels |
| `EnumSelect` | Contract enum states when a local enum-specific component exists |

Lookup controls must support create and edit modes. In edit mode, selected values should hydrate readable labels from the lookup API. A raw ObjectId should only appear if the linked record no longer exists.

## New Form Checklist

Before adding or changing an admin form:

- Entity field uses `LookupCombobox` or `LookupMultiCombobox`.
- Configurable business label uses `ReferenceDataSelect` or `ReferenceDataMultiSelect`.
- Workflow state uses shared contract enums, not settings reference data.
- Backend validation accepts the same values shown by the frontend.
- Backend rejects nonexistent, malformed, deleted, or unauthorized entity references.
- Optional lookup fields can be cleared.
- Edit mode hydrates selected labels and multi-select badges.
- Long labels truncate cleanly without breaking the form layout.

## Implemented Protocol Coverage

Current protocol foundation:

- Backend lookup registry and shared response shape.
- Admin lookup kinds for organizations, users, students, org members/officers, roles, academic records, content, tasks, meetings, process templates, and org templates.
- Reference-data groups for task categories, budget categories, resource types, partnership types, mentorship focus areas, committees, officer positions, content categories, announcement subtypes, and award categories.
- Shared frontend lookup and reference-data selector components.
- Content form conversion for news, announcements, and event host/co-host organizations.
- Organization workflow conversion for partnerships, mentorship focus areas, tasks, and resource type/provider selectors.
- Backend reference-data validation for content categories, announcement subtypes, resource types, partnership types, mentorship focus areas, budget categories, and task category/committee/officer position fields.

Remaining rollout work should continue through admin/student academic forms, process builder assignee selection, detail-page label cleanup, automated lookup tests, and manual QA scenarios.

## QA Gates

The lookup project is complete only when:

- No admin form uses raw entity ID text fields for selectable records.
- No configurable business dropdown is hardcoded in only one frontend form.
- Backend validators accept the same reference-data values shown in the UI.
- Backend validators reject invalid entity references.
- Organization-scoped lookups do not leak unauthorized data.
- Edit forms hydrate labels correctly.
- Optional lookup fields can be cleared.
- This document stays updated when new lookup kinds or reference-data groups are added.
