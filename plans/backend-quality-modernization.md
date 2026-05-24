# Backend Quality Modernization Plan

## Guiding Principles

- **Zero regressions** — every phase runs `lint`, `typecheck`, and `test` before merge
- **Incremental** — each phase is independently mergable, 1–3 hours of work
- **Parallel safe** — phases 3–5 have non-overlapping file sets and can run concurrently
- **Branch strategy** — `feature/backend-quality-p1` through `feature/backend-quality-p5`

---

## Dependency Graph

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 5
                │                          ↑
                └──→ Phase 4 (parallel) ────┘
```

Phase 1 foundation → Phase 2 architecture (must be sequential).  
Phases 3 and 4 have non-overlapping file sets → parallel-safe.  
Phase 5 must come after Phase 3 (uses asyncHandler and error codes infrastructure).

---

## Phase 1: Low-Hanging Fruit — Dead Code & Type Safety

**Model tier:** Default  
**Estimated time:** 45 min  
**Branch:** `feature/backend-quality-p1`

### Tasks

| # | Task | Files | Impact |
|---|---|---|---|
| 1.1 | Remove all dead `catch (error) { throw error; }` blocks | `auth.controller.ts`, `news.controller.ts`, `event.controller.ts`, `announcement.controller.ts`, `user.controller.ts`, `role.controller.ts` (42 instances total) | Eliminates misleading dead code |
| 1.2 | Remove `void res` hack, rename param to `_res` | `auth.ts:136` | Clean pattern, no unused var hack |
| 1.3 | Add `process.on('SIGINT')` handler | `server.ts` | Graceful Ctrl+C shutdown |
| 1.4 | Remove redundant `@types/express-validator` | `package.json:55` | Clean dependencies |
| 1.5 | Fix `this: any` → proper generics in Mongoose pre-save hooks | `User.ts:54`, `Student.ts:84` | Type safety in hooks |
| 1.6 | Fix `as any` → proper expo-server-sdk types | `push-notification.service.ts:18` | Type safety for push notifications |

### Context Brief

The controllers contain 42 instances of `catch (error) { throw error; }` — these catch blocks catch the error only to immediately re-throw it unchanged. Since Express 5 natively catches async errors and passes them to the error handler middleware, these blocks are entirely dead code. Removing them leaves cleaner, more readable code.

Similarly, `void res` in `auth.ts` is a hack to suppress TypeScript's `noUnusedParameters` rule — renaming to `_res` follows the standard convention.

### Verification

```bash
pnpm run backend:typecheck && pnpm run backend:lint && pnpm run backend:test
```

### Exit Criteria

- All dead catch/throw blocks removed
- `void res` replaced with `_res` convention
- SIGINT handler present
- No dependency warnings
- All tests pass

---

## Phase 2: Architecture — Extract Service Layer

**Model tier:** Strongest  
**Estimated time:** 2 hr  
**Branch:** `feature/backend-quality-p2`  
**Depends on:** Phase 1

### Tasks

| # | Task | Description |
|---|---|---|
| 2.1 | Create `content.service.ts` | Extract `buildOwnershipFilter`, `buildUpdatePayload`, `canViewUnpublished` from news/event/announcement — shared utility functions |
| 2.2 | Create `content-approval.service.ts` | Extract `submitForApproval`, `approve`, `reject`, `publish`, `archive` approval workflow from news/event/announcement |
| 2.3 | Create `event-registration.service.ts` | Extract business logic from 1174-line `eventRegistration.controller.ts` |
| 2.4 | Create `user.service.ts` | Extract user CRUD from `user.controller.ts` |
| 2.5 | Create `role.service.ts` | Extract role CRUD from `role.controller.ts` |
| 2.6 | Thin down controllers | Each controller becomes a thin layer: parse request → call service → send response |

### Service Pattern

```typescript
// src/services/content-approval.service.ts
import { AppError } from '../middleware/errorHandler';
// ... imports ...

