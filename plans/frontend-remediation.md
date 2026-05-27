# Frontend Remediation Plan — CICT Web

> **Target:** `/home/ronmarche14/projects/CICT/apps/web/`
> **Estimated effort:** ~17.5 hours across 6 phases
> **Current codebase:** 184/184 backend tests passing, frontend largely untouched during previous phases

---

## Table of Contents

1. [Phase F1 — Security Hotfixes](#phase-f1--security-hotfixes-day-1)
2. [Phase F2 — SEO & Metadata](#phase-f2--seo--metadata-day-2)
3. [Phase F3 — State Management & Pagination](#phase-f3--state-management--pagination-days-2-3)
4. [Phase F4 — Component Extraction](#phase-f4--component-extraction-day-3-4)
5. [Phase F5 — Code Quality](#phase-f5--code-quality-day-4-5)
6. [Phase F6 — Polish](#phase-f6--polish-day-5)
7. [Implementation Order](#implementation-order)
8. [Verification Gates](#verification-gates)

---

## Audit Summary

### Critical (Security)

| # | Issue | File | Severity |
|---|---|---|---|
| 1 | Student JWT stored in localStorage (XSS-vulnerable) | `context/StudentAuthContext.tsx:35,43,51`, `lib/api/student.ts:20-55` | CRITICAL |
| 2 | `dangerouslySetInnerHTML` with no sanitization | `components/StructuredContent.tsx:22,40` | CRITICAL |

### High (Functionality/Correctness)

| # | Issue | File | Severity |
|---|---|---|---|
| 3 | SEOHead manipulates DOM directly (hydration mismatch) | `components/SEOHead.tsx:13-64` | HIGH |
| 4 | Admin news/announcements use `useState`+`useEffect` | `admin/news/page.tsx`, `admin/announcements/page.tsx` | HIGH |
| 5 | Client-side filtering with server pagination (wrong results) | `admin/news/page.tsx:141-146`, `admin/announcements/page.tsx:81-89` | HIGH |
| 6 | Events admin hardcoded `limit: 100` — no pagination | `admin/events/page.tsx:72` | HIGH |
| 7 | Massive page files (1,353 / 681 / 657 lines) | `admin/events/[id]`, `admin/faq`, `admin/students` | HIGH |

### Medium (Code Quality)

| # | Issue | File | Severity |
|---|---|---|---|
| 8 | `staleTime: 0` on all public hooks (unnecessary refetches) | `use-news.ts`, `use-updates-hub.ts` | MEDIUM |
| 9 | `getProgramLabel`/`getYearLevelLabel`/`getSectionLabel` duplicated | `admin/students/page.tsx`, `admin/students/[id]/page.tsx` | MEDIUM |
| 10 | `StudentStatus` enum duplicated locally | `types/index.ts:299-304` | MEDIUM |
| 11 | `m: any` cast in student profile | `student/profile/page.tsx:108` | MEDIUM |
| 12 | `queryKeys` object underused (only 2/20 files) | `lib/query-keys.ts` | MEDIUM |
| 13 | Settings form loses type safety (`Record<string, unknown>`) | `admin/settings/page.tsx:37` | MEDIUM |
| 14 | Logs table `<tr onClick>` not keyboard-accessible | `admin/logs/page.tsx:198-201` | MEDIUM |

### Low (Polish)

| # | Issue | File | Severity |
|---|---|---|---|
| 15 | Contact page is empty shell | `contact/page.tsx:8-12` | LOW |
| 16 | `loginUser` dead code in authAPI | `lib/api/authAPI.ts:6-14` | LOW |

---

## Phase F1 — Security Hotfixes (Day 1)

### F1.1 — Student Auth: localStorage → httpOnly Cookies

**Files:** `context/StudentAuthContext.tsx`, `lib/api/student.ts`, `app/student/layout.tsx`

**Problem:** The student auth flow stores `accessToken` and `refreshToken` in `localStorage`:
```ts
const token = localStorage.getItem('student_access_token');
localStorage.setItem('student_access_token', data.accessToken);
localStorage.setItem('student_refresh_token', data.refreshToken);
```

This makes tokens accessible to any JavaScript executed in the same origin. The admin auth flow correctly uses `withCredentials: true` (httpOnly cookies set by the backend).

**Implementation:**

1. **Remove all `localStorage` calls** from `StudentAuthContext.tsx`:
   - Remove `localStorage.getItem('student_access_token')` (line 35)
   - Remove `localStorage.setItem('student_access_token', ...)` (line 43)
   - Remove `localStorage.setItem('student_refresh_token', ...)` (line 44)
   - Remove all `localStorage.removeItem` calls

2. **Update `lib/api/student.ts`** axios instance:
   ```ts
   const client = axios.create({
     baseURL: `${NEXT_PUBLIC_API_URL}/student`,
     withCredentials: true,  // ← Change from manual Bearer token
     timeout: 15000,
     headers: { 'Content-Type': 'application/json' },
   });
   ```
   - Remove request interceptor that injects `Authorization: Bearer` header
   - Remove response interceptor that handles 401 by reading/writing localStorage
   - The 401 handling should redirect to `/student/login` (similar to admin's `axios.ts`)

3. **Verify backend cookie support** — The admin auth sets httpOnly cookies via `authCookies.ts`. The student auth backend must also set cookies on login. Check `apps/backend/src/controllers/studentAuth.controller.ts`'s `loginStudent` function — it returns tokens in the response body. Need to also set httpOnly cookies similar to admin login.

**Estimate:** 2–3 hours

---

### F1.2 — Add DOMPurify to `StructuredContent`

**File:** `components/StructuredContent.tsx`

**Problem:** `bodyHtml` is rendered via `dangerouslySetInnerHTML` without sanitization:
```tsx
<div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
```

**Implementation:**

```tsx
import DOMPurify from 'dompurify';

// In the component:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyHtml) }} />
```

Also apply to the section content at line 40:
```tsx
{bodyHtml && (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyHtml) }} />
)}
```

**Note:** `dompurify` needs to be added to `apps/web/package.json` if not already present. For server-side rendering, use `isomorphic-dompurify`.

**Estimate:** 15 minutes

---

## Phase F2 — SEO & Metadata (Day 2)

### F2.1 — Replace SEOHead with Next.js Metadata API

**File:** `components/SEOHead.tsx` + all pages using it

**Problem:** `SEOHead.tsx` directly manipulates DOM:
```tsx
useEffect(() => {
  document.title = title || defaultTitle;
  const metaTags = [];
  // ... creates/destroys <meta> elements via DOM APIs
  return () => { metaTags.forEach(tag => tag.remove()); };
}, [title, description, ogImage, ogType]);
```

This causes:
- Hydration mismatches
- Meta tags flashing as they're removed/re-added on every prop change
- Confusion for crawlers and social media scrapers

**Implementation:**

1. **Create proper metadata exports** in each page using Next.js's `generateMetadata`:
   ```tsx
   import type { Metadata } from 'next';
   
   export const metadata: Metadata = {
     title: '...',
     description: '...',
     openGraph: { ... },
   };
   ```

2. **For dynamic pages** (e.g., `/events/[id]`), use `generateMetadata`:
   ```tsx
   export async function generateMetadata({ params }: Props): Promise<Metadata> {
     const event = await getEvent(params.id);
     return { title: event.title, description: event.excerpt };
   }
   ```

3. **Delete** `components/SEOHead.tsx` after migration

4. **Files to update:** All pages currently importing `SEOHead`

**Estimate:** 1–2 hours

---

## Phase F3 — State Management & Pagination (Days 2–3)

### F3.1 — Migrate Admin News/Announcements to React Query

**Files:** `admin/news/page.tsx`, `admin/announcements/page.tsx`

**Current pattern:**
```tsx
const [news, setNews] = useState([]);
const [loading, setLoading] = useState(true);

const fetchNews = useCallback(async () => {
  setLoading(true);
  const res = await api.get('/news', { params: { page, limit } });
  setNews(res.data.data.news);
  setLoading(false);
}, [page, limit]);

useEffect(() => { fetchNews(); }, [fetchNews]);
```

**Target pattern:**
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['admin', 'news', page, filters],
  queryFn: () => api.get('/news', { params: { page, limit, ...filters } }),
  keepPreviousData: true,
});
```

This eliminates manual loading/error state, adds caching, and enables background refetching.

**Estimate:** 1–2 hours per file

---

### F3.2 — Fix Client-side vs Server-side Filtering

**Files:** `admin/news/page.tsx:141-146`, `admin/announcements/page.tsx:81-89`

**Problem:** Both pages apply filters client-side after fetching server-paginated data:
```tsx
// News page — only filters the CURRENT page, not all results
const filteredNews = useMemo(() => {
  return news.filter(item => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (featuredFilter && item.featured !== featuredFilter) return false;
    return true;
  });
}, [news, categoryFilter, featuredFilter]);
```

**Fix:** Send filter parameters to the API call instead:
```tsx
// Before
api.get('/news', { params: { page, limit } })

// After
api.get('/news', { params: { page, limit, category: categoryFilter, featured: featuredFilter } })
```

Remove the client-side `filteredNews`/`filteredAnnouncements` computed values.

**Estimate:** 1 hour

---

### F3.3 — Add Pagination to Admin Events

**File:** `admin/events/page.tsx`

**Current:** Hardcoded `limit: 100` with no `page` parameter and no pagination controls.

**Implementation:**
- Add `page` state variable (default 1)
- Add `page` to the query params: `limit: 20, page`
- Add pagination UI (Previous/Next buttons or shadcn `Pagination` component)
- Apply `keepPreviousData: true` for smooth transitions

**Estimate:** 1 hour

---

### F3.4 — Increase `staleTime` on Public Hooks

**Files:** `use-news.ts`, `use-updates-hub.ts`

**Current:** All queries use `staleTime: 0`, causing refetch on every mount/route change.

**Fix:**
```tsx
// use-news.ts:53
useQuery({
  queryKey: ['news', page],
  queryFn: () => newsAPI.getAll({ page, limit: 10 }),
  staleTime: 30_000, // 30 seconds
});

// use-updates-hub.ts — apply to all 6 queries
staleTime: 30_000, // 30 seconds
```

**Estimate:** 30 minutes

---

## Phase F4 — Component Extraction (Day 3–4)

### F4.1 — Split `admin/events/[id]/page.tsx` (1,353 lines)

**Current state:** One monolithic file handling:
- Event detail view
- Registrations table with bulk actions
- Attendance stats with hourly buckets
- QR/check-in section
- Approval workflow
- CSV export
- Speaker rendering

**Extract into:**

| Component | Lines ~ | Responsibility |
|---|---|---|
| `EventDetailHeader` | 100 | Title, status badge, dates, metadata |
| `EventRegistrationsTable` | 300 | Registrations list with search, filter, bulk cancel |
| `EventAttendanceStats` | 200 | Aggregated stats, charts, hourly breakdown |
| `EventApprovalPanel` | 100 | submit/approve/reject/publish workflow |

**Estimate:** 2–3 hours

---

### F4.2 — Split `admin/students/page.tsx` (657 lines)

**Extract into:**

| Component | Lines ~ | Responsibility |
|---|---|---|
| `StudentFilters` | 50 | Program, year level, section, status filter bar |
| `StudentForm` | 150 | Create/edit student form with 20+ fields |

**Estimate:** 1–2 hours

---

### F4.3 — Split `admin/faq/page.tsx` (681 lines)

**Extract into:**

| Component | Lines ~ | Responsibility |
|---|---|---|
| `TopicEditor` | 150 | Add/edit/delete/reorder FAQ topics |
| `QuestionList` | 150 | Question CRUD within a topic |
| `FAQPreview` | 100 | Live preview of rendered FAQ |

**Estimate:** 1–2 hours

---

## Phase F5 — Code Quality (Day 4–5)

### F5.1 — Extract Shared Student Helpers

**Files:** `admin/students/page.tsx:71-78`, `admin/students/[id]/page.tsx:14-20`

**Current:** Both files define the same 3 helper functions:
```tsx
const getProgramLabel = (id: string) => { ... };
const getYearLevelLabel = (id: string) => { ... };
const getSectionLabel = (id: string) => { ... };
```

**Fix:**

Create `apps/web/src/utils/student-helpers.ts`:
```tsx
export const getProgramLabel = (
  program: string | { _id: string; code: string; name: string }
): string => {
  if (typeof program === 'object' && program) return program.name;
  return program || 'Unknown';
};

export const getYearLevelLabel = (
  yearLevel: string | { _id: string; code: string; label: string }
): string => {
  if (typeof yearLevel === 'object' && yearLevel) return yearLevel.label;
  return yearLevel || 'Unknown';
};

export const getSectionLabel = (
  section: string | { _id: string; name: string }
): string => {
  if (typeof section === 'object' && section) return section.name;
  return section || 'Unknown';
};
```

Import in both files, remove local definitions.

**Estimate:** 30 minutes

---

### F5.2 — Fix `StudentStatus` Duplication

**File:** `types/index.ts:299-304`

**Current:** Local enum:
```tsx
export enum StudentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

**Fix:** Remove local definition, import from contracts:
```tsx
import { StudentStatus } from '@cict/contracts';
```

The contracts package already defines `StudentStatus` as a const object. The values are identical.

**Estimate:** 15 minutes

---

### F5.3 — Fix `m: any` Cast

**File:** `student/profile/page.tsx:108`

**Current:**
```tsx
{memberships.map((m: any) => (
```

**Fix:** Type with the proper membership type:
```tsx
import type { OrganizationMembership } from '@cict/contracts';
// ...
{memberships.map((m: OrganizationMembership) => (
```

**Estimate:** 5 minutes

---

### F5.4 — Fix Logs Table Keyboard Accessibility

**File:** `admin/logs/page.tsx:198-201`

**Current:**
```tsx
<tr
  className="cursor-pointer hover:bg-muted/50 group border-b"
  onClick={onToggle}
>
```

**Fix:**
```tsx
<tr
  className="cursor-pointer hover:bg-muted/50 group border-b"
  onClick={onToggle}
  tabIndex={0}
  role="button"
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
>
```

**Estimate:** 15 minutes

---

### F5.5 — Remove Dead `loginUser` Export

**File:** `lib/api/authAPI.ts:6-14`

**Current:** `loginUser` function is defined and exported but never imported anywhere (only `logoutUser` is used).

**Fix:** Remove the `loginUser` function and its export. Keep `logoutUser`.

**Estimate:** 5 minutes

---

## Phase F6 — Polish (Day 5)

### F6.1 — Fix Contact Page

**File:** `contact/page.tsx`

**Current:** Returns only `<div className="pt-20"></div>` — an empty shell.

**Fix:** Either implement a contact form with `react-hook-form` + validation, or render:
```tsx
<ComingSoon pageName="Contact" />
```

**Estimate:** 30 minutes

---

### F6.2 — Centralize Query Keys

**File:** `lib/query-keys.ts` (already exists, underused)

**Current:** Only 2 files use the `queryKeys` object. ~20 other hooks/pages use inline string arrays.

**Action:** Migrate all inline query keys across the app to use `queryKeys`:
- `use-news.ts`: `queryKeys.news.list(page)` instead of `['news', page]`
- `admin/news/page.tsx`: `queryKeys.admin.news.list(page)` instead of `['admin', 'news', page]`
- `use-updates-hub.ts`: `queryKeys.updatesHub.feed(sources)` instead of inline arrays
- etc.

**Estimate:** 1 hour

---

### F6.3 — Type Settings Form Properly

**File:** `admin/settings/page.tsx:37`

**Current:** Loses type safety:
```tsx
const [forms, setForms] = useState<Record<string, Record<string, unknown>>>({});
```

**Fix:** Define a proper interface for each settings group:
```tsx
type SettingsGroup = Record<string, string | number | boolean>;
type SettingsFormState = Record<string, SettingsGroup>;
```

Or derive types from the API response shape.

**Estimate:** 30 minutes

---

### F6.4 — Fix Admin Layout Redirect Race Condition

**File:** `admin/layout.tsx:32-35`

**Current:** The `prevAuthenticated` ref pattern is confusing and may cause brief flash of unauthorized content:
```tsx
const prevAuthenticated = useRef(isAuthenticated);
useEffect(() => {
  if (loading) return;
  if (isLoginPage) return;
  if (!isAuthenticated && prevAuthenticated.current) {
    router.push('/admin/login');
  }
  prevAuthenticated.current = isAuthenticated;
}, [isAuthenticated, loading, isLoginPage, router]);
```

**Fix:** Simplify:
```tsx
useEffect(() => {
  if (loading) return;
  if (isLoginPage) return;
  if (!isAuthenticated) {
    router.push('/admin/login');
  }
}, [isAuthenticated, loading, isLoginPage, router]);
```

**Estimate:** 15 minutes

---

## Implementation Order

| Step | Phase | Item | Dependencies |
|---|---|---|---|
| 1 | F1 | F1.2 DOMPurify | None |
| 2 | F1 | F1.1 Student auth cookies | Backend student cookie support |
| 3 | F2 | F2.1 SEOHead rewrite | None |
| 4 | F5 | F5.1 Student helpers | None |
| 5 | F5 | F5.2 StudentStatus fix | None |
| 6 | F5 | F5.3 `m: any` fix | F5.1 (student types) |
| 7 | F5 | F5.5 Remove dead code | None |
| 8 | F3 | F3.4 staleTime fix | None |
| 9 | F3 | F3.2 Fix client-side filtering | None |
| 10 | F3 | F3.1 Migrate to React Query | F3.2 |
| 11 | F3 | F3.3 Events pagination | None |
| 12 | F4 | F4.1 Split events/[id] | None |
| 13 | F4 | F4.2 Split students | None |
| 14 | F4 | F4.3 Split FAQ | None |
| 15 | F5 | F5.4 Keyboard accessibility | None |
| 16 | F6 | F6.1 Contact page | None |
| 17 | F6 | F6.2 Centralize queryKeys | F3.1 (React Query migration) |
| 18 | F6 | F6.3 Type settings | None |
| 19 | F6 | F6.4 Layout redirect | None |

**Parallel tracks:**
- F1, F2, F5.1-5.5 can run independently
- F3 must be sequential: F3.4 → F3.2 → F3.1 → F3.3
- F4, F5, F6 can be parallelized with F3

---

## Verification Gates

### After Phase F1
```bash
# Student auth: verify no localStorage usage for tokens
grep -r "localStorage" apps/web/src/context/ apps/web/src/lib/api/student.ts

# Verify DOMPurify applied
grep -r "DOMPurify" apps/web/src/components/StructuredContent.tsx
```

### After Phase F2
```bash
# Verify SEOHead no longer imported
grep -r "SEOHead" apps/web/src/

# Run lint and typecheck
pnpm run web:lint
pnpm run web:typecheck
```

### After Phase F3
```bash
# Verify no staleTime: 0 remains
grep -r "staleTime: 0" apps/web/src/hooks/

# Verify no client-side filtering on admin pages
grep -r "filteredNews\|filteredAnnouncements" apps/web/src/app/admin/

# Run tests
pnpm run web:test
```

### Final Gate
```bash
# Full verification
pnpm run web:lint
pnpm run web:typecheck
pnpm run web:test
pnpm run web:build

# Verify no dead code
# Verify no `as any` casts in student pages
# Verify no `Record<string, unknown>` form types
```
