# Backend Strengthening Plan — CICT

> **Target:** `/home/ronmarche14/projects/CICT/apps/backend/`
> **Status:** Planned
> **Estimated effort:** 13–19 days across 6 phases

---

## Table of Contents

1. [Phase 1: Security Hardening](#phase-1-security-hardening)
2. [Phase 2: Logic Error Fixes](#phase-2-logic-error-fixes)
3. [Phase 3: Architecture Refactoring](#phase-3-architecture-refactoring)
4. [Phase 4: Scalability & Performance](#phase-4-scalability--performance)
5. [Phase 5: Code Quality & Consistency](#phase-5-code-quality--consistency)
6. [Phase 6: Dead Code & Cleanup](#phase-6-dead-code--cleanup)
7. [Implementation Timeline](#implementation-timeline)
8. [Verification Gates](#verification-gates)

---

## Phase 1: Security Hardening

### P1.1 Fix NoSQL Injection via `$regex`

**Files affected:** 6 controllers — `user.controller.ts`, `news.controller.ts`, `announcement.controller.ts`, `eventRegistration.controller.ts`, `audit.controller.ts`, `studentAdmin.controller.ts`

**Problem:** User-supplied `search`/`q` query parameters are passed directly into MongoDB `$regex` operators without escaping special regex characters. An attacker can craft `.*` to match everything or `^((.*)*)*$` for ReDoS (Regular Expression Denial of Service).

**Implementation steps:**

1. Create `src/utils/escapeRegex.ts`:
   ```ts
   export const escapeRegex = (str: string): string =>
     str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

   export const MAX_SEARCH_LENGTH = 200;

   export const sanitizeSearchInput = (input: unknown): string | null => {
     if (typeof input !== 'string' || !input.trim()) return null;
     const trimmed = input.trim().slice(0, MAX_SEARCH_LENGTH);
     return escapeRegex(trimmed);
   };
   ```

2. Apply in every controller that uses `$regex`:

   | Controller | Line(s) | Fields |
   |---|---|---|
   | `user.controller.ts` | 339–342 | `firstName`, `lastName`, `email` |
   | `news.controller.ts` | 215–219 | `title`, `content` |
   | `announcement.controller.ts` | 239–243 | `title`, `content` |
   | `eventRegistration.controller.ts` | 482–486 | `firstName`, `lastName`, `studentNumber` |
   | `audit.controller.ts` | 37–43 | `action`, `resource`, `user` |
   | `studentAdmin.controller.ts` | search students | `firstName`, `lastName`, `studentNumber` |

   **Pattern:**
   ```ts
   // Before
   { firstName: { $regex: search, $options: 'i' } }

   // After
   const safeSearch = sanitizeSearchInput(search);
   if (!safeSearch) {
     // skip regex condition or return empty result
   }
   { firstName: { $regex: safeSearch, $options: 'i' } }
   ```

3. Add middleware-level validation for search params where missing (express-validator chain):

   ```ts
   query('search')
     .optional()
     .isString().withMessage('Search must be a string')
     .isLength({ max: 200 }).withMessage('Search must be at most 200 characters')
     .trim()
     .escape(),
   ```

---

### P1.2 Fix XSS Sanitization Bypass

**File:** `src/utils/sanitize.ts`

**Problem:** The `sanitize-html` config allows `<iframe>` tags, and `*: ['style', 'class', 'id']` wildcard attributes on all elements. This permits CSS-based data exfiltration and iframe injection.

**Implementation:**

```ts
const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: sanitize.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'figure', 'figcaption', 'blockquote',
    // REMOVED: 'iframe', 'style'
  ]),
  allowedAttributes: {
    // REMOVED: '*' wildcard attributes (no more 'style', 'class', 'id' on all elements)
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'a': ['href', 'name', 'target', 'rel', 'aria-label'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  // REMOVED: allowedSchemesByTag (no iframe)
  // REMOVED: exclusiveFilter (no iframe)
};
```

**Rationale for changes:**

| Change | Reason |
|---|---|
| Remove `<iframe>` | No business need for embedded content in sanitized HTML |
| Remove `*: ['style', 'class', 'id']` | Prevents CSS injection and class-based data exfiltration |
| Remove `allowedSchemesByTag` | No longer needed without iframe |
| Remove `exclusiveFilter` | No longer needed without iframe |

---

### P1.3 Fix Auth Bypass on Organization Creation

**File:** `src/controllers/organization.controller.ts:306`, `src/routes/organization.routes.ts`

**Problem:** `createOrganization` has no authentication check. It also uses `try/catch` with `next(err)` instead of `AppError` pattern.

**Implementation:**

1. Add `authenticate` and `authorize(Permission.CREATE_ORGANIZATION)` to the route:

   ```ts
   // organization.routes.ts
   router.post(
     '/',
     authenticate,
     authorize(Permission.CREATE_ORGANIZATION),
     validate(createOrganizationValidator),
     logActivity('create', 'organization'),
     organizationController.createOrganization
   );
   ```

2. Also add granular permission checks to update/delete:

   ```ts
   router.put(
     '/:orgId',
     authenticate,
     authorize(Permission.EDIT_ORGANIZATION),
     validate(updateOrganizationValidator),
     logActivity('update', 'organization'),
     organizationController.updateOrganization
   );

   router.delete(
     '/:orgId',
     authenticate,
     authorize(Permission.DELETE_ORGANIZATION),
     validate(organizationIdValidator),
     logActivity('delete', 'organization'),
     organizationController.deleteOrganization
   );
   ```

3. Refactor controller functions to use `AppError` instead of `try/catch` + `next(err)`:

   ```ts
   // Before
   try {
     const organization = new Organization(req.body);
     await organization.save();
     res.status(201).json({ success: true, data: organization });
   } catch (error) {
     next(error);
   }

   // After
   const existing = await Organization.findOne({ slug: req.body.slug });
   if (existing) {
     throw new AppError('An organization with this slug already exists', 409);
   }
   const organization = new Organization(req.body);
   await organization.save();
   res.status(201).json({ success: true, data: organization });
   ```

---

### P1.4 Fix Mass Assignment in Student Update

**File:** `src/controllers/studentAdmin.controller.ts:235–265`

**Problem:** The `updates` object assigns every field from `req.body` with no whitelist. An attacker could modify `isActive`, `status`, `password` without restrictions.

**Implementation:**

```ts
const STUDENT_EDITABLE_FIELDS = [
  'firstName', 'lastName', 'email',
  'programId', 'yearLevelId', 'sectionId',
  'contactNumber', 'address',
  'guardianName', 'guardianContact', 'emergencyContact',
] as const;

const updates: Record<string, unknown> = {};
for (const field of STUDENT_EDITABLE_FIELDS) {
  if (req.body[field] !== undefined) {
    updates[field] = req.body[field];
  }
}

// Handle password separately with strict rules
if (req.body.password) {
  if (!req.body.currentPassword) {
    throw new AppError('Current password is required to set a new password', 400);
  }
  // Verify old password
  const student = await Student.findById(req.params.id).select('+passwordHash');
  if (!student) throw new AppError('Student not found', 404);

  const isMatch = await bcrypt.compare(req.body.currentPassword, student.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }
  updates.passwordHash = req.body.password; // Model pre-save hook will hash it
}

// Prevent modification of sensitive fields
const NEVER_EDITABLE = ['isActive', 'status', 'studentNumber', 'role', 'organizations'];
for (const field of NEVER_EDITABLE) {
  if (req.body[field] !== undefined) {
    throw new AppError(`Field '${field}' cannot be modified through this endpoint`, 400);
  }
}
```

---

### P1.5 Fix JWT Secret Fallback Chain

**Files:** `src/controllers/studentAuth.controller.ts:10–17`, `src/middleware/studentAuth.ts:37`, `src/controllers/eventRegistration.controller.ts:22–33`

**Problem:** Multiple places fall back from `STUDENT_JWT_SECRET` to `JWT_SECRET` (admin secret). If admin secret is compromised, student tokens are also compromised.

**Implementation:**

1. Add startup validation in `src/app.ts` or `src/config/index.ts`:

   ```ts
   const REQUIRED_ENV_VARS = [
     'JWT_SECRET',
     'JWT_REFRESH_SECRET',
     'STUDENT_JWT_SECRET',
     'STUDENT_REFRESH_SECRET',
     'STUDENT_QR_SECRET',
     'MONGODB_URI',
   ];

   const missing: string[] = [];
   for (const varName of REQUIRED_ENV_VARS) {
     if (!process.env[varName]) {
       missing.push(varName);
     }
   }

   if (missing.length > 0) {
     console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
     process.exit(1);
   }
   ```

2. Remove fallback chains:

   ```ts
   // studentAuth.controller.ts — before
   const JWT_SECRET = process.env.STUDENT_JWT_SECRET || process.env.JWT_SECRET!;
   const REFRESH_SECRET = process.env.STUDENT_REFRESH_SECRET || process.env.JWT_SECRET!;

   // studentAuth.controller.ts — after
   const STUDENT_JWT_SECRET = process.env.STUDENT_JWT_SECRET!;
   const STUDENT_REFRESH_SECRET = process.env.STUDENT_REFRESH_SECRET!;
   ```

   ```ts
   // studentAuth.ts — before
   const JWT_SECRET = process.env.STUDENT_JWT_SECRET || process.env.JWT_SECRET!;

   // studentAuth.ts — after
   const STUDENT_JWT_SECRET = process.env.STUDENT_JWT_SECRET!;
   ```

   ```ts
   // eventRegistration.controller.ts — before
   const QR_SECRET = process.env.STUDENT_QR_SECRET || process.env.JWT_SECRET!;

   // eventRegistration.controller.ts — after
   const STUDENT_QR_SECRET = process.env.STUDENT_QR_SECRET!;
   ```

---

### P1.6 Add Input Validation on Missing Routes

**Files:** Multiple route files

**Validation chains to add:**

| Route | File | Validators |
|---|---|---|
| `POST /api/roles` | `role.routes.ts` | `name` (required, unique, 3–50 chars), `description` (optional, max 500), `permissions` (array of valid Permission enum values) |
| `PUT /api/roles/:id` | `role.routes.ts` | Same fields as create, all optional. `id` param must be valid ObjectId |
| `POST /:id/members` | `organization.routes.ts` | `name` (required), `role` (enum of valid roles), `email`, `phone`, `position` (all optional) |
| `PUT /:orgId/members/:memberId` | `organization.routes.ts` | Same fields as create, all optional. Both param IDs validated |
| `DELETE /:orgId/members/:memberId` | `organization.routes.ts` | Both param IDs validated as ObjectId |
| `POST /push-token/register` | `pushToken.routes.ts` | `token` (required, non-empty string), `platform` (enum: ios, android, web, optional) |
| `POST /push-token/unregister` | `pushToken.routes.ts` | `token` (required, non-empty string) |

**Example implementation for roles:**

```ts
// role.validator.ts
import { body, param } from 'express-validator';
import { Permission } from '@cict/contracts';

export const createRoleValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Role name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Role name must be 3–50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissions must be an array'),
  body('permissions.*')
    .isIn(Object.values(Permission)).withMessage('Invalid permission value'),
];

export const updateRoleValidator = [
  param('id').isMongoId().withMessage('Invalid role ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Role name must be 3–50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissions must be an array'),
  body('permissions.*')
    .isIn(Object.values(Permission)).withMessage('Invalid permission value'),
];
```

---

### P1.7 Add Sensitive Fields to Activity Logger Redaction

**File:** `src/middleware/activityLogger.ts:63`

**Problem:** The `sanitizeBody` function only redacts `['password', 'token', 'secret', 'apiKey']`. Fields like `refreshToken`, `currentPassword`, `newPassword`, `accessToken`, `qrToken` are logged in plain text to the activity log.

**Implementation:**

```ts
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'refreshToken',
  'accessToken',
  'qrToken',
  'currentPassword',
  'newPassword',
  'authorization',
  'studentNumber',
];
```

Also add a helper to deeply scan nested objects:

```ts
function sanitizeDeep(obj: unknown, depth = 0): unknown {
  if (depth > 5) return '[MAX_DEPTH]'; // prevent circular ref abuse
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeDeep(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeDeep(value, depth + 1);
    }
  }
  return sanitized;
}
```

---

## Phase 2: Logic Error Fixes

### P2.1 Fix Registration Race Conditions

**File:** `src/controllers/eventRegistration.controller.ts:205–286` (`registerForEvent`)

**Problem — three distinct bugs:**

1. **TOCTOU race:** A `findOne` check for existing registration happens before `EventRegistration.create`. Between the check and create, a concurrent request can also pass the check, resulting in duplicate registration. The unique index catches this, but the error handling is incorrect.

2. **Improper rollback:** The catch block at line 283 decrements `registeredCount` on ANY error, including non-duplicate errors (e.g., validation failure on `qrNonce`). The count is inflated with no registration to match it.

3. **No rollback for walk-ins:** Walk-in registration (lines 753–784) increments capacity but has no rollback at all if `EventRegistration.create` fails.

**Implementation:**

**For `registerForEvent`:**

```ts
// Atomic capacity reservation — this is correct, keep as-is
const capacityUpdate = event.maxAttendees && event.maxAttendees > 0
  ? await Event.findOneAndUpdate(
      { _id: event._id, registeredCount: { $lt: event.maxAttendees } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    )
  : await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } }, { new: true });

if (!capacityUpdate) {
  throw new AppError('Event is at full capacity', 400);
}

try {
  const registration = await EventRegistration.create({
    eventId: event._id,
    studentId: student._id,
    status: EventRegistrationStatus.REGISTERED,
    registeredAt: new Date(),
    qrNonce: crypto.randomUUID(),
  });

  return res.status(201).json({ success: true, data: registration });
} catch (error: any) {
  // Rollback capacity on ANY creation failure
  await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: -1 } });

  if (error.code === 11000) {
    throw new AppError('You are already registered for this event', 409);
  }

  throw error; // Let global handler process it
}
```

**For walk-in registration (lines 753–784):**

```ts
// Only increment if this isn't a pre-registered student checking in
if (!existingRegistration) {
  const capacityUpdate = event.maxAttendees && event.maxAttendees > 0
    ? await Event.findOneAndUpdate(
        { _id: event._id, registeredCount: { $lt: event.maxAttendees } },
        { $inc: { registeredCount: 1 } },
        { new: true }
      )
    : await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } }, { new: true });

  if (!capacityUpdate) {
    throw new AppError('Event is at full capacity', 400);
  }

  try {
    // Create registration AND check-in atomically
    const registration = await EventRegistration.create({
      eventId: event._id,
      studentId: student._id,
      status: EventRegistrationStatus.CHECKED_IN,
      registeredAt: new Date(),
      checkedInAt: new Date(),
      qrNonce: crypto.randomUUID(),
    });

    // Increment checkedInCount
    await Event.findByIdAndUpdate(event._id, { $inc: { checkedInCount: 1 } });

    return res.json({ success: true, data: { registration, checkedIn: true } });
  } catch (error: any) {
    // Rollback capacity on failure
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: -1 } });
    throw error;
  }
}
```

---

### P2.2 Add `studentNumber` to Attendance Search

**File:** `src/controllers/eventRegistration.controller.ts:541–544`

**Problem:** `getEventAttendanceLogs` searches registrants by `firstName`/`lastName` only, while `searchEventRegistrations` also includes `studentNumber`. Admin cannot search attendance logs by student number.

**Implementation:**

```ts
// getEventAttendanceLogs (line 541) — add studentNumber
const students = await Student.find({
  $or: [
    { firstName: { $regex: safeSearch, $options: 'i' } },
    { lastName: { $regex: safeSearch, $options: 'i' } },
    { studentNumber: { $regex: safeSearch, $options: 'i' } }, // ADDED
  ],
}).select('_id').lean();
```

Also apply to `exportEventAttendanceLogs` which has the same omission.

---

### P2.3 Simplify Admin Cancel Registration (Remove Redundant Logic)

**File:** `src/controllers/eventRegistration.controller.ts:924–938`

**Problem:** The `if/else` branches have an identical `registeredCount` decrement. The conditional only matters for `checkedInCount`.

**Current:**
```ts
if (!wasCheckedIn) {
  await Event.findOneAndUpdate(
    { _id: eventId, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } }
  );
} else {
  await Event.findOneAndUpdate(
    { _id: eventId, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } }
  );
  await Event.findOneAndUpdate(
    { _id: eventId, checkedInCount: { $gt: 0 } },
    { $inc: { checkedInCount: -1 } }
  );
}
```

**Simplified:**
```ts
// Always decrement registeredCount (guard prevents negative)
await Event.findOneAndUpdate(
  { _id: eventId, registeredCount: { $gt: 0 } },
  { $inc: { registeredCount: -1 } }
);

// Conditionally decrement checkedInCount
if (wasCheckedIn) {
  await Event.findOneAndUpdate(
    { _id: eventId, checkedInCount: { $gt: 0 } },
    { $inc: { checkedInCount: -1 } }
  );
}
```

---

### P2.4 Fix `getAllEvents` — Empty Query Vulnerability

**File:** `src/controllers/event.controller.ts:277`

**Problem:** When `conditions` array is empty (length 0), the query becomes `{}` which matches ALL documents. This affects `news.controller.ts:246` and `announcement.controller.ts:222` as well.

**Context:** This is currently the intended behavior for unauthenticated users (show all published content). But it is fragile — if the access control logic has a bug, all content is exposed to everyone.

**Implementation:**

Add a defensive guard:

```ts
// Before
const query = conditions.length <= 1 ? conditions[0] ?? {} : { $and: conditions };

// After
const query = conditions.length <= 1
  ? conditions[0] ?? { _id: null } // Return empty result instead of all docs
  : { $and: conditions };

// Log a warning if conditions was empty (potential access control bug)
if (conditions.length === 0) {
  console.warn(`[SECURITY] ${req.method} /api/events: empty conditions — returning empty result for unauthenticated user`);
}
```

Alternatively, use `{ status: 'published' }` as the default fallback:

```ts
const query = conditions.length <= 1
  ? conditions[0] ?? { status: ContentStatus.PUBLISHED }
  : { $and: conditions };
```

This is more permissive but still correct — unauthenticated users should only see published content.

---

### P2.5 Fix `adminUpdateRegistrationStatus` State Machine Gap

**File:** `src/controllers/eventRegistration.controller.ts:991–1018`

**Problem:** Transition from CANCELLED to CHECKED_IN (skipping REGISTERED) is not handled. The code assumes REGISTERED exists before CHECKED_IN, but the undo check-in endpoint (line 1157) sets status back to REGISTERED. If an admin directly sets a cancelled registration to checked-in, the `registeredCount` and `checkedInCount` on the Event document become out of sync.

**Implementation:**

Add explicit state transition validation:

```ts
const VALID_TRANSITIONS: Record<string, string[]> = {
  [EventRegistrationStatus.REGISTERED]: [
    EventRegistrationStatus.CHECKED_IN,
    EventRegistrationStatus.CANCELLED,
  ],
  [EventRegistrationStatus.CHECKED_IN]: [
    EventRegistrationStatus.REGISTERED, // undo check-in
  ],
  [EventRegistrationStatus.CANCELLED]: [
    EventRegistrationStatus.REGISTERED, // re-register
  ],
};

const allowedNext = VALID_TRANSITIONS[registration.status];
if (!allowedNext?.includes(status)) {
  throw new AppError(
    `Cannot transition from ${registration.status} to ${status}`,
    400
  );
}

// Handle count adjustments for edge cases
if (registration.status === EventRegistrationStatus.CANCELLED && status === EventRegistrationStatus.CHECKED_IN) {
  // Re-registering a cancelled registration as checked-in
  await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1, checkedInCount: 1 } });
} else if (status === EventRegistrationStatus.CHECKED_IN && !registration.checkedInAt) {
  // Normal check-in
  await Event.findByIdAndUpdate(eventId, { $inc: { checkedInCount: 1 } });
}
```

---

## Phase 3: Architecture Refactoring

### P3.1 Split `eventRegistration.controller.ts` (1180 lines)

**Current state:** 11 exports mixing student registration, admin registration management, QR attendance scanning, and CSV export. This is the largest file in the codebase.

**Target structure:**

```
src/
  controllers/
    student-event.controller.ts          — student flows (originally ~286 lines)
    admin-event-registration.controller.ts — admin registration management (~350 lines)
    admin-event-attendance.controller.ts  — attendance logs, scan, export (~280 lines)
  services/
    event-registration.service.ts         — shared logic (capacity, QR, eligibility, activity logging)
```

**`student-event.controller.ts`** — extracted from lines 145–431:
- `getStudentEvents` — list eligible events
- `registerForEvent` — student self-registration
- `cancelRegistration` — student self-cancellation
- `getStudentRegistration` — check registration status
- `getStudentRegistrations` — list all registrations
- `getStudentQrToken` — generate QR token

**`admin-event-registration.controller.ts`** — extracted from lines 433–648, 887–1155:
- `searchEventRegistrations` — search by name/number
- `getAllRegistrationsForEvent` — paginated registration list
- `adminCreateRegistration` — admin-forced registration
- `adminCancelRegistration` — admin-forced cancellation
- `adminUpdateRegistrationStatus` — status override
- `undoCheckIn` — revert a check-in

**`admin-event-attendance.controller.ts`** — extracted from lines 649–885, 1157–1180:
- `scanEventAttendance` — QR code or manual check-in
- `getEventAttendanceLogs` — paginated attendance log
- `exportEventAttendanceLogs` — CSV export
- `getEventAttendanceStats` — aggregation stats

**`event-registration.service.ts`** — shared logic:

```ts
export class EventRegistrationService {
  static async reserveCapacity(eventId: string, maxAttendees?: number, session?: ClientSession): Promise<boolean> {
    const filter: Record<string, unknown> = { _id: eventId };
    if (maxAttendees && maxAttendees > 0) {
      filter.registeredCount = { $lt: maxAttendees };
    }
    const result = await Event.findOneAndUpdate(
      filter,
      { $inc: { registeredCount: 1 } },
      { new: true, session }
    );
    return !!result;
  }

  static async releaseCapacity(eventId: string, session?: ClientSession): Promise<void> {
    await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $gt: 0 } },
      { $inc: { registeredCount: -1 } },
      { session }
    );
  }

  static generateQrToken(student: IStudent, event: IEvent, registration: IEventRegistration): string {
    return jwt.sign(
      {
        studentId: student._id,
        studentNumber: student.studentNumber,
        eventId: event._id,
        registrationId: registration._id,
        qrNonce: registration.qrNonce,
        qrVersion: 1,
      },
      STUDENT_QR_SECRET,
      { expiresIn: '24h' }
    );
  }

  static isStudentEligible(event: IEvent, student: IStudent): boolean {
    // Check program, year level, section eligibility
    if (!event.targetProgramIds?.length && !event.targetYearLevelIds?.length) {
      return true; // Open to all
    }
    const programMatch = !event.targetProgramIds?.length ||
      event.targetProgramIds.includes(String(student.programId));
    const yearMatch = !event.targetYearLevelIds?.length ||
      event.targetYearLevelIds.includes(String(student.yearLevelId));
    return programMatch && yearMatch;
  }

  static async logActivity(action: string, registration: IEventRegistration, req: AuthRequest): Promise<void> {
    // Standardized activity logging
  }
}
```

---

### P3.2 Split `event.controller.ts` (671 lines)

**Current state:** CRUD + 6 approval/publish/cancel/complete workflows all in one controller.

**Target structure:**

```
src/
  controllers/
    event.controller.ts            — CRUD, thin (delegates to service)
  services/
    event-workflow.service.ts      — status transitions, ownership checks, notification triggers
```

**`event-workflow.service.ts` responsibilities:**

```ts
export class EventWorkflowService {
  // State machine definition
  static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    [ContentStatus.DRAFT]: [ContentStatus.PENDING_APPROVAL],
    [ContentStatus.PENDING_APPROVAL]: [ContentStatus.APPROVED, ContentStatus.REJECTED],
    [ContentStatus.APPROVED]: [ContentStatus.PUBLISHED, ContentStatus.DRAFT],
    [ContentStatus.PUBLISHED]: [ContentStatus.CANCELLED, ContentStatus.COMPLETED],
    [ContentStatus.CANCELLED]: [ContentStatus.DRAFT],
  };

  static canTransition(from: string, to: string): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static async submitForApproval(eventId: string, userId: string): Promise<IEvent> { ... }
  static async approveEvent(eventId: string, userId: string, comment?: string): Promise<IEvent> { ... }
  static async rejectEvent(eventId: string, userId: string, reason: string): Promise<IEvent> { ... }
  static async publishEvent(eventId: string, userId: string): Promise<IEvent> { ... }
  static async cancelEvent(eventId: string, userId: string): Promise<IEvent> { ... }
  static async completeEvent(eventId: string, userId: string): Promise<IEvent> { ... }
}
```

---

### P3.3 Split `user.controller.ts` (662 lines)

**Current state:** User CRUD (7 functions) + Organization assignment management (4 functions) mixed.

**Target structure:**

```
src/
  controllers/
    user.controller.ts                    — CRUD, role assignment, status (lines 1–430)
    organization-assignment.controller.ts — getAssignments, update, remove (lines 433–662)
```

**`organization-assignment.controller.ts`:**

```ts
export const getOrganizationAssignments = async (req: AuthRequest, res: Response) => { ... };
export const updateOrganizationAssignment = async (req: AuthRequest, res: Response) => { ... };
export const removeOrganizationAssignment = async (req: AuthRequest, res: Response) => { ... };
export const getMyOrganizationAssignments = async (req: AuthRequest, res: Response) => { ... };
```

New routes in `src/routes/`:

```ts
// organization-assignment.routes.ts
router.get('/assignments', authenticate, authorize(Permission.MANAGE_ADMIN_ROLES), getOrganizationAssignments);
router.put('/assignments/:id', authenticate, authorize(Permission.MANAGE_ADMIN_ROLES), updateOrganizationAssignment);
router.delete('/assignments/:id', authenticate, authorize(Permission.MANAGE_ADMIN_ROLES), removeOrganizationAssignment);
router.get('/me/assignments', authenticate, getMyOrganizationAssignments);
```

---

### P3.4 Fix Circular Dependency: `rbac.ts` ↔ `organizationScope.ts`

**Problem:**
- `rbac.ts:3` imports `getResolvedOrganizationAssignmentsForUser` from `./organizationScope`
- `organizationScope.ts:10` imports `hasGlobalPermission` from `./rbac`

**Implementation:**

1. Create `src/utils/permission-constants.ts`:

   ```ts
   import { Permission, Role } from '@cict/contracts';
   import type { IAuthenticatedUser } from '../types';

   export const ADMIN_ROLE_SCOPES = {
     [Role.SUPER_ADMIN]: 'global',
     [Role.ADMIN]: 'global',
     [Role.MODERATOR]: 'scoped',
     [Role.SUPPORT]: 'scoped',
   };

   export function hasGlobalPermission(user: IAuthenticatedUser, permission: Permission): boolean {
     if (!user) return false;
     if (user.customRole) {
       return user.customRole.permissions?.includes(permission) ?? false;
     }
     if (user.role && DEFAULT_PERMISSIONS_BY_ROLE[user.role]) {
       return DEFAULT_PERMISSIONS_BY_ROLE[user.role].includes(permission);
     }
     return false;
   }
   ```

2. Both `rbac.ts` and `organizationScope.ts` import from `permission-constants.ts` instead of each other.

3. `organizationScope.ts` changes:

   ```ts
   // BEFORE
   import { hasGlobalPermission } from './rbac';

   // AFTER
   import { hasGlobalPermission } from './permission-constants';
   ```

4. `rbac.ts` changes:

   ```ts
   // Remove import of hasGlobalPermission from itself if present
   // Import what it needs from permission-constants
   import { hasGlobalPermission, ADMIN_ROLE_SCOPES } from './permission-constants';
   ```

---

### P3.5 Add Missing Database Indexes

**Migration script** — create `src/db/migrations/001_add_missing_indexes.ts`:

```ts
import { Event, Announcement, News } from '../models';
import EventAttendanceLog from '../models/EventAttendanceLog';
import ContentApprovalAction from '../models/ContentApprovalAction';
import ActivityLog from '../models/ActivityLog';

export async function up(): Promise<void> {
  // Event indexes
  await Event.collection.createIndex(
    { status: 1, endDate: 1 },
    { background: true, name: 'event_status_endDate' }
  );

  // Announcement indexes
  await Announcement.collection.createIndex(
    { status: 1, isActive: 1, expiresAt: 1 },
    { background: true, name: 'announcement_status_active_expires' }
  );

  // EventAttendanceLog indexes
  await EventAttendanceLog.collection.createIndex(
    { eventId: 1, result: 1 },
    { background: true, name: 'attendance_event_result' }
  );
  await EventAttendanceLog.collection.createIndex(
    { eventId: 1, scanType: 1 },
    { background: true, name: 'attendance_event_scanType' }
  );

  // ContentApprovalAction indexes
  await ContentApprovalAction.collection.createIndex(
    { contentType: 1, contentId: 1, createdAt: -1 },
    { background: true, name: 'approval_contentType_contentId' }
  );

  // ActivityLog indexes
  await ActivityLog.collection.createIndex(
    { resource: 1, action: 1, createdAt: -1 },
    { background: true, name: 'activity_resource_action' }
  );
}
```

**Summary of all indexes to add:**

| Collection | Index | Reason |
|---|---|---|
| `Event` | `{ status: 1, endDate: 1 }` | Upcoming events filter |
| `Event` | `{ title: 'text', description: 'text' }` | Full-text search |
| `Announcement` | `{ status: 1, isActive: 1, expiresAt: 1 }` | Active announcements filter |
| `Announcement` | `{ title: 'text', content: 'text' }` | Full-text search |
| `News` | `{ title: 'text', content: 'text' }` | Full-text search |
| `EventAttendanceLog` | `{ eventId: 1, result: 1 }` | Attendance stats by result |
| `EventAttendanceLog` | `{ eventId: 1, scanType: 1 }` | Attendance stats by scan type |
| `ContentApprovalAction` | `{ contentType: 1, contentId: 1, createdAt: -1 }` | Approval history lookup |
| `ActivityLog` | `{ resource: 1, action: 1, createdAt: -1 }` | Audit log queries |

---

### P3.6 Unify Error Handling Patterns

**Current state — three patterns:**
1. **Pattern A** (`AppError` thrown) — majority of controllers ✓
2. **Pattern B** (`try/catch` + `next(err)`) — `organization.controller.ts`, `organization-membership.controller.ts`, `audit.controller.ts` ✗
3. **Pattern C** (`asyncHandler` wrapper) — `approval.controller.ts` ✗

**Implementation:**

1. Create `src/middleware/asyncHandler.ts`:

   ```ts
   import { Request, Response, NextFunction, RequestHandler } from 'express';

   export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
     (req, res, next) => {
       Promise.resolve(fn(req, res, next)).catch(next);
     };
   ```

2. Convert Pattern B controllers to throw `AppError`:

   ```ts
   // organization.controller.ts — BEFORE
   try {
     const organizations = await Organization.find();
     res.json({ success: true, data: organizations });
   } catch (error) {
     next(error);
   }

   // organization.controller.ts — AFTER
   const organizations = await Organization.find();
   if (!organizations) {
     throw new AppError('No organizations found', 404);
   }
   res.json({ success: true, data: organizations });
   ```

3. Ensure `errorHandler.ts` handles all edge cases:

   ```ts
   // Already handles AppError. Add handling for:
   // - Mongoose ValidationError
   // - Mongoose CastError (invalid ObjectId)
   // - MongoDB duplicate key (code 11000)
   // - SyntaxError from JSON parsing
   // - JWT errors (expired, malformed)
   ```

---

### P3.7 Create Centralized Pagination Utility

**Current state:** Every controller reinvents `page`/`limit` parsing with inconsistent validation. 17+ controllers have their own implementation.

**Implementation:**

Create `src/utils/pagination.ts`:

```ts
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function parsePagination(
  query: Record<string, unknown>,
  defaultLimit = 10,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page), 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(query.limit), 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    pages: Math.ceil(total / params.limit),
    hasNextPage: params.page * params.limit < total,
    hasPrevPage: params.page > 1,
  };
}
```

**Usage in any controller:**

```ts
// Before (inconsistent, varies by controller)
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const skip = (page - 1) * limit;

// After (consistent everywhere)
const { page, limit, skip } = parsePagination(req.query, 10, 100);
const [items, total] = await Promise.all([
  Model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
  Model.countDocuments(query),
]);
res.json({
  success: true,
  ...buildPaginatedResult(items, total, { page, limit, skip }),
});
```

**Standard pagination response shape:**

```json
{
  "success": true,
  "data": [...],
  "total": 250,
  "page": 1,
  "limit": 10,
  "pages": 25,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## Phase 4: Scalability & Performance

### P4.1 Optimize Auth Cache

**File:** `src/middleware/auth.ts:73`, `src/utils/userCache.ts`

**Problem:** `buildAuthenticatedUser` queries the database for user data, custom role, organization assignments, and organization names on every request. The 60-second cache TTL provides minimal relief.

**Implementation:**

1. Increase cache TTL from 60s to 5 minutes:

   ```ts
   // userCache.ts
   private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
   ```

2. Add cache invalidation on role/assignment changes:

   ```ts
   // userCache.ts — add invalidate method
   static invalidate(userId: string): void {
     const key = this.keys.get(userId);
     if (key) {
       this.cache.del(key);
       this.keys.delete(userId);
     }
   }

   static invalidateByOrganization(orgId: string): void {
     // Invalidate all users who have assignments in this org
     for (const [userId, key] of this.keys.entries()) {
       this.cache.del(key);
       this.keys.delete(userId);
     }
   }
   ```

3. Wire invalidation into mutation controllers:

   ```ts
   // user.controller.ts — when role changes
   userCache.invalidate(req.params.id);

   // organization-assignment.controller.ts — when assignment changes
   userCache.invalidate(userId);
   ```

4. Document future Redis migration path:

   ```ts
   // For multi-instance deployment, replace in-memory cache with Redis:
   // import Redis from 'ioredis';
   // const redis = new Redis(process.env.REDIS_URL);
   // const cached = await redis.get(`auth:${userId}`);
   ```

---

### P4.2 Push Notification Error Handling

**File:** `src/services/push-notification.service.ts:99`

**Problem:** `sendToAll` uses `Promise.all` — one failure kills all notifications. Errors are silently logged.

**Implementation:**

```ts
// sendToAll
export async function sendToAll(
  studentIds: string[],
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  const results = await Promise.allSettled(
    studentIds.map((id) => sendToStudent(id, message, data))
  );

  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected'
  );

  if (failures.length > 0) {
    console.error(
      `[PushNotification] ${failures.length}/${results.length} notifications failed`
    );
    // Future: emit metric for CloudWatch/Prometheus
  }
}
```

---

### P4.3 Extract Organization Members to Separate Collection

**File:** `src/models/Organization.ts:57–136`

**Problem:** `members` is an embedded document array with ~20 fields each, including nested arrays. Risk of 16MB document limit for large orgs, O(n) lookups, and race conditions with concurrent modifications via read-modify-write.

**Implementation:**

1. Create `OrganizationMember` model:

   ```ts
   // src/models/OrganizationMember.ts
   import { Schema, model, Document } from 'mongoose';

   export interface IOrganizationMember extends Document {
     organizationId: Schema.Types.ObjectId;
     userId?: Schema.Types.ObjectId;
     name: string;
     role: string;
     email?: string;
     phone?: string;
     photoUrl?: string;
     position?: string;
     isPublic: boolean;
     sortOrder: number;
     startYear?: number;
     endYear?: number;
     timeline: Array<{ year: string; title: string; description?: string }>;
   }

   const organizationMemberSchema = new Schema<IOrganizationMember>(
     {
       organizationId: {
         type: Schema.Types.ObjectId,
         ref: 'Organization',
         required: true,
         index: true,
       },
       userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
       name: { type: String, required: true },
       role: {
         type: String,
         enum: [
           'adviser', 'president', 'vp', 'secretary',
           'treasurer', 'auditor', 'pio', 'member',
         ],
         default: 'member',
       },
       email: String,
       phone: String,
       photoUrl: String,
       position: String,
       isPublic: { type: Boolean, default: true },
       sortOrder: { type: Number, default: 0 },
       startYear: Number,
       endYear: Number,
       timeline: [
         {
           year: { type: String, required: true },
           title: { type: String, required: true },
           description: String,
         },
       ],
     },
     { timestamps: true }
   );

   organizationMemberSchema.index({ organizationId: 1, sortOrder: 1 });
   organizationMemberSchema.index({ organizationId: 1, role: 1 });

   export default model<IOrganizationMember>('OrganizationMember', organizationMemberSchema);
   ```

2. Data migration script:

   ```ts
   // src/db/migrations/002_extract_organization_members.ts
   import Organization from '../../models/Organization';
   import OrganizationMember from '../../models/OrganizationMember';

   export async function up(): Promise<void> {
     const orgs = await Organization.find({}, { members: 1 }).lean();

     for (const org of orgs) {
       if (!org.members?.length) continue;

       const memberDocs = org.members.map((member: any) => ({
         organizationId: org._id,
         userId: member.userId,
         name: member.name,
         role: member.role || 'member',
         email: member.email,
         phone: member.phone,
         photoUrl: member.photoUrl,
         position: member.position,
         isPublic: member.isPublic ?? true,
         sortOrder: member.sortOrder ?? 0,
         startYear: member.startYear,
         endYear: member.endYear,
         timeline: member.timeline || [],
       }));

       await OrganizationMember.insertMany(memberDocs);
     }

     // Remove members field from Organization documents
     await Organization.updateMany({}, { $unset: { members: '' } });
   }
   ```

3. Update controller methods to use new collection instead of embedded array:

   ```ts
   // organization.controller.ts — addMember (before)
   const organization = await Organization.findById(orgId);
   organization.members.push(memberData);
   organization.markModified('members');
   await organization.save();

   // organization.controller.ts — addMember (after)
   const member = await OrganizationMember.create({
     organizationId: orgId,
     ...memberData,
   });
   ```

---

### P4.4 Replace `Date.now()` ID Generation

**File:** `src/controllers/organization.controller.ts:413–416`

**Problem:** Member ID is generated with `Date.now().toString()` which is not unique under high concurrency. Falls back to random append on collision.

**Fix:** When migrating to separate `OrganizationMember` collection (P4.3), MongoDB's native `_id` handles uniqueness automatically:

```ts
// No manual ID generation needed
const member = await OrganizationMember.create({
  organizationId: orgId,
  ...memberData,
});
res.status(201).json({ success: true, data: member });
```

---

## Phase 5: Code Quality & Consistency

### P5.1 Standardize Route Parameter Names

**File:** `src/routes/organization.routes.ts`

**Problem:** Inconsistent param naming — routes use `:id`, `:orgId`, `:memberId` interchangeably, and controller reads from different `req.params` properties.

**Implementation:**

```ts
// Standardized parameter naming:
router.get('/admin', protect, requireAdminAccess, getAdminOrganizations);
router.get('/admin/:orgId/assignments', protect, requireAdminAccess, getAdminOrganizationAssignments);
router.get('/admin/:orgId', protect, requireAdminAccess, getAdminOrganization);
router.get('/', getOrganizations);
router.get('/:orgId', getOrganization);
router.put('/:orgId', authenticate, authorize(Permission.EDIT_ORGANIZATION), validate(updateOrgValidator), updateOrganization);
router.delete('/:orgId', authenticate, authorize(Permission.DELETE_ORGANIZATION), validate(orgIdValidator), deleteOrganization);
router.post('/:orgId/members', authenticate, authorize(Permission.CREATE_MEMBER), validate(createMemberValidator), addMember);
router.put('/:orgId/members/:memberId', authenticate, authorize(Permission.EDIT_MEMBER), validate(updateMemberValidator), updateMember);
router.delete('/:orgId/members/:memberId', authenticate, authorize(Permission.DELETE_MEMBER), validate(memberIdValidator), deleteMember);
```

Update controller to consistently use `req.params.orgId` and `req.params.memberId`.

---

### P5.2 Add Granular Permission Checks to Middleware

**Files:** `news.routes.ts`, `announcement.routes.ts`, `event.routes.ts`, `admin-event.routes.ts`

**Problem:** These routes use `requireAdminAccess` instead of specific `authorize(Permission.EDIT_*)` checks. While controllers check internally, the middleware layer is too permissive — a bug in the controller could bypass authorization.

**Implementation:**

```ts
// news.routes.ts — apply granular permissions
router.post('/', authenticate, authorize(Permission.CREATE_NEWS), validate(createNewsValidator), logActivity('create', 'news'), newsController.createNews);
router.put('/:id', authenticate, authorize(Permission.EDIT_NEWS), validate(updateNewsValidator), logActivity('update', 'news'), newsController.updateNews);
router.delete('/:id', authenticate, authorize(Permission.DELETE_NEWS), validate(newsIdValidator), logActivity('delete', 'news'), newsController.deleteNews);
router.patch('/:id/submit', authenticate, authorize(Permission.APPROVE_CONTENT), logActivity('submit_for_approval', 'news'), newsController.submitNewsForApproval);
router.patch('/:id/approve', authenticate, authorize(Permission.APPROVE_CONTENT), logActivity('approve', 'news'), newsController.approveNews);
router.patch('/:id/reject', authenticate, authorize(Permission.REJECT_CONTENT), logActivity('reject', 'news'), newsController.rejectNews);
router.patch('/:id/publish', authenticate, authorize(Permission.PUBLISH_NEWS), logActivity('publish', 'news'), newsController.publishNews);
router.patch('/:id/archive', authenticate, authorize(Permission.ARCHIVE_NEWS), logActivity('archive', 'news'), newsController.archiveNews);
```

Same pattern for `announcement.routes.ts` and `event.routes.ts`.

For `admin-event.routes.ts`:

```ts
router.use(authenticate, requireAdminAccess);

router.get('/:id/registrations', authorize(Permission.VIEW_EVENT_REGISTRATIONS), validate(eventIdValidator), getEventRegistrations);
router.post('/:id/registrations', authorize(Permission.MANAGE_EVENT_REGISTRATIONS), validate(eventIdValidator), adminCreateRegistration);
router.post('/:id/registrations/:regId/cancel', authorize(Permission.MANAGE_EVENT_REGISTRATIONS), validate(eventRegIdValidator), adminCancelRegistration);
router.patch('/:id/registrations/:regId', authorize(Permission.MANAGE_EVENT_REGISTRATIONS), validate(eventRegIdValidator), adminUpdateRegistrationStatus);
router.post('/:id/registrations/:regId/undo-checkin', authorize(Permission.MANAGE_EVENT_REGISTRATIONS), validate(eventRegIdValidator), undoCheckIn);
router.get('/:id/attendance/logs', authorize(Permission.VIEW_EVENT_REGISTRATIONS), validate(eventIdValidator), getEventAttendanceLogs);
router.get('/:id/attendance/logs/export', authorize(Permission.VIEW_EVENT_REGISTRATIONS), validate(eventIdValidator), exportEventAttendanceLogs);
router.post('/:id/attendance/scan', authorize(Permission.SCAN_EVENT_ATTENDANCE), validate(eventIdValidator), scanEventAttendance);
```

---

### P5.3 Add Missing Rate Limiting

**Rate limiter configuration:**

| Route | Limiter | Config |
|---|---|---|
| `POST /api/student/auth/login` | `studentLoginLimiter` | 10 requests / 15 min |
| `POST /api/student/events/:id/register` | `studentRegisterLimiter` | 30 requests / 15 min per student |
| `POST /api/auth/logout` | Keep existing | 300 requests / 15 min |
| `POST /api/admin/students` | `adminCreateStudentLimiter` | 50 requests / 15 min |
| `PATCH /api/users/:id/role` | `adminRoleChangeLimiter` | 10 requests / 15 min |
| `GET /api/audit/*` | `auditLogLimiter` | 60 requests / 15 min |
| `POST /api/uploads/images` | `uploadLimiter` | 30 requests / 15 min |

**Example implementation:**

```ts
// src/middleware/rateLimiters.ts
import rateLimit from 'express-rate-limit';

export const studentLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const studentRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many registration attempts. Please try again later.' },
});

export const auditLogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many audit log requests.' },
});
```

---

### P5.4 Consolidate Render Configs

**Files:**
- `/render.yaml` — production config
- `/apps/backend/render.yaml` — duplicate
- `/apps/backend/render.staging.yaml` — staging config

**Implementation:**

1. Keep `/apps/backend/render.yaml` as the single source of truth for production:
   - Remove `/render.yaml` or reduce it to a comment referencing `apps/backend/render.yaml`
   - Update root README to reference the correct path

2. Document environment variables in `MANUAL_STEPS.md`:

   ```md
   ## Environment Variables

   | Variable | Required | Purpose |
   |---|---|---|
   | `JWT_SECRET` | Yes | Admin JWT signing |
   | `STUDENT_JWT_SECRET` | Yes | Student JWT signing (must differ from JWT_SECRET) |
   | `STUDENT_REFRESH_SECRET` | Yes | Student refresh token signing |
   | `STUDENT_QR_SECRET` | Yes | QR attendance token signing |
   | `MONGODB_URI` | Yes | Database connection string |
   | `ACTIVITY_LOG_TTL_DAYS` | No | Days to retain activity logs (default: 90) |
   ```

---

### P5.5 Make Activity Log TTL Configurable

**File:** `src/models/ActivityLog.ts:44`

**Implementation:**

```ts
const ACTIVITY_LOG_TTL_DAYS = parseInt(process.env.ACTIVITY_LOG_TTL_DAYS || '90', 10);
const ACTIVITY_LOG_TTL_SECONDS = ACTIVITY_LOG_TTL_DAYS * 24 * 60 * 60;

const activityLogSchema = new Schema(
  {
    // ... existing fields
  },
  { timestamps: true }
);

activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ACTIVITY_LOG_TTL_SECONDS }
);
```

---

### P5.6 Fix `ObjectId` Cast as `any`

**File:** `src/controllers/process.controller.ts:33,192,201`

**Implementation:**

```ts
import mongoose from 'mongoose';

// Before
createdBy: req.user.userId as any

// After
createdBy: new mongoose.Types.ObjectId(req.user.userId)
```

---

### P5.7 Add Student Login Rate Limiting

**Files:** `src/routes/student-auth.routes.ts`

**Problem:** Admin auth has `createAuthLoginRateLimiter` but student login at `POST /api/student/auth/login` has no rate limiting, allowing brute-force attacks on student credentials.

**Implementation:**

```ts
// student-auth.routes.ts
import { studentLoginLimiter, studentRefreshLimiter } from '../middleware/rateLimiters';

router.post('/login', studentLoginLimiter, validate(studentLoginValidator), studentAuthController.loginStudent);
router.post('/refresh', studentRefreshLimiter, validate(studentRefreshValidator), studentAuthController.refreshStudentToken);
router.post('/logout', studentRefreshLimiter, studentAuthController.logoutStudent);
```

---

## Phase 6: Dead Code & Cleanup

### P6.1 Remove Unused Imports

| File | Unused/Redundant Import | Action |
|---|---|---|
| `studentAuth.controller.ts` | `Request` | Remove (not used directly, `StudentAuthRequest` extends it) |
| `organization.controller.ts` | Verify `NextFunction` usage | Remove if not used |
| `auth.controller.ts` | Verify all imports | Remove unused |
| `eventRegistration.controller.ts` | Verify all imports after refactor | Clean up after Phase 3 split |

### P6.2 Remove Duplicate `getPublicAnnouncementQuery`

**File:** `src/controllers/announcement.controller.ts`

**Problem:** `getPublicAnnouncementQuery` (line 68) and inline query building in `getAllAnnouncements` (lines 239–246) both build similar query logic.

**Implementation:**

```ts
// Extract into shared utility
export function getPublicAnnouncementBaseQuery(): Record<string, unknown> {
  return {
    status: ContentStatus.PUBLISHED,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } },
    ],
  };
}
```

Use in both `getPublicAnnouncements` and `getAllAnnouncements` (when filtering for published).

### P6.3 Consolidate Duplicate Utility Functions Across Controllers

| Function | Duplicated In | Action |
|---|---|---|
| `escapeRegex`-like logic | Multiple controllers | Use `escapeRegex.ts` (created in P1.1) |
| Pagination parsing | 17+ controllers | Use `pagination.ts` (created in P3.7) |
| Content status filters | event, news, announcement controllers | Extract to `utils/content-filters.ts` |

---

## Implementation Timeline

| Phase | Effort | Dependencies | Key Deliverables |
|---|---|---|---|
| **P1: Security** | 2–3 days | None | Regex escaping, sanitize config, auth fixes, validation chains, rate limiting, activity logger redaction |
| **P2: Logic** | 1–2 days | P1 (stable code) | Registration race conditions, attendance search, state machine fix, pagination utility, empty query guard |
| **P3: Architecture** | 4–6 days | P1–P2 | Controller splits (eventRegistration, event, user), circular dependency fix, `asyncHandler`, indexes, error handling unification |
| **P4: Scalability** | 3–4 days | P3 (rearchitected controllers) | Auth cache optimization, push notification `allSettled`, org member extraction to separate collection |
| **P5: Consistency** | 2–3 days | P3–P4 | Granular permission middleware, rate limiting, param naming, render config consolidation, configurable TTL, ObjectId cast fix |
| **P6: Cleanup** | 1 day | All above | Unused imports, duplicate utilities, dead code removal |

**Total estimated: 13–19 days**

### Parallel Execution Plan

```
Week 1:    P1 ────── P2 ────── P3 (start)
                     (can overlap with P1)

Week 2:    P3 ────────────────── P4 ──── P5
                                (starts after P3 controller splits)

Week 3:    P5 ────── P6
```

---

## Verification Gates

Every phase must pass the following before the next phase begins:

### Phase 1 Gate

```bash
# Security audit
pnpm run backend:lint
pnpm run backend:typecheck

# Manual security checks
# - Attempt SQL injection on search endpoints
# - Attempt XSS in content body
# - Attempt unauthenticated org creation
# - Verify JWT secrets are required at startup
# - Verify activity log doesn't contain plaintext passwords/tokens
```

### Phase 2 Gate

```bash
# Registration logic tests
pnpm run backend:test

# Manual flow testing
# - Register for event at capacity (should fail)
# - Search attendance by student number (should work)
# - Admin cancel registration (counts should be correct)
# - Pagination on all list endpoints (consistent response shape)
```

### Phase 3 Gate

```bash
# Full test suite
pnpm run backend:test

# Type checking
pnpm run backend:typecheck

# Verify no circular dependencies
npx madge --circular --extensions ts src/

# Index migration test (dry run)
```

### Phase 4 Gate

```bash
# Performance tests
# - 100 concurrent registration requests
# - Auth cache hit ratio > 90%
# - Push notification batch of 1000 (no timeout)

# Load test with autocannon or k6
# - GET /api/events with 500 concurrent users
```

### Phase 5 Gate

```bash
# Integration tests
pnpm run backend:test -- --coverage

# Route audit
# - Every route has: auth + validation + rate limiting (where applicable)
# - Granular permission checks on content routes

# Security scan
pnpm audit
```

### Phase 6 Gate

```bash
# Final verification
pnpm run backend:lint
pnpm run backend:typecheck
pnpm run backend:test
pnpm run backend:build

# Dead code check
npx ts-prune src/
```

---

## Appendix A: File Change Summary

| File | Phase | Action |
|---|---|---|
| `src/utils/escapeRegex.ts` | P1.1 | **CREATE** |
| `src/utils/sanitize.ts` | P1.2 | **MODIFY** |
| `src/routes/organization.routes.ts` | P1.3, P5.1 | **MODIFY** |
| `src/controllers/organization.controller.ts` | P1.3, P2.2, P3.6 | **MODIFY** |
| `src/controllers/studentAdmin.controller.ts` | P1.1, P1.4 | **MODIFY** |
| `src/controllers/studentAuth.controller.ts` | P1.5 | **MODIFY** |
| `src/middleware/studentAuth.ts` | P1.5 | **MODIFY** |
| `src/controllers/eventRegistration.controller.ts` | P1.1, P1.5, P2.1, P2.2, P2.3, P2.5, P3.1 | **MODIFY + SPLIT** |
| `src/controllers/student-event.controller.ts` | P3.1 | **CREATE** |
| `src/controllers/admin-event-registration.controller.ts` | P3.1 | **CREATE** |
| `src/controllers/admin-event-attendance.controller.ts` | P3.1 | **CREATE** |
| `src/services/event-registration.service.ts` | P3.1 | **CREATE** |
| `src/controllers/user.controller.ts` | P1.1, P3.3 | **MODIFY + SPLIT** |
| `src/controllers/organization-assignment.controller.ts` | P3.3 | **CREATE** |
| `src/middleware/activityLogger.ts` | P1.7 | **MODIFY** |
| `src/middleware/asyncHandler.ts` | P3.6 | **CREATE** |
| `src/utils/pagination.ts` | P3.7 | **CREATE** |
| `src/utils/permission-constants.ts` | P3.4 | **CREATE** |
| `src/db/migrations/001_add_missing_indexes.ts` | P3.5 | **CREATE** |
| `src/db/migrations/002_extract_organization_members.ts` | P4.3 | **CREATE** |
| `src/services/push-notification.service.ts` | P4.2 | **MODIFY** |
| `src/models/OrganizationMember.ts` | P4.3 | **CREATE** |
| `src/services/event-workflow.service.ts` | P3.2 | **CREATE** |
| `src/controllers/event.controller.ts` | P3.2 | **MODIFY** |
| `src/utils/content-filters.ts` | P6.3 | **CREATE** |
| `src/routes/news.routes.ts` | P5.2 | **MODIFY** |
| `src/routes/announcement.routes.ts` | P5.2 | **MODIFY** |
| `src/routes/event.routes.ts` | P5.2 | **MODIFY** |
| `src/routes/admin-event.routes.ts` | P5.2 | **MODIFY** |
| `src/routes/student-auth.routes.ts` | P5.7 | **MODIFY** |
| `src/models/ActivityLog.ts` | P5.5 | **MODIFY** |
| `src/controllers/process.controller.ts` | P5.6 | **MODIFY** |

**Total new files:** 12
**Total modified files:** 20
**Total deleted files:** 0

---

## Appendix B: Route Middleware Audit Checklist

After all phases, every route should have:

- [ ] **Authentication** — `authenticate` or `authenticateStudent` or publicly documented
- [ ] **Authorization** — either `requireAdminAccess` for admin-only or granular `authorize(Permission.X)`
- [ ] **Validation** — `validate(...)` with express-validator chains
- [ ] **Rate limiting** — applied to mutation endpoints and auth flows
- [ ] **Activity logging** — `logActivity(action, resource)` for all mutation routes
- [ ] **Consistent error format** — uses `AppError` pattern (not `try/catch` + `next(err)`)

Use the [Route Security Audit] section from `CICT_SYSTEM_DOCUMENTATION.md` as the baseline checklist to verify every route.
