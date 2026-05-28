# CICT Backend — Systematic Caching Implementation Plan

## Table of Contents

1. [Current State](#current-state)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Generic Cache Utility + Dashboard](#phase-1-generic-cache-utility--dashboard)
4. [Phase 2: News Service](#phase-2-news-service)
5. [Phase 3: Announcement Service](#phase-3-announcement-service)
6. [Phase 4: Event Service](#phase-4-event-service)
7. [Phase 5: Academic Reference Data](#phase-5-academic-reference-data)
8. [Phase 6: User Service](#phase-6-user-service)
9. [Phase 7: Student Service](#phase-7-student-service)
10. [Phase 8: Role Service](#phase-8-role-service)
11. [Phase 9: Organization Service](#phase-9-organization-service)
12. [Phase 10: Remaining Entities](#phase-10-remaining-entities)
13. [Phase 11: Refactor Existing Caches](#phase-11-refactor-existing-caches)
14. [Phase 12: Redis Backend (Future)](#phase-12-redis-backend-future)
15. [Invalidation Matrix](#invalidation-matrix)
16. [Cache Key Design for Lists](#cache-key-design-for-lists)
17. [TTL Reference Table](#ttl-reference-table)

---

## Current State

### Existing Caches

| File | Type | TTL | Used By |
|---|---|---|---|
| `src/utils/userCache.ts` | In-memory `Map<string, CacheEntry>` | 5 min | `rbac.ts` — `buildAuthenticatedUser()` |
| `src/utils/features.ts` | In-memory `Map<string, {data, timestamp}>` | 10 sec | Feature flag lookups via `isFeatureEnabled()` |

### Problem

All other read operations hit MongoDB directly on every request:

- **Dashboard**: 7+ `countDocuments` calls per admin visit
- **List endpoints** (News, Announcements, Events, Users, Students): `find` + `countDocuments` + `populate` per request
- **Detail endpoints**: `findById` + `populate` per request
- **Reference data** (Programs, YearLevels, Sections): full query every time, despite data changing rarely

---

## Architecture Overview

### Core Pattern

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Controller  │ ──→ │   Service    │ ──→ │    Cache    │ ──→ │   MongoDB    │
│  (thin)      │     │  (caching)   │     │  (get/set)  │     │  (on miss)   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                          │                      │
                          │  on write             │  on miss
                          ▼                      ▼
                   Invalidate cache         Store result
                   (detail + list)          in cache
```

### Generic Cache Utility Design

```typescript
// src/utils/cache.ts

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

interface CacheBackend {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttlMs: number): Promise<void>
  del(key: string): Promise<void>
  delPattern(pattern: string): Promise<void>
  clear(): Promise<void>
}

class TypedCache<T> {
  constructor(opts?: {
    ttlMs?: number           // default: 300_000 (5 min)
    namespace?: string       // key prefix for isolation
    maxSize?: number         // LRU max entries
    backend?: CacheBackend   // in-memory Map by default, Redis later
  })

  get(key: string): Promise<T | undefined>
  set(key: string, value: T): Promise<void>
  invalidate(key: string): Promise<void>
  invalidatePattern(regex: RegExp): Promise<void>
  clear(): Promise<void>
  stats(): Promise<{ size: number; hits: number; misses: number }>
}
```

### In-Memory Map Backend (Default)

```typescript
class InMemoryBackend implements CacheBackend {
  private store = new Map<string, CacheEntry<unknown>>()
  private hits = 0
  private misses = 0

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key)
    if (!entry) { this.misses++; return undefined }
    if (Date.now() > entry.expiresAt) { this.store.delete(key); this.misses++; return undefined }
    this.hits++
    return entry.data as T
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, { data: value, expiresAt: Date.now() + ttlMs })
  }

  async del(key: string): Promise<void> { this.store.delete(key) }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key)
    }
  }

  async clear(): Promise<void> { this.store.clear(); this.hits = 0; this.misses = 0 }
}
```

### Service Pattern

Each service file follows this structure:

```typescript
// src/services/entity.service.ts

const detailCache = new TypedCache<EntityType>({
  namespace: 'entity:detail',
  ttlMs: DETAIL_TTL,
})

const listCache = new TypedCache<PaginatedResult<EntityType>>({
  namespace: 'entity:list',
  ttlMs: LIST_TTL,
})

// ——— Reads ———

export const getById = async (id: string): Promise<EntityType | null> => {
  const cached = await detailCache.get(id)
  if (cached) return cached

  const doc = await Model.findById(id).populate(...)
  if (doc) await detailCache.set(id, doc)
  return doc
}

export const getAll = async (query, pagination, user?): Promise<PaginatedResult> => {
  const cacheKey = buildListCacheKey(query, pagination, user)
  const cached = await listCache.get(cacheKey)
  if (cached) return cached

  const [data, total] = await Promise.all([
    Model.find(filter).populate(...).sort(...).skip(skip).limit(limit),
    Model.countDocuments(filter),
  ])

  const result = buildPaginatedResult(data, total, pagination)
  await listCache.set(cacheKey, result)
  return result
}

// ——— Writes (return + invalidate) ———

export const create = async (input): Promise<EntityType> => {
  const doc = await Model.create(input)
  await invalidateAll()
  return doc
}

export const update = async (id, data): Promise<EntityType | null> => {
  const doc = await Model.findByIdAndUpdate(id, data, { new: true }).populate(...)
  await invalidateEntity(id)
  return doc
}

export const remove = async (id): Promise<void> => {
  await Model.findByIdAndDelete(id)
  await invalidateEntity(id)
}

// ——— Internal invalidation ———

const invalidateEntity = async (id: string): Promise<void> => {
  await detailCache.invalidate(id)
  await listCache.clear()
  await dashboardCache.invalidate()
}

const invalidateAll = async (): Promise<void> => {
  await listCache.clear()
  await dashboardCache.invalidate()
}
```

---

## Phase 1: Generic Cache Utility + Dashboard

**Goal**: Create the foundation (`TypedCache<T>`) and cache the most expensive endpoint.

### Files to Create

| File | Action |
|---|---|
| `src/utils/cache.ts` | **CREATE** — `TypedCache<T>` class + `InMemoryBackend` + `CacheBackend` interface |
| `src/services/dashboard.service.ts` | **CREATE** — Dashboard summary caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/admin.controller.ts` | Replace direct `Model.countDocuments()` calls with `dashboardService.getSummary()` |

### Cache Instances

```typescript
// Exported from dashboard.service.ts
const dashboardCache = new TypedCache<DashboardSummary>({
  namespace: 'dashboard',
  ttlMs: 30_000,  // 30 seconds
})
```

### Invalidation

Dashboard is invalidated whenever any entity is created, updated, or deleted. The `dashboardCache.invalidate()` call will be added to every mutation across all phases.

### Controller Migration

**Before:**
```typescript
countTasks.users = User.countDocuments()
countTasks.news = News.countDocuments({ ... })
// ... 5 more countDocuments calls
const resolvedCounts = await Promise.all(...)
```

**After:**
```typescript
const summary = await dashboardService.getSummary(currentUser)
res.status(200).json({ success: true, data: summary })
```

### Test Script

```bash
pnpm run backend:test -- --testPathPattern='admin|dashboard'
```

---

## Phase 2: News Service

**Goal**: Cache all News read operations.

### Files to Create

| File | Action |
|---|---|
| `src/services/news.service.ts` | **CREATE** — News caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/news.controller.ts` | Replace direct `News.find/model` calls with service methods |

### Cache Instances

```typescript
const newsDetailCache = new TypedCache<INews>({ namespace: 'news:detail', ttlMs: 120_000 })
const newsListCache = new TypedCache<PaginatedResult>({ namespace: 'news:list', ttlMs: 30_000 })
```

### Service Functions

```typescript
export const getNewsById(id: string): Promise<INews | null>
export const getAllNews(query, pagination, user?): Promise<PaginatedResult>
export const createNews(data): Promise<INews>
export const updateNews(id, data): Promise<INews | null>
export const deleteNews(id): Promise<void>
export const submitForApproval(id, req): Promise<INews>
export const approveNews(id, req): Promise<INews>
export const rejectNews(id, req): Promise<INews>
export const publishNews(id, req): Promise<INews>
export const archiveNews(id, req): Promise<INews>
```

### Invalidation on Write

| Write Operation | Cache Keys to Invalidate |
|---|---|
| `createNews` | `news:list:*`, `dashboard` |
| `updateNews` | `news:detail:{id}`, `news:list:*`, `dashboard` |
| `deleteNews` | `news:detail:{id}`, `news:list:*`, `dashboard` |
| `publishNews` | `news:detail:{id}`, `news:list:*`, `dashboard` |
| `archiveNews` | `news:detail:{id}`, `news:list:*`, `dashboard` |
| `submitForApproval` | `news:detail:{id}` |
| `approveNews` | `news:detail:{id}`, `news:list:*`, `dashboard` |
| `rejectNews` | `news:detail:{id}` |

---

## Phase 3: Announcement Service

**Goal**: Cache all Announcement read operations. Pattern mirrors News closely.

### Files to Create

| File | Action |
|---|---|
| `src/services/announcement.service.ts` | **CREATE** — Announcement caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/announcement.controller.ts` | Replace direct `Announcement.find/model` calls with service methods |

### Cache Instances

```typescript
const announcementDetailCache = new TypedCache<IAnnouncement>({ namespace: 'announcement:detail', ttlMs: 120_000 })
const announcementListCache = new TypedCache<PaginatedResult>({ namespace: 'announcement:list', ttlMs: 30_000 })
```

### Service Functions

```typescript
export const getAnnouncementById(id: string): Promise<IAnnouncement | null>
export const getAllAnnouncements(query, pagination, user?): Promise<PaginatedResult>
export const getPublicAnnouncements(query, pagination): Promise<PaginatedResult>
export const getPublicAnnouncementById(id: string): Promise<IAnnouncement | null>
export const createAnnouncement(data): Promise<IAnnouncement>
export const updateAnnouncement(id, data): Promise<IAnnouncement | null>
export const deleteAnnouncement(id): Promise<void>
// ... approval workflow methods
```

### Special: Public Endpoints

`getPublicAnnouncements` is unauthenticated. The cache key must omit user context:

```typescript
const buildPublicListCacheKey = (query, pagination) =>
  `public:${JSON.stringify(sortObject(query))}:${pagination.page}:${pagination.limit}`
```

---

## Phase 4: Event Service

**Goal**: Cache all Event read operations.

### Files to Create

| File | Action |
|---|---|
| `src/services/event.service.ts` | **CREATE** — Event caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/event.controller.ts` | Replace direct `Event.find/model` calls with service methods |
| `src/controllers/admin-event-registration.controller.ts` | Use service for event lookups |
| `src/controllers/admin-event-attendance.controller.ts` | Use service for event lookups |
| `src/services/event-workflow.service.ts` | Use service for event lookups |

### Cache Instances

```typescript
const eventDetailCache = new TypedCache<IEvent>({ namespace: 'event:detail', ttlMs: 120_000 })
const eventListCache = new TypedCache<PaginatedResult>({ namespace: 'event:list', ttlMs: 30_000 })
```

### Special: Related Content in Detail

`getEventById` also queries related News and Announcements. Cache the full response:

```typescript
export const getEventById = async (id: string): Promise<EventDetailResponse | null> => {
  const cacheKey = `event:detail:${id}:with-related`
  const cached = await eventDetailCache.get(cacheKey)
  if (cached) return cached as EventDetailResponse

  const event = await Event.findById(id).populate(...)
  if (!event) return null

  const [relatedNews, relatedAnnouncements] = await Promise.all([...])

  const response = { event: serializedEvent, relatedNews, relatedAnnouncements }
  await eventDetailCache.set(cacheKey, response)
  return response
}
```

### Invalidation

When an Event changes, also invalidate related News and Announcement caches:

```typescript
const invalidateEvent = async (id: string): Promise<void> => {
  await eventDetailCache.invalidate(`event:detail:${id}`)
  await eventDetailCache.invalidate(`event:detail:${id}:with-related`)
  await eventListCache.clear()
  await dashboardCache.invalidate()
}
```

---

## Phase 5: Academic Reference Data

**Goal**: Cache Program, YearLevel, and Section (near-static data).

### Files to Create

| File | Action |
|---|---|
| `src/services/academic.service.ts` | **CREATE** — Academic data caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/academic.controller.ts` | Replace direct model calls with service methods |
| `src/controllers/studentAdmin.controller.ts` | Use service for reference lookups |
| `src/controllers/student.controller.ts` | Use service for reference lookups |

### Cache Instances

```typescript
const programCache = new TypedCache<IProgram[]>({ namespace: 'academic:programs', ttlMs: 600_000 })       // 10 min
const yearLevelCache = new TypedCache<IYearLevel[]>({ namespace: 'academic:yearLevels', ttlMs: 600_000 })  // 10 min
const sectionCache = new TypedCache<ISection[]>({ namespace: 'academic:sections', ttlMs: 600_000 })       // 10 min
```

### Why 10-Minute TTL

Programs, Year Levels, and Sections are reference data that changes only at the start of a semester or when an admin manually edits them. A 10-minute TTL is safe and greatly reduces load.

### Invalidation

```typescript
export const invalidateAcademic = async () => {
  await Promise.all([
    programCache.clear(),
    yearLevelCache.clear(),
    sectionCache.clear(),
  ])
}
```

Called on create/update/delete of any Program, YearLevel, or Section.

---

## Phase 6: User Service

**Goal**: Cache User list and detail reads.

### Files to Create

| File | Action |
|---|---|
| `src/services/user.service.ts` | **CREATE** — User caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/user.controller.ts` | Replace direct model calls with service methods |

### Cache Instances

```typescript
const userDetailCache = new TypedCache<SerializedUser>({ namespace: 'user:detail', ttlMs: 300_000 })  // 5 min
const userListCache = new TypedCache<PaginatedResult>({ namespace: 'user:list', ttlMs: 60_000 })     // 1 min
```

### Challenge: Serialization

`getAllUsers` calls `serializeUser()` for each user, which internally calls:
- `getResolvedOrganizationAssignmentsForUser(user._id)` — a find query
- `deriveAdminScopes(...)`, `deriveVisibleAdminModules(...)`, `deriveScopedAdminModulesByOrganization(...)` — pure functions

The serialization result should be cached, not the raw user document:

```typescript
export const getAllUsers = async (query, pagination): Promise<PaginatedResult> => {
  const cacheKey = `list:${JSON.stringify(sortObject(query))}:${pagination.page}:${pagination.limit}`
  const cached = await userListCache.get(cacheKey)
  if (cached) return cached

  const [users, total] = await Promise.all([
    User.find(query).select('-password').populate('customRole', 'name description permissions')
      .sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
    User.countDocuments(query),
  ])

  const serializedUsers = await Promise.all(users.map(u => serializeUser(u)))
  const result = buildPaginatedResult(serializedUsers, total, pagination)
  await userListCache.set(cacheKey, result)
  return result
}
```

### Invalidation

```typescript
export const invalidateUser = async (id: string) => {
  await userDetailCache.invalidate(id)
  await userListCache.clear()
  await dashboardCache.invalidate()
}
```

Called on: `updateUser`, `updateUserRole`, `updateUserStatus`, `deleteUser`, `createUser`

---

## Phase 7: Student Service

**Goal**: Cache Student read operations.

### Files to Create

| File | Action |
|---|---|
| `src/services/student.service.ts` | **CREATE** — Student caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/studentAdmin.controller.ts` | Replace direct model calls with service methods |
| `src/controllers/student.controller.ts` | Use service for profile lookup |
| `src/controllers/student-event.controller.ts` | Use service for student lookups |

### Cache Instances

```typescript
const studentDetailCache = new TypedCache<IStudent>({ namespace: 'student:detail', ttlMs: 120_000 })
const studentListCache = new TypedCache<PaginatedResult>({ namespace: 'student:list', ttlMs: 30_000 })
```

### Invalidation

```typescript
export const invalidateStudent = async (id: string) => {
  await studentDetailCache.invalidate(id)
  await studentListCache.clear()
  await dashboardCache.invalidate()
}
```

Called on: `createStudent`, `updateStudent`, `updateStudentStatus`

---

## Phase 8: Role Service

**Goal**: Cache Role read operations.

### Files to Create

| File | Action |
|---|---|
| `src/services/role.service.ts` | **CREATE** — Role caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/role.controller.ts` | Replace direct model calls with service methods |

### Cache Instances

```typescript
const roleListCache = new TypedCache<SerializedRole[]>({ namespace: 'role:list', ttlMs: 300_000 })  // 5 min
const roleDetailCache = new TypedCache<SerializedRole>({ namespace: 'role:detail', ttlMs: 300_000 })
```

### Challenge: System Roles + Serialization

`getAllRoles` combines:
1. System roles (in-memory catalog) — **no DB query needed, never cache these**
2. Custom roles (from MongoDB) + `User.countDocuments` + `OrganizationAssignment.countDocuments` per role

Cache only the custom roles portion:

```typescript
export const getAllRoles = async (): Promise<SerializedRole[]> => {
  const cached = await roleListCache.get('all')
  if (cached) return cached

  const customRoles = await Role.find({ isSystemRole: false })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })

  const serializedCustomRoles = await Promise.all(
    customRoles.map(role => serializeCustomRole(role))
  )

  const systemRoles = getSystemRoleCatalog().map(role => serializeSystemRole(role))
  const allRoles = [...systemRoles, ...serializedCustomRoles]

  await roleListCache.set('all', allRoles)
  return allRoles
}
```

### Invalidation

```typescript
export const invalidateRoles = async () => {
  await roleListCache.clear()
  await roleDetailCache.clear()
  await dashboardCache.invalidate()
}
```

Called on: `createRole`, `updateRole`, `deleteRole`

---

## Phase 9: Organization Service

**Goal**: Cache Organization read operations (both public and admin).

### Files to Create

| File | Action |
|---|---|
| `src/services/organization.service.ts` | **CREATE** — Organization caching service |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/organization.controller.ts` | Replace direct model calls with service methods |

### Cache Instances

```typescript
const orgDetailCache = new TypedCache<IOrganization>({ namespace: 'org:detail', ttlMs: 300_000 })
const orgListCache = new TypedCache<IOrganization[]>({ namespace: 'org:list', ttlMs: 300_000 })
const orgAdminCache = new TypedCache<OrganizationWithAssignments[]>({ namespace: 'org:admin', ttlMs: 60_000 })
```

### Invalidation

```typescript
export const invalidateOrganization = async (id: string) => {
  await orgDetailCache.invalidate(id)
  await orgListCache.clear()
  await orgAdminCache.clear()
  await dashboardCache.invalidate()
}
```

Called on: `createOrganization`, `updateOrganization`, `deleteOrganization`

---

## Phase 10: Remaining Entities

**Goal**: Cache lower-priority entities.

### Files to Create

| File | Action |
|---|---|
| `src/services/approval.service.ts` | **CREATE** — Approval counts caching |
| `src/services/membership.service.ts` | **CREATE** — Organization membership caching |

### Files to Modify

| File | Change |
|---|---|
| `src/controllers/approval.controller.ts` | Use service for pending/stats |
| `src/controllers/organization-membership.controller.ts` | Use service for membership reads |

### Approval Cache

```typescript
const approvalCache = new TypedCache<ApprovalData>({ namespace: 'approval', ttlMs: 30_000 })

// `getPendingApprovals` — 6 queries (3 find + 3 countDocuments)
// `getApprovalStats` — 3 countDocuments
```

Invalidated when any content is submitted/approved/rejected/published.

### Membership Cache

```typescript
const membershipListCache = new TypedCache<PaginatedResult>({ namespace: 'membership:list', ttlMs: 120_000 })
```

Invalidated on any membership create/update/delete/approve/reject.

---

## Phase 11: Refactor Existing Caches

**Goal**: Replace ad-hoc `userCache.ts` and `features.ts` with `TypedCache<T>`.

### Files to Modify

| File | Change |
|---|---|
| `src/utils/userCache.ts` | **REWRITE** — Use `new TypedCache<IAuthenticatedUser>({ ttlMs: 300_000 })` |
| `src/utils/features.ts` | **REWRITE** — Use `new TypedCache<Record<string, unknown>>({ ttlMs: 10_000 })` |

### Backward Compatibility

Export the same public API so nothing breaks:

```typescript
// src/utils/userCache.ts (after refactor)
import { TypedCache } from './cache'

const userAuthCache = new TypedCache<IAuthenticatedUser>({
  namespace: 'auth:user',
  ttlMs: 5 * 60 * 1000,
})

export const getCachedUser = (key: string) => userAuthCache.get(key)
export const setCachedUser = (key: string, user: IAuthenticatedUser) => userAuthCache.set(key, user)
export const invalidateCachedUser = (key: string) => userAuthCache.invalidate(key)
export const clearUserCache = () => userAuthCache.clear()
export const getCacheStats = () => userAuthCache.stats()
```

---

## Phase 12: Redis Backend (Future)

**Goal**: Swap in-memory cache for Redis without changing any service code.

### Implementation

```typescript
// src/utils/cache-backends/redis.ts
import Redis from 'ioredis'

class RedisBackend implements CacheBackend {
  private redis: Redis
  private prefix: string

  constructor(redisUrl: string, prefix = 'cict:cache:') {
    this.redis = new Redis(redisUrl)
    this.prefix = prefix
  }

  async get<T>(key: string): Promise<T | undefined> {
    const val = await this.redis.get(this.prefix + key)
    return val ? JSON.parse(val) : undefined
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.redis.set(this.prefix + key, JSON.stringify(value), 'PX', ttlMs)
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.prefix + key)
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.prefix + pattern)
    if (keys.length > 0) await this.redis.del(...keys)
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys(this.prefix + '*')
    if (keys.length > 0) await this.redis.del(...keys)
  }
}
```

### Migration

```typescript
// Before (in-memory):
const cache = new TypedCache<INews>({ ... })

// After (same API, different backend):
const cache = new TypedCache<INews>({
  backend: new RedisBackend(process.env.REDIS_URL),
  ...
})
```

No changes needed in any service file.

---

## Invalidation Matrix

Every operation that writes data must invalidate the correct caches. This matrix defines what to invalidate.

### Content Entities (News, Announcement, Event)

| Operation | Own Detail | Own List | Dashboard | Related Entities |
|---|---|---|---|---|
| `create` | — | ✅ Clear | ✅ | — |
| `update` | ✅ Invalidate | ✅ Clear | ✅ | — |
| `delete` | ✅ Invalidate | ✅ Clear | ✅ | — |
| `publish` | ✅ Invalidate | ✅ Clear | ✅ | Push notification |
| `archive` | ✅ Invalidate | ✅ Clear | ✅ | — |
| `submitForApproval` | ✅ Invalidate | — | — | Approval cache |
| `approve` | ✅ Invalidate | ✅ Clear | ✅ | Approval cache |
| `reject` | ✅ Invalidate | — | — | Approval cache |

### Admin Entities (User, Student, Role, Organization)

| Operation | Own Detail | Own List | Dashboard | Related Entities |
|---|---|---|---|---|
| `create` User | — | ✅ Clear | ✅ | — |
| `update` User | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |
| `updateRole` User | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |
| `updateStatus` User | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |
| `delete` User | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |
| `create` Student | — | ✅ Clear | ✅ | Academic refs |
| `update` Student | ✅ Invalidate | ✅ Clear | ✅ | — |
| `updateStatus` Student | ✅ Invalidate | ✅ Clear | ✅ | — |
| `create` Role | — | ✅ Clear | ✅ | — |
| `update` Role | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |
| `delete` Role | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |
| `create` Org | — | ✅ Clear | ✅ | — |
| `update` Org | ✅ Invalidate | ✅ Clear | ✅ | — |
| `delete` Org | ✅ Invalidate | ✅ Clear | ✅ | Auth cache |

### Reference Data

| Operation | Programs | YearLevels | Sections | Dashboard |
|---|---|---|---|---|
| Any program change | ✅ Clear | — | — | ✅ |
| Any year level change | — | ✅ Clear | — | ✅ |
| Any section change | — | — | ✅ Clear | ✅ |

### Membership

| Operation | Membership List | Dashboard | Org Admin |
|---|---|---|---|
| `createMembership` | ✅ Clear | — | ✅ Clear |
| `updateMembership` | ✅ Clear | — | ✅ Clear |
| `deleteMembership` | ✅ Clear | — | ✅ Clear |
| `approveMembership` | ✅ Clear | — | ✅ Clear |
| `rejectMembership` | ✅ Clear | — | ✅ Clear |

---

## Cache Key Design for Lists

List caching is the most complex part because queries vary by filters, search, pagination, and user permissions.

### Key Structure

```
{namespace}:{scope}:{queryHash}:{page}:{limit}
```

### Examples

| Endpoint | Cache Key |
|---|---|
| News list (admin, no filters) | `news:list:global:{}:1:10` |
| News list (admin, filter by status) | `news:list:global:{"status":"published"}:1:10` |
| News list (scoped user) | `news:list:scope_{orgIds_hash}:{"status":"draft"}:1:10` |
| Public announcements | `announcement:list:public:{"type":"general"}:1:10` |
| Students (filtered) | `student:list:global:{"programId":"xxx","status":"active"}:1:10` |

### Scope Hashing Function

```typescript
const hashScope = (user: IAuthenticatedUser): string => {
  const orgIds = user.organizationAssignments?.map(a => a.organizationId).sort() ?? []
  const permissions = user.permissions?.sort() ?? []
  const isGlobal = user.canAccessAdmin && !!user.permissions?.includes(Permission.VIEW_NEWS)

  if (isGlobal) return 'global'

  const scopeKey = `${orgIds.join(',')}|${permissions.join(',')}`
  return `scope_${quickHash(scopeKey)}`
}

const quickHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}
```

### Key Builder

```typescript
const buildListCacheKey = (
  namespace: string,
  filters: Record<string, unknown>,
  pagination: { page: number; limit: number },
  scope: string
): string => {
  const sorted = Object.keys(filters).sort().reduce((acc, k) => {
    acc[k] = filters[k]
    return acc
  }, {} as Record<string, unknown>)

  return `${namespace}:${scope}:${JSON.stringify(sorted)}:${pagination.page}:${pagination.limit}`
}
```

---

## TTL Reference Table

| Data Type | Detail TTL | List TTL | Rationale |
|---|---|---|---|
| **User auth data** | 5 min | — | Already established; invalidated on role/status/assignment change |
| **Feature flags** | 10 sec | — | Needs to be near real-time |
| **Dashboard summary** | — | 30 sec | Needs freshness, busted on mutations |
| **News (detail)** | 2 min | 30 sec | Moderate change frequency |
| **News (list)** | — | 30 sec | Higher freshness need |
| **Announcement (detail)** | 2 min | 30 sec | Same as News |
| **Announcement (list)** | — | 30 sec | Same as News |
| **Event (detail)** | 2 min | 30 sec | Same as News |
| **Event (list)** | — | 30 sec | Same as News |
| **Student** | 2 min | 30 sec | Moderate change frequency |
| **User** | 5 min | 1 min | Rarely changes beyond role/status |
| **Role** | 5 min | 5 min | Rarely changes |
| **Organization** | 5 min | 5 min | Rarely changes |
| **Program** | 10 min | — | Near-static reference data |
| **YearLevel** | 10 min | — | Near-static reference data |
| **Section** | 10 min | — | Near-static reference data |
| **Settings** | 5 min | — | Rarely changes |
| **FAQ content** | 5 min | — | Rarely changes |
| **Approval counts** | — | 30 sec | Needs freshness |
| **Membership list** | — | 2 min | Moderate frequency |
| **Audit logs** | **Do NOT cache** | — | Append-only, always fresh reads |
| **Event attendance logs** | **Do NOT cache** | — | Real-time scan data |
| **Activity logs** | **Do NOT cache** | — | Append-only, always fresh reads |
