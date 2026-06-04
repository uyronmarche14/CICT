# CICT Portal — Remediation Plan

**Status:** Initial audit complete. All findings verified against source code.
**Priority:** Phase 0 must be completed before ANY other work touches auth, secrets, or deployment.

---

## Table of Contents

- Dependency Graph
- Phase 0: Critical Security Remediation
- Phase 1: Structural Fixes
- Phase 2: Infrastructure & DevOps
- Phase 3: Test Coverage
- Phase 4: Feature Completeness & Polish
- Risk Register

---

## Dependency Graph

```
Phase 0 (Security)
  ├── 0.1 (Secrets) ───────── required by ──→ 0.8 (Admin Refresh)
  ├── 0.3 (NODE_ENV) ──────── required by ──→ 0.4 (CSRF Fix)
  ├── 0.4 (CSRF) ──────────── required by ──→ 0.6 (Student Cookies)
  └── 0.6 (Cookies) ───────── required by ──→ 1.1 (Axios Consolidation)
                                                    │
                                                    ▼
Phase 1 (Structural)
  ├── 1.1 (Axios) ─────────── required by ──→ 3.3 (Web Tests)
  ├── 1.4 (OrgId Types) ──── required by ───→ 1.5 (Indexes)
  └── 1.6 (Contracts) ────── independent ───→ can be done anytime
                                                    │
                                                    ▼
Phase 2 (DevOps)
  ├── 2.1 (Secrets) ───────── required by ──→ All deploy workflows
  └── 2.2 (Protection) ────── independent ──→ can be done anytime
                                                    │
                                                    ▼
Phase 3 (Tests)
  ├── 3.1 (Mobile) ────────── depends on ──→ 0.6 (Cookies settled)
  └── 3.2 (Backend) ───────── depends on ──→ 0.x (Security fixes settled)
                                                    │
                                                    ▼
Phase 4 (Polish) ───────────── depends on ──→ Everything above
```

**Parallel work groups:**
- **Group A** (sequential, no parallel): 0.1 → 0.3 → 0.4 → 0.6 → 1.1 → 3.3
- **Group B** (start after 0.1): 0.5, 0.8, 1.3 (independent of each other)
- **Group C** (start after 0.1): 2.1, 2.2, 2.3, 2.5 (independent DevOps tasks)
- **Group D** (start after 1.4): 1.5 (indexes depend on orgId type resolution)
- **Group E** (anytime): 1.6 (contracts split), 2.4 (API rewrites)
- **Group F** (after 0.x): 3.1, 3.2
- **Group G** (after everything): 4.1, 4.2, 4.3

---

## Phase 0: Critical Security Remediation

**Risk: CRITICAL** — Execution cannot wait. Multiple active credential exposures and auth bypasses exist in committed code.

---

### 0.1 — Generate and Replace All JWT/QR/SESSION Secrets

| Finding | Severity | Detail |
|---|---|---|
| All 5 JWT secrets are `replace-me-with-a-strong-*` | CRITICAL | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STUDENT_JWT_SECRET`, `STUDENT_QR_SECRET`, `SESSION_SECRET` are all placeholder values in every `.env.*` file |
| Student refresh secret has broken value | HIGH | `.env` has `STUDENT_REFRESH_SECRET=your-student-refresh-secret]` — trailing `]` plus missing entirely from `.env.production` and `.env.staging` |

**Files to modify:**

| File | Change |
|---|---|
| `apps/backend/.env` | Replace all 6 secrets with `openssl rand -hex 64` generated values |
| `apps/backend/.env.development` | Same — use unique dev-only secrets |
| `apps/backend/.env.production` | Same — use unique production-only secrets |
| `apps/backend/.env.staging` | Same — use unique staging-only secrets |
| `apps/backend/.env.example` | Keep `your-*` placeholders (safe to commit) |

**Procedure:**
1. Run `openssl rand -hex 64` six times to generate six unique 128-character hex strings
2. Assign them to: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STUDENT_JWT_SECRET`, `STUDENT_QR_SECRET`, `STUDENT_REFRESH_SECRET`, `SESSION_SECRET`
3. Remove the broken trailing `]` on the `STUDENT_REFRESH_SECRET` line in `.env`
4. Add `STUDENT_REFRESH_SECRET` to `.env.production` and `.env.staging` (currently missing entirely)

**Complexity:** S | **Risk:** LOW — changing dev secrets invalidates existing sessions (acceptable)

---

### 0.2 — Rotate Exposed MongoDB/Cloudinary/Resend Credentials

