# Phase 10A: Organization Analytics and Reporting

## Goal

Add per-org analytics dashboards with engagement scoring, task/meeting/vote completion metrics, event attendance trends, and budget utilization — computed from existing data with chart-based visualization.

## Business Role in the Platform

Phase 10A is the decision-support layer. It should help admins, advisers, moderators, and officers understand whether an organization is healthy, active, and accountable.

Analytics should be designed around operational questions:
- Activity health: Is the org consistently creating tasks, holding meetings, and completing work?
- Event impact: Are registrations turning into attendance? Which events underperform?
- Member engagement: Are members contributing, or is activity concentrated in a few people?
- Finance health: Is the org overspending, underspending, or missing transaction records?
- Governance health: Are votes, meetings, and approvals happening on time?
- Collaboration value: Do partnerships, task forces, mentorships, and shared resources produce measurable outcomes?

Dashboards are valuable only when they explain what needs attention. Prefer metrics that can lead to an action, review, reminder, report, or intervention.

## Current Status

**Complete baseline.** Frontend with recharts + backend aggregation service implemented. Additional metric refinement should continue as Phase 11 collaboration data becomes linked to core records.

**Backend:**
- `services/org-analytics.service.ts` — 6 aggregation functions with 60s TTL caching
- Aggregates from: OrgTask, OrgMeeting, Event, EventRegistration, EventAttendanceLog, OrgBudget, OrgTransaction, OrganizationMembership
- Engagement score formula: weighted composite of task completion, meeting activity, contributions, budget usage

**Frontend:**
- recharts installed (`pnpm --filter @cict/web add recharts`)
- Analytics page with 5 tabs: Overview, Tasks, Events, Financial, Engagement
- Metric cards + Progress bar + PieChart (status) + BarChart (priority/financial) + LineChart (monthly trends)
- Permission-gated via `VIEW_ORG_ANALYTICS`

## Dependencies

- Phase 10 provides OrgTask, OrgMeeting, OrgBudget, OrgTransaction models
- EventAttendanceLog, EventRegistration (Phase 3/4) provide attendance data
- OrganizationMembership provides contribution data
- Phase 11 should later provide partnership, resource, mentorship, task-force, and shared-content outcome data

## Changes

### Backend — 1 service + 1 controller + 1 route file

**6 API endpoints:**
```
GET  /:orgId/analytics/overview     — Members, tasks done, meetings, budget %, engagement score
GET  /:orgId/analytics/tasks        — Status pie, priority bar, completion rate, overdue count
GET  /:orgId/analytics/events       — Registration/attendance funnel, monthly line chart
GET  /:orgId/analytics/financial    — Income/expense/balance, budget utilization, by-category bar
GET  /:orgId/analytics/engagement   — Score, active members, total hours, contributions
GET  /:orgId/analytics/export       — Combined report of all above
```

**Permission:** `VIEW_ORG_ANALYTICS` — added to contracts

### Frontend — 1 page + 1 API service

- `lib/api/org-analytics.ts` — 5 endpoint functions
- `lib/query-keys.ts` — `orgAnalytics` namespace
- `[id]/analytics/page.tsx` — Tabbed dashboard with 5 recharts panels

## API/Data Contracts

- All endpoints require admin auth + `authorize(Permission.VIEW_ORG_ANALYTICS)`
- Data aggregated in real-time from existing collections (no new models)
- 60s cache TTL (analytics data doesn't need real-time freshness)
- Engagement score: 0–100 weighted composite

## Data Expansion Targets

Add these analytics sources when the corresponding operational data becomes stable:
- Partnership analytics: active partnerships, pending invites, completed collaborations, terminated partnerships, outcome score.
- Collaboration analytics: active spaces, message activity, linked tasks, open deliverables, completed milestones.
- Shared-content analytics: incoming/outgoing shares, feed impressions if available, target org reach.
- Resource analytics: pending requests, approval rate, fulfillment rate, late/cancelled requests, most requested resource type.
- Mentorship analytics: active mentor pairs, completed sessions, focus areas, completion rate, mentee outcomes.
- Task-force analytics: active task forces, objective completion, participant org count, overdue milestones.

Recommended summary cards:
- Org Health Score
- Overdue Work
- Event Attendance Rate
- Budget Utilization
- Collaboration Impact
- Member Engagement

## Business Logic Guardrails

- Do not treat empty data as success. Empty states should distinguish "no activity yet" from "data source unavailable."
- Show ratios with raw counts so admins can tell whether a percentage is meaningful.
- Keep formulas documented and stable for reports.
- Use fiscal year, semester, and date-range filters before comparing orgs.
- Analytics should respect org-scoped permissions, not only global admin access.

## Test Cases

- Analytics overview returns correct member count for org
- Engagement score is 0 when no activity exists
- Task status pie sums to total task count
- Event monthly trend shows correct registration/attendance counts
- Orgs are isolated (Org A analytics doesn't include Org B data)

## Acceptance Gate

Analytics dashboard renders with real data for all 5 tabs. Charts display correctly. Engagement score is computed based on org activity.

## Rollback Notes

Read-only aggregation — no data written. Can be disabled by removing the analytics route bank without affecting any source data.
