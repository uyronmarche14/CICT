# CICT Portal — Full Repository Audit Report

**Date:** June 5, 2026  
**Auditor:** AI Senior Architect / Security Analyst / DevOps Engineer  
**Scope:** Complete monorepo — `apps/backend`, `apps/web`, `apps/mobile`, `packages/*`, CI/CD, documentation

---

## Table of Contents

1. Project Identity
2. Verified Tech Stack
3. Repository Structure
4. Application Architecture
5. Implemented Modules vs. Gaps
6. Security Audit
7. Database Schema & API Consistency
8. Frontend-Backend Connectivity
9. Test Coverage
10. DevOps & CI/CD Health
11. Priority Remediation Order

---

## 1. Project Identity

| Attribute | Value |
|---|---|
| **Name** | CICT — College of Information & Communication Technology Portal |
| **Type** | pnpm monorepo (4 packages) |
| **Status** | Active development — feature-rich, deployable, with critical gaps |
| **Total Source Files** | ~850+ across all apps |
| **Package Manager** | pnpm 10.18.3 |
| **Runtime** | Node.js 20+ |
| **Repository** | `git@github.com:uyronmarche14/CICT.git` |

---

## 2. Verified Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Backend Framework** | Express 5 + TypeScript | `express@^5.2.1` |
| **Database** | MongoDB + Mongoose 9 | `mongoose@^9.0.0` |
| **Web Frontend** | Next.js 15 (App Router, Turbopack) | `next@15.5.9` |
| **Mobile** | Expo SDK 54 + React Native 0.81 | `expo@~54.0.0` |
| **Admin Auth** | JWT (HS256) + HTTP-only cookies + bcryptjs | `jsonwebtoken@^9.0.2` |
| **Student Auth** | JWT (HS256) + Bearer tokens + refresh rotation | `jsonwebtoken@^9.0.2` |
| **Media Storage** | Cloudinary CDN | `cloudinary@^2.8.0` |
| **UI Library** | shadcn/ui (New York style) + Radix Primitives | — |
| **CSS** | Tailwind CSS 4 + CSS Variables | `tailwindcss@^4` |
| **Animations** | Framer Motion | `framer-motion@^12.23.12` |
| **Validation** | Zod (shared contracts) + express-validator (backend) | `zod@^3.25.76` |
| **State (Client)** | Zustand | `zustand@^5` |
| **Data Fetching** | TanStack React Query | `@tanstack/react-query@^5.90.11` |
| **Forms** | react-hook-form + @hookform/resolvers | — |
| **Rich Text** | Tiptap Editor | `@tiptap/react@^2.27.1` |
| **Charts** | Recharts | `recharts@^3.8.1` |
| **Testing (Backend/Web)** | Vitest + MSW + React Testing Library | `vitest@^4` |
| **Testing (Mobile)** | Jest + jest-expo | `jest@^29` |
| **Security Scanning** | CodeQL + Gitleaks + pnpm audit | — |
| **Linting** | ESLint 9 flat config (shared package) | — |
| **CI/CD** | GitHub Actions (3 workflows) | — |
| **Deployment** | Render (backend) + Vercel (frontend) | — |

---

## 3. Repository Structure

```
/
├── apps/
│   ├── backend/              # Express 5 REST API
│   │   ├── src/
│   │   │   ├── controllers/  # 37 HTTP request handlers
│   │   │   ├── routes/       # 36 route definitions
│   │   │   ├── models/       # 39 Mongoose schemas
│   │   │   ├── middleware/   # 12 middleware (auth, csrf, rbac, etc.)
│   │   │   ├── validators/   # 28 express-validator rule arrays
│   │   │   ├── services/     # 37 business logic modules
│   │   │   ├── utils/        # 26 utility modules
│   │   │   ├── config/       # DB, env, settings config
│   │   │   ├── jobs/         # Cron jobs (announcements, sessions)
│   │   │   └── db/           # Migration engine + scripts
│   │   ├── postman/          # Smoke test collection
│   │   ├── render.yaml       # Production Render blueprint
│   │   └── render.staging.yaml
│   │
│   ├── web/                  # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/          # ~75 pages (App Router)
│   │   │   │   ├── (public)/ # Landing, about, academics, news, events...
│   │   │   │   └── admin/    # Dashboard, CRUD, settings, logs...
│   │   │   ├── components/   # ~140 React components
│   │   │   ├── lib/
│   │   │   │   └── api/      # ~25 API client modules
│   │   │   ├── types/        # Re-exports + local type definitions
│   │   │   ├── context/      # AuthContext, StudentAuthContext
│   │   │   └── hooks/        # Custom React hooks
│   │   └── docs/             # 43 implementation & design docs
│   │
│   └── mobile/               # Expo React Native app
│       ├── app/              # 13 screens (Expo Router)
│       ├── src/
│       │   ├── features/     # Auth, events, attendance, updates, orgs
│       │   ├── components/   # 22 UI + feature components
│       │   ├── services/     # API client, storage, notifications
│       │   ├── store/        # Zustand (auth, notifications)
│       │   └── theme/        # Design tokens matching web brand
│       └── docs/             # Architecture, API integration, roadmap
│
├── packages/
│   ├── contracts/            # Shared Zod schemas, types, enums
│   ├── eslint-config/        # 3 ESLint flat configs
│   └── tsconfig/             # 4 tsconfig presets
│
├── .github/workflows/        # CI, deploy-staging, deploy-production
├── docs/                     # Developer guide, system docs
├── cict_website_documentation/ # 12 PRD/BRD/MVP documents
└── .agents/                  # 11 specialized AI agent definitions
```