**IMPORTANT:** These credentials are committed in git history and cannot be removed by deletion alone.

| Finding | Severity | Detail |
|---|---|---|
| Production MongoDB password | CRITICAL | `mongodb+srv://ronmarcheuy_db_user:VsjRHFT6uqxwnda5@...` in `.env`, `.env.production` |
| Staging MongoDB password | CRITICAL | `mongodb+srv://ronmarcheuy_db_user:OhFNLkIGe4XewFDm@...` in `.env.staging` |
| Cloudinary API key + secret | HIGH | `CLOUDINARY_API_KEY=883134646722524`, `CLOUDINARY_API_SECRET=x4_0HuGihy3nfzsaq_kAPOqmZzk` |
| Resend SMTP password | HIGH | `SMTP_PASS=re_eyddStox_LmU1QriikSmPuk3ewpKZrvYR` in `.env` |

**Files to modify:**

| File | Action |
|---|---|
| `apps/backend/.env` | Replace real credentials with `your-*` placeholders |
| `apps/backend/.env.production` | Same |
| `apps/backend/.env.staging` | Same |

**External steps (before file changes):**
1. Rotate MongoDB password for `ronmarcheuy_db_user` in Atlas dashboard for **both clusters**
2. Rotate Cloudinary API secret in Cloudinary dashboard
3. Rotate Resend API key in Resend dashboard

**Git history purge (after file changes):**
```bash
git filter-repo --path apps/backend/.env --invert-paths
git filter-repo --path apps/backend/.env.production --invert-paths
git filter-repo --path apps/backend/.env.staging --invert-paths
# Force push to all branches after coordination with team
```

**Complexity:** M | **Risk:** HIGH — force push coordination required

---

### 0.3 — Fix NODE_ENV Values

| Finding | Severity | Detail |
|---|---|---|
| `NODE_ENV=development` in `.env.production` and `.env.staging` | CRITICAL | Disables CSRF protection (line 34 of `csrf.ts`), leaks stack traces in errors, enables dev logging |

**Files to modify:**

| File | Line | Change |
|---|---|---|
| `apps/backend/.env.production` | 3 | `NODE_ENV=development` → `NODE_ENV=production` |
| `apps/backend/.env.staging` | 3 | `NODE_ENV=development` → `NODE_ENV=staging` |

**`apps/backend/src/middleware/csrf.ts`** — Update the CSRF skip condition:
```typescript
// Current (line 34):
if (process.env.NODE_ENV === 'development') {

// Change to:
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') {
```
Or better: add a `CSRF_DISABLED` env var for explicit control.

**Complexity:** S | **Risk:** LOW

---

### 0.4 — Fix CSRF Auth Route Exemption

| Finding | Severity | Detail |
|---|---|---|
| All `/api/auth/` and `/api/student/auth/` routes skip CSRF entirely | HIGH | Lines 46-50 of `csrf.ts`. Login, register, forgot-password, reset-password are unprotected when using cookie-based auth. |

**`apps/backend/src/middleware/csrf.ts`** — Replace blanket exemption with targeted per-route opt-out:

```typescript
// Current (lines 45-50):
if (path.startsWith('/api/auth/') || path.startsWith('/api/student/auth/')) {
  next()
  return
}

// Replace with:
const csrfSafeAuthPaths = [
  '/api/auth/profile',
  '/api/auth/permission-metadata',
  '/api/student/auth/me'
];
if (csrfSafeAuthPaths.includes(path) && req.method === 'GET') {
  next();
  return;
}
```

**Complexity:** M | **Risk:** MEDIUM — login may break if CSRF token not being sent correctly from frontend. The admin axios instance already configures `xsrfCookieName: 'csrf_token'` and `xsrfHeaderName: 'X-CSRF-Token'`, so it should work.

---

### 0.5 — Stop Logging Password Reset Tokens

| Finding | Severity | Detail |
|---|---|---|
| Password reset tokens logged in plaintext | HIGH | Lines 33 and 80 of `password-reset.service.ts` log the raw 64-char hex token |

**`apps/backend/src/services/password-reset.service.ts`:**

```typescript
// Line 33 (current):
logger.info(`Password reset token generated for admin user ${email}: ${resetToken}`);
// Change to:
logger.info(`Password reset token generated for admin user ${email}`);

// Line 80 (current):
logger.info(`Password reset token generated for student ${studentNumber}: ${resetToken}`);
// Change to:
logger.info(`Password reset token generated for student ${studentNumber}`);
```