export async function submitForApproval<T extends { status: string; approvalSummary?: any }>(
  id: string,
  user: IAuthenticatedUser,
  Model: mongoose.Model<T>,
  contentType: string,
  permission: Permission
): Promise<T> {
  const item = await Model.findById(id).populate('author', 'firstName lastName email');
  if (!item) throw new AppError(`${contentType} not found`, 404);
  if (item.status !== 'DRAFT') throw new AppError(`Only draft ${contentType} can be submitted for approval`, 400);
  await ensureCanManageOwnedContent(user, permission, (item as any).ownerType, (item as any).organizationId ?? null);
  item.status = 'PENDING_APPROVAL' as any;
  item.approvalSummary = buildSubmittedApprovalSummary(user.userId, item.approvalSummary);
  await item.save();
  await recordContentApprovalAction({ contentType, contentId: id, actorUserId: user.userId, action: 'submitted' });
  return item;
}
```

### Verification

```bash
pnpm run backend:typecheck && pnpm run backend:test
```

### Exit Criteria

- Duplicated `buildOwnershipFilter`, `buildUpdatePayload`, `canViewUnpublished` functions exist only in `content.service.ts`
- Approval workflow exists once in `content-approval.service.ts`
- Controllers are < 200 lines each (down from 648–1174)
- All existing tests pass

---

## Phase 3: Error Handling & Middleware Polish

**Model tier:** Default  
**Estimated time:** 1.5 hr  
**Branch:** `feature/backend-quality-p3`  
**Depends on:** Phase 2

### Tasks

| # | Task | Details |
|---|---|---|
| 3.1 | Create `asyncHandler` utility | Eliminates ALL remaining try/catch in controllers (Express 5 compatible wrapper) |
| 3.2 | Add centralized error codes/constants | Replace inline error strings with `ErrorCodes.NOT_FOUND`, `ErrorCodes.UNAUTHORIZED`, etc. |
| 3.3 | Add `MulterError` handling | Catch file upload errors specifically in `errorHandler.ts` |
| 3.4 | Install `cookie-parser` middleware | Replace fragile manual cookie parsing in `auth.ts` |
| 3.5 | Make rate limiter skip logic robust | Use route metadata instead of `req.path` string matching |
| 3.6 | Add HTML sanitization for `bodyHtml` | XSS prevention via `sanitize-html` or `xss` package |

### Context Brief

Express 5 catches async errors natively, but a wrapper utility (`asyncHandler`) makes the pattern explicit and allows for consistent error enrichment. Currently, every controller uses try/catch with varying patterns — `asyncHandler` standardizes this.

The error handler needs `MulterError` handling because multer errors (file too large, wrong type) are different from standard errors and have their own shape.

Cookie parsing is done manually with string splitting — `cookie-parser` is the standard Express middleware that handles edge cases (URL encoding, quoted values, multiple cookies).

### Verification

```bash
pnpm run backend:typecheck && pnpm run backend:lint && pnpm run backend:test
```

### Exit Criteria

- `asyncHandler` utility exists and is used across all controllers
- Error codes are centralized in a constants file
- Multer errors are caught with user-friendly messages
- Cookie parsing uses `cookie-parser` middleware
- `bodyHtml` fields are sanitized
- All tests pass

---

## Phase 4: Test Coverage Expansion

**Model tier:** Default  
**Estimated time:** 1.5 hr  
**Branch:** `feature/backend-quality-p4`  
**Depends on:** Phase 2 (for service layer to test)

### Tasks

| # | Task | Location | Tests |
|---|---|---|---|
| 4.1 | Add service layer unit tests | `src/tests/unit/services/` | 3–4 per service |
| 4.2 | Add controller unit tests with mocked services | `src/tests/unit/controllers/` | 2–3 per controller |
| 4.3 | Add model schema hook tests | `src/tests/unit/models/` | Password hashing, pre-validate |
| 4.4 | Add utility unit tests for `rbac.ts` | `src/tests/unit/utils/` | Permission ceiling, role derivation |
| 4.5 | Set up code coverage reporting | `vitest.config.ts` | Add `@vitest/coverage-v8` |

### Test Pattern (Unit)

```typescript
// src/tests/unit/services/content-approval.service.test.ts
import { describe, expect, it, vi } from 'vitest';