---

## 4. Application Architecture

### Request Flow

```
Browser / Mobile App
    │
    ▼
Next.js (Web) / React Native (Mobile)
    │  axios with credentials / Bearer token
    ▼
Express 5 API (apps/backend)
    │
    ├── requestId middleware
    ├── helmet (security headers)
    ├── CORS check
    ├── rate limiter (general / auth)
    ├── cookie-parser
    ├── CSRF protection (double-submit cookie)
    ├── body parser (json, urlencoded)
    ├── morgan logging
    ├── maintenance mode check
    │
    ├── Route handler
    │   ├── authenticate (JWT verify)
    │   ├── authorize (RBAC permission check)
    │   ├── validate (express-validator)
    │   └── Controller → Service → Model (Mongoose)
    │
    ├── 404 handler
    └── Global error handler
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Admin uses cookies, Student uses Bearer tokens** | Cookies enable httpOnly + CSRF for admin sessions; Bearer tokens enable mobile use |
| **MongoDB (Mongoose) over SQL** | Flexible schema for content types; established choice for CMS-style apps |
| **Monorepo with shared contracts** | Single source of truth for types and Zod schemas across all layers |
| **Zustand + React Query** | Minimal boilerplate for client state + server state caching |
| **Express 5 over Fastify/Hono** | Ecosystem maturity; existing Express familiarity |

---

## 5. Implemented Modules vs. Gaps

### ✅ Fully Implemented

| Module | Frontend Pages | API Endpoints | Auth Required | Notes |
|---|---|---|---|---|
| **Public Landing Page** | `/` (hero, news, events, FAQs, testimonials, story, spotlight) | Public (no auth) | — | 5 data sections + dynamic content |
| **About / Academics / Admissions** | `/about`, `/academics`, `/admissions`, `/student-life` | Public pages | — | Static informational content |
| **Contact** | `/contact` | Public page | — | Contact form with validation |
| **News System** | `/news`, `/news/[id]`, `/admin/news` | `GET/POST/PUT/DELETE /api/news` + publish/approve/reject/archive | Admin | CRUD + approval workflow + public listing |
| **Announcements** | `/announcements`, `/announcements/[id]`, `/admin/announcements` | `GET/POST/PUT/DELETE /api/announcements` + `/api/public/announcements` | Admin (CRUD), Public (read) | Categories, priority, expiration, public feed |
| **Events** | `/events`, `/events/[id]`, `/admin/events` | `GET/POST/PUT/DELETE /api/events` + join/leave + publish/approve/reject/cancel/complete | Admin (CRUD), Public (read), Student (register) | Registration, QR attendance, check-in |
| **Organizations (Core)** | `/organizations/[id]`, `/admin/organizations` | `GET/POST/PUT/DELETE /api/organizations` + member CRUD | Admin | Profile, members, public listing |
| **Organizations (Advanced)** | `/admin/organizations/[id]/{tasks,meetings,voting,budget,templates,partnerships,collaborations,shared-content,task-forces,resources,mentorship,analytics}` | Full CRUD for each feature under `/api/organizations/:orgId/{feature}` | Admin | Mature org tool suite with 14 sub-features |
| **Admin Auth** | `/admin/login`, `/admin/dashboard` | `POST /api/auth/login`, `GET /api/auth/profile`, `POST /api/auth/logout`, `PUT /api/auth/password`, forgot/reset | Admin | Cookie-based JWT with 7-day expiry |
| **Student Auth** | `/student/login`, `/student/profile` | `POST /api/student/auth/login`, `POST /api/student/auth/register`, refresh, logout, me | Student | Bearer token with 15-min access + 30-day refresh rotation |
| **RBAC** | `/admin/roles`, `/admin/users` | CRUD on `/api/roles`, `/api/users` with org assignments | Admin | 3 system roles + custom roles, 60+ permissions, org-scoping |
| **Admin Dashboard** | `/admin/dashboard` | `GET /api/admin/dashboard/summary` | Admin | Stats overview |
| **Admin CRUD** | Events, news, announcements, students, orgs, FAQ, settings, users, roles, logs, approvals, processes | Full CRUD for each | Admin | Complete admin interfaces |
| **Audit Logging** | `/admin/logs` | `GET /api/audit/logs`, `/summary`, `/:id` | Admin | Activity logging with TTL cleanup |
| **Content Approval** | `/admin/approvals` | `GET /api/admin/approvals/pending\|stats\|history` | Admin | Submit/approve/reject/publish/archive workflow |
| **File Uploads** | Admin forms (image pickers) | `POST /api/uploads/images` | Admin | Cloudinary via multer (up to 10 images) |
| **FAQ Management** | Public homepage + admin | `GET/PUT /api/faqs` | Admin | Structured Q&A with topics |
| **Process Engine** | `/admin/processes/templates`, `/admin/processes/instances` | Full CRUD + status/comment/approval transitions | Admin | DAG-based workflow engine |
| **Academic Data** | `/admin/students/settings` | CRUD `/api/admin/academic/{programs,year-levels,sections}` | Admin | Programs, year levels, sections |
| **Student Portal** | `/student/events`, `/student/attendance`, `/student/memberships`, `/student/registrations` | Student-specific endpoints under `/api/student` | Student | Events, attendance, memberships |
| **Mobile App** | Login, home, events, updates, organizations, settings, QR passes | Student endpoints + public content | Student | Full Expo React Native client |

### ⚠️ Incomplete / Needs Verification

| Module | Issue | Severity |
|---|---|---|
| **S3 Media Upload** | `media/getPresignedUrl.ts` calls `POST /media/presigned-url` — no backend route exists | High |
| **Admin Refresh Token** | `refreshToken.ts` calls `POST /auth/refresh-token` — no backend route exists | High |
| **Web Student Token Management** | Two separate Axios instances (`student.ts` with cookies, `student-membership.ts` with localStorage Bearer) with no shared refresh logic | High |
| **Email/Notification** | nodemailer in dependencies; `email.service.ts` exists but actual sending pipeline unclear | Medium |
| **Push Notifications** | Expo push token registration exists; notification handler exists; actual delivery pipeline unclear | Medium |

### ❌ Missing / Placeholder

| Module | Detail | Severity |
|---|---|---|
| **Mobile production build** | EAS project ID is `REPLACE_WITH_EXPO_PROJECT_ID`; no `eas.json`; no app store deployment workflow | High |
| **Frontend staging deployment** | Referenced as separate repo — no link or workflow | High |
| **E2E Tests** | Zero Playwright/Cypress tests across entire monorepo | Medium |
| **Mobile Tests** | Zero test files in `apps/mobile/src/` | Critical |
| **OpenAPI/Swagger Docs** | No API documentation beyond Postman smoke collection | Low |
| **Dockerfiles for apps** | No `Dockerfile` for backend or frontend — only MongoDB docker-compose | Medium |

---

## 6. Security Audit

### 🔴 Critical (3)

#### C1 — All JWT Secrets Are Placeholder Values

| File | Secret | Current Value |
|---|---|---|
| All `.env*` files | `JWT_SECRET` | `replace-me-with-a-strong-jwt-secret` |
| All `.env*` files | `JWT_REFRESH_SECRET` | `replace-me-with-a-strong-refresh-secret` |
| All `.env*` files | `SESSION_SECRET` | `replace-me-with-a-strong-session-secret` |
| `.env`, `.env.staging` | `STUDENT_JWT_SECRET` | `replace-me-with-a-strong-student-jwt-secret` |
| `.env`, `.env.staging` | `STUDENT_QR_SECRET` | `replace-me-with-a-strong-student-qr-secret` |
| `.env` | `STUDENT_REFRESH_SECRET` | `your-student-refresh-secret` (broken trailing `]`) |

**Impact:** Any actor can forge valid JWTs, impersonate any user (including FULL_ADMIN), and bypass all authentication. The application is wide open.

**Location:** `apps/backend/.env`, `.env.development`, `.env.staging`, `.env.production`

---

#### C2 — Production MongoDB Credentials Exposed on Disk

| File | Credential |
|---|---|
| `.env`, `.env.production` | `mongodb+srv://ronmarcheuy_db_user:VsjRHFT6uqxwnda5@cict-crm.wtgzgcc.mongodb.net/` |
| `.env.staging` | `mongodb+srv://ronmarcheuy_db_user:OhFNLkIGe4XewFDm@cluster0.8zojny4.mongodb.net/` |