**Complexity:** S | **Risk:** LOW

---

### 0.6 — Move Student Tokens from localStorage to httpOnly Cookies

| Finding | Severity | Detail |
|---|---|---|
| Student tokens in localStorage | HIGH | `student-membership.ts` reads `student_access_token` from localStorage — XSS-vulnerable |
| Duplicate Axios instances | MEDIUM | `student.ts` and `student-membership.ts` have incompatible auth handling |

**Files to modify (5 files):**

**Backend — `apps/backend/src/controllers/studentAuth.controller.ts`:**

After generating tokens on login/refresh, set httpOnly cookies:
```typescript
res.cookie('student_token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
res.cookie('student_refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/student/auth',
});
```

**Frontend — `apps/web/src/lib/api/student.ts`:**
- Already uses `withCredentials: true` — will automatically send cookies
- Remove all localStorage reads/writes
- Merge membership functions from `student-membership.ts`:
  ```typescript
  export const studentMembershipAPI = {
    getMyMemberships: async () => { ... },
    applyToOrg: async (...) => { ... },
    resignFromOrg: async (...) => { ... },
  };
  ```

**Frontend — `apps/web/src/lib/api/student-membership.ts`:**
- **Delete** this file entirely. Its Axios instance, localStorage reads, and refresh logic are all replaced by the cookie-based `student.ts`.

**Frontend — `apps/web/src/context/StudentAuthContext.tsx`:**
- Remove all localStorage reads/writes
- The `studentAuthAPI.me()` call already uses the cookie-based axios instance

**Frontend — update all imports** that reference `student-membership.ts` to use `student.ts` instead.

**Complexity:** M | **Risk:** MEDIUM — all current student sessions will need re-login

---

### 0.7 — Add Admin Refresh Token Mechanism

| Finding | Severity | Detail |
|---|---|---|
| No admin refresh endpoint | HIGH | Admin JWT is 7-day with no rotation. No `/api/auth/refresh-token` route exists despite `refreshToken.ts` calling it. |

**Backend — `apps/backend/src/routes/auth.routes.ts`:**

Add after line 61:
```typescript
router.post(
  '/refresh',
  createAuthSessionRateLimiter(),
  validate(refreshTokenValidator),
  authController.refreshToken
);
```

**Backend — `apps/backend/src/controllers/auth.controller.ts`:**

Add refresh method:
```typescript
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token is required', 400);

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as IJWTPayload;
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw new AppError('Invalid refresh token', 401);

  const accessToken = jwt.sign(
    { userId: String(user._id) },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  const newRefreshToken = jwt.sign(
    { userId: String(user._id) },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );

  req.user = await buildAuthenticatedUser(user);
  const cookieOptions = getAuthCookieOptions();
  res.cookie('token', accessToken, cookieOptions);
  res.cookie('refresh_token', newRefreshToken, {
    ...cookieOptions,
    path: '/api/auth/refresh',
  });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      user: await serializeAuthUser(user),
    },
  });
};
```

**Backend — `apps/backend/src/validators/auth.validator.ts`:**

Add:
```typescript
export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
```

**Frontend — `apps/web/src/lib/api/axios.ts`:**

Add 401 response interceptor:
```typescript
let refreshPromise: Promise<boolean> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }
        const refreshed = await refreshPromise;
        refreshPromise = null;
        if (refreshed) return api(originalRequest);
      } catch {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);
```

**Complexity:** M | **Risk:** MEDIUM — requires thorough testing of admin session lifecycle

---

## Phase 1: Structural Fixes

**Risk: MEDIUM** — Compile-time and data-model fixes. Schema changes require migrations.

---

### 1.1 — Consolidate Web Student Axios Instances

Already covered in Phase 0.6. The sub-steps are:
1. Delete `apps/web/src/lib/api/student-membership.ts`
2. Merge its functions into `apps/web/src/lib/api/student.ts`
3. Update `StudentAuthContext.tsx` imports
4. Update all files importing from `student-membership`
5. Verify with `pnpm run web:typecheck`

**Complexity:** S | **Risk:** LOW

---

### 1.2 — Fix/Add Missing Backend Routes

Conduct a comprehensive endpoint audit. For each frontend API call without a matching backend route:

| Frontend File | Missing Route | Action |
|---|---|---|
| `apps/web/src/lib/api/refreshToken.ts` | `POST /auth/refresh-token` | Add route (Phase 0.7) |
| `apps/web/src/lib/api/media/getPresignedUrl.ts` | `POST /media/presigned-url` | Either add the S3 presigned URL handler or remove the dead code |
| `apps/web/src/lib/api/permissions.ts` | `GET /meta/permissions` | Remove the fallback; primary endpoint works |