describe('contentApprovalService', () => {
  it('rejects submission when item is not found', async () => {
    // Mock Model.findById to return null
    const mockModel = { findById: vi.fn().mockResolvedValue(null) };
    await expect(
      submitForApproval('abc', mockUser, mockModel as any, 'news', Permission.SUBMIT_CONTENT_FOR_APPROVAL)
    ).rejects.toThrow('news not found');
  });
});
```

### Test Pattern (Integration — follows existing factories)

```typescript
// Add test to existing security.integration.test.ts or create new integration file
it('enforces content ownership scope on news deletion', async () => {
  const { user: orgAdmin } = await createScopedUser([Permission.DELETE_NEWS], orgId, fullAdmin);
  const res = await request(app)
    .delete(`/api/news/${otherOrgNews._id}`)
    .set(authHeader(orgAdmin.token));
  expect(res.status).toBe(403);
});
```

### Verification

```bash
pnpm run backend:test -- --coverage
```

### Exit Criteria

- Minimum 10 new unit test files
- Minimum 30 new test cases
- Coverage report shows 60%+ line coverage
- All existing tests still pass

---

## Phase 5: Performance, Validation & Final Polish

**Model tier:** Default  
**Estimated time:** 1 hr  
**Branch:** `feature/backend-quality-p5`  
**Depends on:** Phase 3

### Tasks

| # | Task | Impact |
|---|---|---|
| 5.1 | Add in-memory cache for `buildAuthenticatedUser` (Map with 60s TTL) | Reduces DB query on every authenticated request |
| 5.2 | Extract shared validation rules into `validators/shared.ts` | Eliminates 3x duplication of ownerType/orgId/status validation |
| 5.3 | Strengthen email validation regex | Better data quality, RFC-aware pattern |
| 5.4 | Add log rotation via `winston-daily-rotate-file` | Prevents disk bloat in production |
| 5.5 | Set `LOG_TO_FILES=false` as default in `.env.example` | Better dev defaults |
| 5.6 | Resolve `IAuthRequest` vs `AuthRequest` type inconsistency | Type hygiene — one canonical authenticated request type |

### Verification

```bash
pnpm run backend:typecheck && pnpm run backend:lint && pnpm run backend:test
```

### Exit Criteria

- Cached `buildAuthenticatedUser` with TTL eviction
- Shared validation rules imported by all 3+ consumer validators
- Email validation meets RFC 5322 subset
- Log rotation configured
- Single canonical `AuthRequest` type
- All tests pass

---

## Rollback Strategy

Each phase is on its own branch. If a phase breaks CI:

1. Do not merge the PR
2. Fix forward on the same branch
3. If unfixable, close the PR (branch abandoned — no harm to main)

---

## Anti-pattern Catalog

| Anti-pattern | Where Found | Resolution |
|---|---|---|
| Dead `catch(error){throw error}` | 42 instances across 7 controllers | Remove entirely (Express 5 handles async errors) |
| `void res` unused parameter hack | `auth.ts:136` | Rename to `_res` |
| `this: any` in schema hooks | `User.ts:54`, `Student.ts:84` | Use `HydratedDocument<IUser>` generic |
| `as any` import | `push-notification.service.ts:18` | Use proper type import |
| Duplicated helper functions | `buildOwnershipFilter` in 3 files | Extract to shared service |
| Monolithic controllers | `eventRegistration.controller.ts` at 1174 lines | Extract service layer |
| Manual cookie parsing | `auth.ts:13-28` | Use `cookie-parser` middleware |
| Inline error message strings | All controllers | Centralize in error constants |
| Weak email regex | `User.ts:13` | Use RFC-aware pattern |