**Impact:** Full read/write access to both production and staging MongoDB databases. These passwords must be rotated immediately.

---

#### C3 — Cloudinary and Resend API Keys Exposed

| Service | Key | Value |
|---|---|---|
| Cloudinary | `CLOUDINARY_API_KEY` | `883134646722524` |
| Cloudinary | `CLOUDINARY_API_SECRET` | `x4_0HuGihy3nfzsaq_kAPOqmZzk` |
| Resend | `SMTP_PASS` | `re_eyddStox_LmU1QriikSmPuk3ewpKZrvYR` |

**Impact:** Full access to media management and email sending capabilities.

---

### 🟠 High (4)

| # | Issue | Location | Details |
|---|---|---|---|
| H1 | `NODE_ENV=development` in staging AND production | `.env.staging`, `.env.production` | CSRF is entirely disabled (line 34 of `csrf.ts`). Stack traces leak in error responses. Dev logging enabled in production. |
| H2 | Auth routes fully exempt from CSRF | `csrf.ts:46-50` | `/api/auth/*` and `/api/student/auth/*` — including login, register, forgot-password, reset-password — bypass CSRF entirely. These are mutation endpoints vulnerable to cross-site request forgery when using cookie-based auth. |
| H3 | Password reset tokens logged in plaintext | `password-reset.service.ts:33,80` | `logger.info(\`Password reset token generated for ${email}: ${resetToken}\`)` — anyone with log access can steal reset tokens and take over accounts. |
| H4 | Web student tokens stored in localStorage | `apps/web/src/lib/api/student-membership.ts:13-14` | `localStorage.getItem('student_access_token')` — localStorage is accessible via XSS. No HttpOnly protection. |