**Complexity:** M | **Risk:** LOW

---

### 1.3 — Remove Organization.members Mixed Field

| File | Change |
|---|---|
| `apps/backend/src/models/Organization.ts` | Remove `members: [{ type: Schema.Types.Mixed }]` from schema |
| `packages/contracts/src/index.ts` | Remove `members` from `Organization` type |
| `apps/backend/src/types/index.ts` | Remove `members` from `IOrganization` interface |

**Migration script** (`apps/backend/src/db/migrations/003_remove_org_members.ts`):
```typescript
await Organization.updateMany({}, { $unset: { members: '' } });
```

**Complexity:** S | **Risk:** LOW

---

### 1.4 — Reconcile organizationId Typing Across Models

**Current state:**

| Type | Models |
|---|---|
| **String** (org slug) | `News`, `Event`, `Announcement`, `OrganizationAssignment`, `OrganizationMembership`, `ProcessInstance`, `ActivityLog` |
| **ObjectId** (MongoDB _id) | `OrganizationMember`, `OrgTask`, `OrgMeeting`, `OrgBudget`, `OrgVote`, `OrgTransaction`, `OrgTaskForce`, `ResourceRequest`, `CollaborationSpace` |

**Recommended approach:** Standardize on **String** (org slug) to avoid data migration on the content models (News, Event, Announcement) which have the most data.

**Files to modify** (9 model files):
- `apps/backend/src/models/OrganizationMember.ts`
- `apps/backend/src/models/OrgTask.ts`
- `apps/backend/src/models/OrgMeeting.ts`
- `apps/backend/src/models/OrgBudget.ts`
- `apps/backend/src/models/OrgVote.ts`
- `apps/backend/src/models/OrgTransaction.ts`
- `apps/backend/src/models/OrgTaskForce.ts`
- `apps/backend/src/models/ResourceRequest.ts`
- `apps/backend/src/models/CollaborationSpace.ts`

For each, change: `organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' }`
To: `organizationId: { type: String, required: true, lowercase: true, index: true }`

**Migration script:**
```typescript
const orgs = await Organization.find({}).select('_id id').lean();
const orgMap = new Map(orgs.map(o => [String(o._id), o.id]));

for (const Model of [OrgTask, OrgMeeting, OrgBudget, OrgVote, OrgTransaction,
                     OrgTaskForce, ResourceRequest, CollaborationSpace, OrganizationMember]) {
  const docs = await Model.find({ organizationId: { $type: 'objectId' } }).lean();
  for (const doc of docs) {
    const slug = orgMap.get(String(doc.organizationId));
    if (slug) {
      await Model.updateOne(
        { _id: doc._id },
        { $set: { organizationId: slug } }
      );
    }
  }
}
```

**Complexity:** L | **Risk:** HIGH — data migration; run on backup first

---

### 1.5 — Add Missing Database Indexes

| Model | Index | Reason |
|---|---|---|
| `EventRegistration` | `{ studentId: 1, status: 1 }` | Student event listing |
| `EventAttendanceLog` | `{ studentId: 1 }` | Student attendance history |
| `Event` | `{ startDate: -1 }` | Upcoming events sorting |
| `ActivityLog` | `{ organizationId: 1, createdAt: -1 }` | Org activity log queries |
| `Announcement` | `{ organizationId: 1, publishedAt: -1 }` | Org announcements |
| `News` | `{ organizationId: 1, publishedAt: -1 }` | Org news |

**Files to modify:** Add `index:` or `Schema.index()` declarations in each model file.

**Complexity:** S | **Risk:** LOW — additive only

---

### 1.6 — Split Contracts into Sub-path Exports

Current: `packages/contracts/src/index.ts` — 1755 lines, everything in one file.

**Target structure:**
```
packages/contracts/src/
  index.ts                  # Re-exports everything (backward compat)
  enums/
    user.ts                 # UserRole, Permission
    content.ts              # NewsStatus, EventStatus, etc.
    student.ts              # StudentStatus, EventRegistrationStatus, etc.
    organization.ts         # OrganizationStatus, MembershipStatus, etc.
  types/
    auth.ts                 # User, AuthProfile, AuthTokens
    event.ts                # Event, StudentEvent
    news.ts                 # News
    announcement.ts         # Announcement
    organization.ts         # Organization, OrganizationMembership
    student.ts              # StudentProfile, StudentRegistration
    process.ts              # ProcessTemplate, ProcessInstance
  schemas/
    auth.ts
    event.ts
    news.ts
    announcement.ts
    organization.ts
    student.ts
    process.ts
    common.ts               # mediaAssetSchema, contentSectionSchema, etc.
```

**`package.json` exports addition:**
```json
{
  "exports": {
    ".": { ... },
    "./types": { ... },
    "./schemas": { ... }
  }
}
```

**Procedure:**
1. Create directory structure
2. Split types into individual files with targeted imports
3. Split Zod schemas
4. Create barrel `index.ts` files
5. Update all imports across backend, web, mobile
6. Verify with `pnpm run typecheck`

**Complexity:** XL | **Risk:** HIGH — import resolution across 3 apps must be perfect

---

## Phase 2: Infrastructure & DevOps

**Risk: MEDIUM** — Only affects CI/CD, not runtime.

---

### 2.1 — Configure GitHub Secrets

**External action** — no code changes. Add to GitHub → Settings → Secrets and variables → Actions:

| Secret | Source |
|---|---|
| `RENDER_STAGING_DEPLOY_HOOK` | Render dashboard → Deploy Hooks |
| `RENDER_PRODUCTION_DEPLOY_HOOK` | Render dashboard → Deploy Hooks |
| `RENDER_STAGING_URL` | e.g. `https://cict-backend-staging.onrender.com` |
| `RENDER_PRODUCTION_URL` | e.g. `https://cict-backend.onrender.com` |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_PROJECT_ID` | Vercel project settings |
| `VERCEL_PRODUCTION_URL` | e.g. `https://cict.vercel.app` |

**Complexity:** S | **Risk:** LOW

---

### 2.2 — Enable Branch Protection

**External action** — GitHub Settings → Branches → Add rule for both `main` and `staging`:

- Require pull request before merging
- Require 1 approval
- Dismiss stale reviews
- Require status checks: `contracts-checks`, `backend-checks`, `frontend-checks`, `mobile-checks`, `security-audit`, `dependency-review`
- Require up-to-date branches
- Include administrators

**Complexity:** S | **Risk:** LOW

---

### 2.3 — Add EAS Project ID and Mobile Build Pipeline

**`apps/mobile/app.json`:** Replace `"projectId": "REPLACE_WITH_EXPO_PROJECT_ID"` with real value from Expo dashboard.

**Create `apps/mobile/eas.json`:**
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://cict-backend-staging.onrender.com/api"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://cict-backend.onrender.com/api"
      }
    }
  },
  "submit": { "production": {} }
}
```

**Optional:** Add EAS build step to `deploy-production.yml` workflow.

**Complexity:** M | **Risk:** LOW

---

### 2.4 — Add API Rewrites in next.config.ts

**`apps/web/next.config.ts`:**
```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
    },
  ];
},
```

**Complexity:** S | **Risk:** LOW

---

### 2.5 — Add Dependency Caching to CI

**`.github/workflows/ci.yml`:**
```yaml
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ~/.local/share/pnpm/store
    key: pnpm-store-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      pnpm-store-${{ runner.os }}-