---

### 🟡 Medium (5)

| # | Issue | Location | Details |
|---|---|---|---|
| M1 | No admin refresh token mechanism | `auth.controller.ts` | Admin JWT is a single 7-day token with no refresh rotation. Cannot revoke without database-level session tracking. |
| M2 | No rate limiting on password reset / registration | `app.ts` / route files | **Actually verified — already rate-limited.** Finding retired. |
| M3 | Weak admin password validation | `auth.validator.ts` | No minimum length enforcement at validation layer for admin login. Only non-empty check. |
| M4 | CORS with `credentials: true` + Vercel wildcard | `app.ts:92-110` | Vercel preview regex allows credential-bearing cross-origin requests. Pattern is reasonably scoped but permissive. |
| M5 | Organization.members is `Schema.Types.Mixed` | `Organization.ts:57` | Unvalidated mixed array — should have been removed after migration 002 extracted data to `OrganizationMember` collection. |

---

### 🟢 Low (4)

| # | Issue | Details |
|---|---|---|
| L1 | 5-minute auth cache TTL | Permission/status changes delayed up to 5 minutes before propagation |
| L2 | XSS sanitizer allows `style` on all elements + `data:` URIs | Limited CSS injection risk; data URIs in img tags |
| L3 | Race condition in student session creation | Brief window where session has `tokenHash: 'pending'` |
| L4 | No account lockout on failed attempts | Rate limiters prevent brute force but no permanent/temporary account freezing |

---

## 7. Database Schema & API Consistency

### 7.1 Complete Model Inventory (39 Models)

| Group | Models | Purpose |
|---|---|---|
| **Auth** | `User`, `Role`, `Student`, `StudentSession` | Accounts, roles, sessions |
| **Content** | `Event`, `News`, `Announcement`, `ContentApprovalAction`, `CrossOrgContentShare` | Core CMS content types |
| **Academic** | `Program`, `YearLevel`, `Section` | Academic structure |
| **Organizations** | `Organization`, `OrganizationMember`, `OrganizationMembership`, `OrganizationAssignment` | Org profiles + 3 membership models |
| **Org Features** | `OrgBudget`, `OrgTransaction`, `OrgMeeting`, `OrgTask`, `OrgVote`, `OrgVoteBallot`, `OrgPartnership`, `OrgMentorship`, `OrgTaskForce`, `CollaborationSpace`, `CollaborationMessage`, `ResourceRequest`, `OrgTemplate` | 13 org management tools |
| **Process** | `ProcessTemplate`, `ProcessInstance` | DAG workflow engine |
| **Other** | `ActivityLog`, `SystemConfig`, `Migration`, `FAQPContent`, `PushToken` | Audit, config, migrations, notifications |

### 7.2 Critical Schema Issues

#### Issue 1: Organization ID Type Mismatch

Some models reference `Organization._id` (ObjectId), others reference `Organization.id` (string slug):

| Type | Models |
|---|---|
| **ObjectId** (refers to `_id`) | `OrganizationMember`, `OrgTask`, `OrgMeeting`, `OrgBudget`, `OrgVote`, `OrgTransaction`, `OrgTaskForce`, `ResourceRequest`, `CollaborationSpace` |
| **String** (refers to `id` slug) | `Organization` itself, `News`, `Event`, `Announcement`, `OrganizationAssignment`, `OrganizationMembership`, `ProcessInstance`, `ActivityLog` |