```

**Complexity:** S | **Risk:** LOW

---

## Phase 3: Test Coverage

**Risk: MEDIUM** — Additive only; no production risk.

---

### 3.1 — Write Mobile Tests (0% Coverage → Target)

**Test files to create:**

| Test File | What to Test | Priority |
|---|---|---|
| `apps/mobile/src/services/api/client.test.ts` | Axios interceptor refresh logic, token injection, 401 handling | Critical |
| `apps/mobile/src/store/auth-store.test.ts` | Session state, login/logout transitions | Critical |
| `apps/mobile/src/services/storage/secure-store.test.ts` | Token persistence, error handling | High |
| `apps/mobile/src/features/auth/useLoginMutation.test.ts` | Login flow, session restore | High |
| `apps/mobile/src/features/events/useStudentEvents.test.ts` | Event list fetching | High |
| `apps/mobile/src/components/events/EventCard.test.tsx` | UI rendering | Medium |

**Target:** 30% for `services/api/` and `store/`, 15% overall.

**Complexity:** L | **Risk:** LOW

---

### 3.2 — Write Backend Middleware/Auth Tests

| Test File | What to Test | Priority |
|---|---|---|
| `apps/backend/src/middleware/auth.test.ts` | Token extraction (header/cookie), valid/invalid/expired, deactivated user, cache | Critical |
| `apps/backend/src/middleware/studentAuth.test.ts` | Student token verify, invalid actorType, inactive student, session ID | Critical |
| `apps/backend/src/middleware/csrf.test.ts` | Safe methods pass, token mismatch, missing header, Bearer skip | High |
| `apps/backend/src/middleware/permissions.test.ts` | authorize all/any, isAdmin, insufficient permissions | High |
| `apps/backend/src/middleware/rateLimiters.test.ts` | General/Login/Session/Student limiters, key generation | Medium |
| `apps/backend/src/services/password-reset.service.test.ts` | Token generation, hashing, no plaintext logging | High |

**Target:** 80%+ for middleware, 50%+ overall backend.

**Complexity:** M | **Risk:** LOW

---

### 3.3 — Expand Web Component Tests

| Test File | What to Test | Priority |
|---|---|---|
| `apps/web/src/lib/api/axios.test.ts` | 401 interceptor, refresh flow (after Phase 0.7) | High |
| `apps/web/src/lib/api/student.test.ts` | Login, me, logout + membership functions (after 1.1) | High |
| `apps/web/src/app/student/**/*.test.tsx` | Student pages (events, registration, profile) | Medium |
| `apps/web/src/components/student/**/*.test.tsx` | Student UI components | Medium |

**Target:** 50% for `lib/api/` and `context/`, 30% overall web.

**Complexity:** M | **Risk:** LOW

---

## Phase 4: Feature Completeness & Polish

**Risk: LOW** — All additive; no existing functionality affected.

---

### 4.1 — Complete Remaining Feature Gaps

| Feature | Work Remaining | Files |
|---|---|---|
| Leadership spotlight | Admin UI + public rendering for org leadership section | `apps/web/src/app/(public)/organizations/`, `apps/backend/src/controllers/organization.controller.ts` |
| Richer community summaries | Add summary fields to org public view | `apps/web/src/app/(public)/` |
| Phase 10 RBAC hardening | Verify permission checks on org tool routes | `apps/backend/src/routes/org-*.routes.ts` |

**Complexity:** M | **Risk:** LOW

---

### 4.2 — Add OpenAPI/Swagger Docs

- Add `swagger-jsdoc` and `swagger-ui-express` to `apps/backend/package.json`
- Add Swagger UI serve route at `/api-docs` in `apps/backend/src/app.ts`
- Create `apps/backend/src/config/swagger.ts`
- Add `@openapi` JSDoc annotations to route files

**Complexity:** L | **Risk:** LOW

---

### 4.3 — Add E2E Tests

- Create `apps/web/e2e/` directory with Playwright tests
- Create `apps/web/playwright.config.ts`
- Add `.github/workflows/e2e.yml` workflow

**Test scenarios:**
1. Admin: Login → Dashboard → Create Event → Publish → Logout
2. Student: Login → View Events → Register → View QR → Check In
3. Public: Browse organizations → View news → View events

**Complexity:** XL | **Risk:** LOW

---

## Risk Register

| Risk | Phase | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Force push invalidates open PRs | 0.2 | HIGH | HIGH | Coordinate with all devs 24h in advance; use `git filter-repo` carefully |
| Login breaks after CSRF changes | 0.4 | MEDIUM | HIGH | Test login flows on staging before deploying to production |
| Student sessions invalidated by cookie change | 0.6 | HIGH | MEDIUM | Deploy during low-traffic window; students will re-login |
| orgId type migration corrupts references | 1.4 | MEDIUM | HIGH | Run migration on a DB backup first; verify with aggregation queries |
| Contracts split breaks imports | 1.6 | HIGH | HIGH | Codemod imports; run full monorepo typecheck before merging; do in isolated branch |
| Deploy workflows hang without secrets | 2.1 | HIGH | MEDIUM | Verify secrets one by one before enabling branch protection |
| False confidence from shallow tests | 3.x | MEDIUM | MEDIUM | Use code coverage thresholds (80% for critical paths) |

---

## Summary of All Changes

| Phase | Items | Files Modified | Complexity | Risk |
|---|---|---|---|---|
| **Phase 0: Security** | 8 | ~15 files | Medium | HIGH (credential rotation) |
| **Phase 1: Structural** | 6 | ~50 files | High | MEDIUM (data migration) |
| **Phase 2: DevOps** | 5 | ~5 files | Low | LOW |
| **Phase 3: Tests** | 3 | ~25 new files | Medium | LOW |
| **Phase 4: Polish** | 3 | ~15 files | High | LOW |

**Total:** ~110 file changes across 5 phases.