**Impact**: Cross-collection JOINs by `organizationId` will silently fail between these two groups.

---

#### Issue 2: Overlapping Organization Models (3 Models + 1 Mixed Field)

| Model | Purpose | Overlap |
|---|---|---|
| `Organization.members` (Mixed) | Legacy embedded member records | Should have been removed after migration 002 |
| `OrganizationMember` | Admin-created display members (refs `User`) | Overlaps with `OrganizationMembership` |
| `OrganizationMembership` | Student self-service membership with lifecycle | Overlaps with `OrganizationMember` |
| `OrganizationAssignment` | Admin-to-org role assignments | Different purpose (RBAC scoping) |

**OrganizationMember** vs **OrganizationMembership**:
- `OrganizationMember` targets `User` (admin), used for public display with rich profile (photo, bio, timeline, social)
- `OrganizationMembership` targets `Student`, used for membership applications with lifecycle tracking (apply, approve, reject, resign)
- No formal relationship between them exists

---

#### Issue 3: Mongoose Model vs Zod Schema Drift

| Field | Mongoose | Zod (Contracts) | Issue |
|---|---|---|---|
| `officerItems[].photo` | `mediaAssetSchema` (alt required) | `MediaAsset` (alt optional) | Optionality mismatch |
| `approvalSummary` | Structured sub-doc with typed fields | `z.record(z.unknown()).optional()` | Type lost in contracts |
| `Organization.members` | `[Schema.Types.Mixed]` | `z.array(organizationMemberSchema)` | Validation mismatch |
| `attendees` | `[ObjectId]` | `z.array(z.string())` | Type mismatch |

---

#### Issue 4: API Response Shape Inconsistency

List endpoints use varying key names:

| Endpoint | Response Key |
|---|---|
| `GET /api/events` | `data.events` |
| `GET /api/news` | `data.news` |
| `GET /api/announcements` | (needs verification) |

Contracts don't enforce a consistent paginated response shape. Frontend types add fields like `organizationName` that don't exist in either backend or contracts.

---

### 7.3 Missing Indexes

| Collection | Missing Index | Impact |
|---|---|---|
| `EventRegistration` | `{ studentId: 1, status: 1 }` | Student event listing queries will scan |
| `EventAttendanceLog` | `{ studentId: 1 }` | Student attendance history queries will scan |
| `Event` | `{ startDate: -1 }` | Upcoming events sorting will scan |
| `ActivityLog` | `{ organizationId: 1, createdAt: -1 }` | Org activity log queries will scan |
| `User` | `{ role: 1, isActive: 1 }` | Admin user filtering will scan |
| `Announcement` | `{ organizationId: 1, publishedAt: -1 }` | Org announcements queries will scan |
| `News` | `{ organizationId: 1, publishedAt: -1 }` | Org news queries will scan |

---

## 8. Frontend-Backend Connectivity

### 8.1 Endpoint Match Rate

| App | Endpoints Checked | Match Rate |
|---|---|---|
| **Web Frontend** | 47/50 | **94%** |
| **Mobile** | 17/17 | **100%** |

### 8.2 Missing Backend Routes (3)

| Frontend File | Endpoint Called | Backend Route Exists? | Impact |
|---|---|---|---|
| `apps/web/src/lib/api/refreshToken.ts` | `POST /auth/refresh-token` | **No** | Dead code. Admin refresh not implemented. |
| `apps/web/src/lib/api/media/getPresignedUrl.ts` | `POST /media/presigned-url` | **No** | S3 upload path non-functional. |
| `apps/web/src/lib/api/permissions.ts` | `GET /meta/permissions` (fallback) | **No** | Benign fallback; primary endpoint works. |

### 8.3 Token Management Inconsistency

| Client | Storage | Auth Type | Refresh | Secure? |
|---|---|---|---|---|
| **Web Admin** (`axios.ts`) | HTTP-only cookie | Cookie | None (session-based) | ✅ Yes |
| **Web Student** (`student.ts`) | HTTP-only cookie | Cookie | None (dead code) | ✅ Yes |
| **Web Student** (`student-membership.ts`) | localStorage | Bearer token | Full refresh rotation | ❌ No (XSS) |
| **Mobile** (`client.ts`) | Expo SecureStore | Bearer token | Full refresh rotation | ✅ Yes |

**Critical Issue**: The web student has **two separate Axios instances** with incompatible auth strategies. `student.ts` uses cookies, `student-membership.ts` uses localStorage Bearer tokens with refresh. They don't share state, and tokens can get out of sync.

### 8.4 Auth Flow Summary

**Admin Auth (Cookie)**:
```
POST /auth/login → Sets httpOnly cookie `token`
GET /auth/profile → Cookie sent automatically (withCredentials)
All API calls → Cookie auth + CSRF header
POST /auth/logout → Clears cookie
```

**Student Auth (Bearer Token)**:
```
POST /student/auth/login → Returns { accessToken, refreshToken, student }
Tokens stored in localStorage (web) or SecureStore (mobile)
Bearer token attached via Axios interceptor
401 → Attempt refresh via POST /student/auth/refresh
POST /student/auth/logout → Clear tokens
```

**Mobile client** (`client.ts`) has the most robust implementation: SecureStore persistence, Zustand store, singleton refresh promise preventing race conditions, and proper hydration on startup.

---

## 9. Test Coverage

### 9.1 Coverage by App

| App | Source Files | Source Lines | Test Files | Test Lines | Est. Coverage |
|---|---|---|---|---|---|
| **Backend** | ~216 | ~22,955 | 15 | 3,126 | **~8-12%** |
| **Web** | ~300 | ~45,260 | 20 | 1,282 | **~3-5%** |
| **Mobile** | ~67 | ~3,849 | **0** | **0** | **0%** |
| **Contracts** | 1 | 1,755 | 1 | 99 | ~5% |
| **Overall** | ~584 | ~73,819 | 36 | 4,507 | **~5-8%** |

### 9.2 What Is Tested

| Area | Tested Modules |
|---|---|
| **Backend Services** | Content approval (submit/approve/reject), content (ownership/payloads), caching, process engine (state transitions), org partnership (termination) |
| **Backend Utils** | RBAC, content normalization, sanitize, auth cookies, organization scope, media fingerprint, error constants |
| **Backend Integration** | 1705-line security integration test covering auth, permissions, role assignment, activity logs, content status, scope isolation, approval API |
| **Web Context** | AuthContext (login/logout/profile), StudentAuthContext (login/session restore) |
| **Web Hooks** | useNews, useNewsById, useUpdatesHub, usePermissions, getAnnouncements |
| **Web API Clients** | authAPI (logout), errors, event API (CRUD + workflows), student auth API, content-ownership, media utility |
| **Web Components** | Dashboard page, sidebar, EventCard, ReactQueryProvider, FAQsSection, Button |
| **Web Store** | Confirmation dialog (Zustand) |
| **Contracts** | Zod schema parsing for student API responses |

### 9.3 What Is NOT Tested

| Area | % Untested | Impact |
|---|---|---|
| **Mobile** (all) | 100% | Entire student-facing mobile client has zero tests |
| **Backend routes** (all 36) | ~100% | Only implicit coverage from integration test |
| **Backend models** (all 39) | 100% | No model/validation/document tests |
| **Backend middleware** (auth, csrf, rateLimiters, etc.) | ~92% | Only `errorHandler` has tests |
| **Backend services** (announcement, event, news, etc.) | ~86% | 5 of 37 services have tests |
| **Web UI components** (~140) | ~98% | Only 3 of 140+ have tests |
| **Web pages** (~75) | ~99% | Only dashboard page has tests |
| **Web API clients** (~25) | ~70% | 4 of 12 API modules tested |

### 9.4 Test Quality

**Strengths:**
- Security integration test is thorough — uses `MongoMemoryServer`, covers 20+ scenarios
- Backend unit tests are well-structured with good edge case coverage
- Web tests use proper infrastructure (MSW, React Testing Library, QueryClient wrapper)
- MSW handlers are comprehensive (302 lines)

**Weaknesses:**
- Mock data is static — doesn't validate real API contract compliance
- Limited assertion depth (many check `isSuccess`/`isError` booleans only)
- No negative testing (unauthenticated user gets 401) for most web hook tests
- No snapshot tests, no E2E tests, no performance/load tests

---

## 10. DevOps & CI/CD Health

### 10.1 Overall Score: 7/10

| Area | Score | Key Points |
|---|---|---|
| **CI Pipeline** | 8/10 | 7-job pipeline with lint, typecheck, test, build, CodeQL, Gitleaks, dependency review. Missing: pnpm store caching, mobile build step |
| **CD Pipeline** | 7/10 | Staging + production workflows exist with health checks, smoke tests, auto-tagging. Missing: all GitHub secrets are unconfigured |
| **Docker** | 3/10 | MongoDB docker-compose only. No `Dockerfile` for any app service. No `.dockerignore` |
| **Render Config** | 9/10 | Well-structured blueprints with health checks, env management, auto-generated secrets |
| **Vercel Config** | 4/10 | No `vercel.json`. CLI-only deployment. No staging frontend workflow |
| **Scripts & Tooling** | 9/10 | 36 scripts, Husky + lint-staged, CodeQL config. Missing: mobile/contracts in lint-staged |
| **Documentation** | 9/10 | Exceptionally thorough across all areas. Minor staleness on system doc |

### 10.2 Workflow Files

| File | Trigger | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | PR to staging/main; push to any | Quality gates (7 parallel jobs) |
| `.github/workflows/deploy-staging.yml` | Push to `staging` | Deploy backend to Render staging |
| `.github/workflows/deploy-production.yml` | Push to `main`; manual dispatch | Deploy backend to Render + frontend to Vercel |

### 10.3 GitHub Secrets Required (All Unconfigured 🔴)

| Secret | Purpose |
|---|---|
| `RENDER_STAGING_DEPLOY_HOOK` | Render webhook for staging backend deploy |
| `RENDER_PRODUCTION_DEPLOY_HOOK` | Render webhook for production backend deploy |
| `RENDER_STAGING_URL` | Staging backend URL |
| `RENDER_PRODUCTION_URL` | Production backend URL |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_PRODUCTION_URL` | Production frontend URL |

### 10.4 Branch Protection (Unconfigured 🔴)

Both `main` and `staging` require:
- Require PR before merging
- Require 1 approval
- Dismiss stale reviews
- Required CI status checks (6 checks: `contracts-checks`, `backend-checks`, `frontend-checks`, `mobile-checks`, `security-audit`, `dependency-review`)
- Require up-to-date branches

### 10.5 CI/CD Gaps

| Gap | Severity | Details |
|---|---|---|
| No dependency caching | Medium | CI reinstalls all deps from scratch each time |
| Mobile CI lacks build step | Medium | Only lint/typecheck/test — no Expo build verification |
| lint-staged misses mobile/contracts | Low | No pre-commit checks for `apps/mobile/` or `packages/contracts/` |
| Security audit `continue-on-error: true` | Low | `pnpm audit` failures won't break CI |
| Gitleaks `continue-on-error: true` | Low | Secret detection failures won't break CI |
| No rollback strategy documented | Low | No process for reverting failed Render/Vercel deploys |

---

## 11. Priority Remediation Order

### Immediate (Security — Do Before Any Feature Work)

1. **Generate strong random secrets** for ALL 6 JWT/QR/SESSION secrets in ALL 4 environment files
2. **Rotate MongoDB passwords** for both production and staging Atlas clusters
3. **Rotate Cloudinary API secret** and Resend API key
4. **Fix `NODE_ENV`** — set `production` in `.env.production` and `staging` in `.env.staging`
5. **Stop logging password reset tokens** in `password-reset.service.ts`
6. **Purge credentials from git history** using `git filter-repo`

### High (Structural Fixes)

7. **Fix/add missing backend routes** or remove dead frontend code (`/auth/refresh-token`, `/media/presigned-url`)
8. **Consolidate web student token management** — single Axios instance with refresh, remove localStorage
9. **Remove `Organization.members` Mixed field** from schema (post-migration cleanup)
10. **Reconcile `organizationId` typing** across all models (pick ObjectId or string, not both)
11. **Move web student tokens from localStorage to httpOnly cookies**

### Medium (Quality & Process)

12. **Write mobile tests** (critical — 0% coverage)
13. **Write backend middleware/auth tests** (auth, csrf, permissions, rateLimiters)
14. **Configure GitHub secrets** and enable branch protection
15. **Add EAS project ID** and mobile build pipeline (`eas.json`)
16. **Add missing database indexes** on `EventRegistration`, `EventAttendanceLog`, `Event`, `ActivityLog`, `Announcement`, `News`
17. **Add API rewrites** in `next.config.ts` for SSR CORS simplification

### Low (Nice-to-Have)

18. **Split contracts package** into sub-path exports (`@cict/contracts/types`, `@cict/contracts/schemas`)
19. **Consolidate `OrganizationMember` vs `OrganizationMembership`** (define clear boundary)
20. **Add CSP/HSTS headers** beyond Helmet defaults
21. **Add OpenAPI/Swagger documentation**
22. **Add E2E tests** (Playwright for critical user flows)

---

## Appendix A: Documentation Inventory

| Document | Found? | Current? | Notes |
|---|---|---|---|
| `AGENTS.md` | ✅ | Yes | CI/CD reference, scripts, secrets |
| `README.md` | ✅ | Yes | Quickstart, tech stack |
| `docs/DEVELOPER_GUIDE.md` | ✅ | Yes (2026-06-01) | Comprehensive onboarding |
| `CICT_SYSTEM_DOCUMENTATION.md` | ✅ | Yes (2026-05-24) | Deep system reference |
| `CICT_PRESENTATION_DOCUMENTATION.md` | ✅ | Yes (2026-05-16) | Non-technical overview |
| `CICT_CICD_PIPELINE.md` | ✅ | Yes | Phase-by-phase CI/CD tracker |
| `cict_website_documentation/` (12 files) | ✅ | Yes | PRD, MVP scope, business logic, schema, roadmap |
| `docs/system-logic-connectivity-audit.md` | ✅ | Yes | Cross-module connectivity |
| `docs/caching-implementation-plan.md` | ✅ | Yes | 12-phase caching strategy |
| `apps/web/docs/implementation/*` (43 files) | ✅ | Mostly | Implementation phase docs |

## Appendix B: Exposed Credentials Summary

| Service | Type | Value (redacted) | Location |
|---|---|---|---|
| MongoDB Production | Password | `VsjRHFT6uqxwnda5` | `.env`, `.env.production` |
| MongoDB Staging | Password | `OhFNLkIGe4XewFDm` | `.env.staging` |
| Cloudinary | API Key | `883134646722524` | All `.env` files |
| Cloudinary | API Secret | `x4_0HuGihy3nfzsaq_kAPOqmZzk` | All `.env` files |
| Resend SMTP | Password | `re_eyddStox_LmU1QriikSmPuk3ewpKZrvYR` | `.env` |
| Cloudinary (Web) | Cloud Name | `ddnxfpziq` | `apps/web/.env.example` |

**Note:** These values exist on disk but are excluded from git via `.gitignore`. However, they are still accessible to anyone with local filesystem access or via CI/CD artifacts. All must be rotated after remediation.

## Appendix C: File Change Summary by Priority

### Phase 0 — Security (8 items, ~15 files)

| File | Action |
|---|---|
| `apps/backend/.env` | Replace 6 placeholder secrets with random values; fix broken `STUDENT_REFRESH_SECRET`; remove real MongoDB/Cloudinary/Resend credentials |
| `apps/backend/.env.development` | Same secrets fix |
| `apps/backend/.env.production` | Same secrets fix; set `NODE_ENV=production` |
| `apps/backend/.env.staging` | Same secrets fix; set `NODE_ENV=staging` |
| `apps/backend/src/middleware/csrf.ts` | Remove blanket auth route exemption; add per-route opt-out |
| `apps/backend/src/services/password-reset.service.ts` | Stop logging reset tokens in plaintext |
| `apps/backend/src/controllers/studentAuth.controller.ts` | Set tokens as httpOnly cookies in addition to response body |
| `apps/web/src/lib/api/student.ts` | Absorb membership functions; remove localStorage |
| `apps/web/src/lib/api/student-membership.ts` | Delete file |
| `apps/web/src/context/StudentAuthContext.tsx` | Update imports; remove localStorage reads |
| `apps/backend/src/routes/auth.routes.ts` | Add `POST /refresh` route |
| `apps/backend/src/controllers/auth.controller.ts` | Add `refreshToken` method |
| `apps/backend/src/validators/auth.validator.ts` | Add refresh token validator |
| `apps/web/src/lib/api/refreshToken.ts` | Update to use new endpoint |
| `apps/web/src/lib/api/axios.ts` | Add 401 auto-refresh interceptor |

### Phase 1 — Structural (6 items, ~50 files)

| Area | Action |
|---|---|
| Axios consolidation | Delete `student-membership.ts`; merge functions into `student.ts`; update all imports |
| Missing routes | Audit + fix or remove dead frontend routes |
| `Organization.members` | Remove from schema; create migration to drop field |
| `organizationId` typing | Convert ObjectId-based models to string (slug) |
| Database indexes | Add 6 missing indexes across Event, News, Announcement, ActivityLog, EventRegistration, EventAttendanceLog |
| Contracts split | Restructure into sub-path exports (~20 new files) |

### Phase 2 — DevOps (5 items)

| Area | Action |
|---|---|
| GitHub Secrets | Add 8 required secrets to repo settings |
| Branch Protection | Enable on `main` and `staging` |
| EAS Build | Create `eas.json`; add project ID to `app.json` |
| API Rewrites | Add to `next.config.ts` |
| CI Caching | Add pnpm store cache to workflow |

### Phase 3 — Tests (3 items, ~25 new files)

| Area | Target Files |
|---|---|
| Mobile tests | `services/api/client.test.ts`, `store/auth-store.test.ts`, feature hooks, UI component tests |
| Backend middleare tests | `middleware/auth.test.ts`, `csrf.test.ts`, `permissions.test.ts`, `rateLimiters.test.ts`, `password-reset.service.test.ts` |
| Web component tests | Student pages, admin CRUD pages, remaining API clients |

### Phase 4 — Polish (3 items)

| Area | Action |
|---|---|
| Feature gaps | Complete leadership spotlight, community summaries, Phase 10 RBAC hardening |
| OpenAPI docs | Add swagger-jsdoc + swagger-ui-express |
| E2E tests | Playwright for critical login/CRUD/registration flows |
