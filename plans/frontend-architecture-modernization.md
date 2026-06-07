# Frontend Architecture Modernization

**Goal:** Transform the frontend into a scalable, testable, performant application with clear architectural boundaries, robust test coverage, and optimized delivery.

**Target:** `apps/web/`

---

## Current State

| Metric | Value | Target |
|---|---|---|
| Test files | 7 (for ~90 source files) | 30+ |
| Test coverage | ~5% estimated | 70%+ (unit), 50%+ (integration) |
| Client components | 95%+ of pages | 50% (convert public routes to RSC) |
| `staleTime: 0` queries | ~60% of all queries | <20% (cache appropriately) |
| Dynamic imports | 0 | 3+ (heavy libs) |
| `<img>` tags | ~15 occurrences | 0 (migrate to `<Image>`) |
| Duplicate components | 2 pairs confirmed | 0 |
| Student auth | localStorage tokens | httpOnly cookies |
| Largest page | 1158 lines (`admin/events/[id]`) | <400 lines after splitting |

---

## Phase 1: Test Infrastructure & Coverage

### Goal

Establish a robust testing foundation and bring critical paths to 70%+ coverage.

### 1.1 Upgrade Vitest Configuration

**File:** `vitest.config.ts`

Add coverage reporter (`@vitest/coverage-v8`), MSW integration, and component testing setup:

```typescript
// vitest.config.ts
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/hooks/**/*.ts',
        'src/context/**/*.tsx',
        'src/lib/api/**/*.ts',
        'src/lib/store/**/*.ts',
        'src/components/**/*.tsx',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**New file:** `src/test/setup.ts` — MSW server, `@testing-library/jest-dom` matchers, `next/navigation` mock, `next/image` mock.

### 1.2 Create Test Utilities

**New files:**
- `src/test/mocks/handlers.ts` — MSW request handlers for all API endpoints
- `src/test/mocks/server.ts` — MSW server instance
- `src/test/utils.tsx` — Custom render with providers (React Query, Auth, StudentAuth, Theme)
- `src/test/mocks/next.ts` — Mocked `useRouter`, `usePathname`, `useSearchParams`, `useParams`

Example `src/test/utils.tsx`:

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { screen, waitFor, fireEvent, act } from '@testing-library/react';
```

### 1.3 Test Matrix — Priority Order

#### Batch A — Data Layer (6 files, foundation)

| File | Tests to Write | Priority |
|---|---|---|
| `src/lib/api/errors.ts` | `getApiErrorMessage` with various error shapes | P0 |
| `src/lib/api/event.ts` | All CRUD + workflow actions return correct data | P0 |
| `src/lib/api/authAPI.ts` | Login/logout success & failure | P0 |
| `src/lib/api/student.ts` | Token injection, refresh flow, 401 handling | P0 |
| `src/lib/store/confirmationDialogStore.ts` | `show`, `reset`, `setOpen` state transitions | P0 |
| `src/lib/content-ownership.ts` | Permission + ownerType logic | P0 |

#### Batch B — Critical Hooks (5 files, foundation)

| File | Tests to Write | Priority |
|---|---|---|
| `src/hooks/use-news.ts` | Query key stability, data fetching, error state | P0 |
| `src/hooks/use-news-by-id.ts` | Loading/error/success states | P0 |
| `src/hooks/ui/announcement/get-announcements.hook.ts` | Pagination, filtering | P0 |
| `src/hooks/use-updates-hub.ts` | `useInfiniteQuery` pagination, category filtering | P0 |
| `src/hooks/permissions/use-permissions.ts` | All 35+ permission methods, organization scoping | P0 |

#### Batch C — Auth Contexts (2 files)

| File | Tests to Write | Priority |
|---|---|---|
| `src/context/AuthContext.tsx` | `login`, `logout`, `refreshProfile`, initial loading state, redirect behavior | P1 |
| `src/context/StudentAuthContext.tsx` | Token-based auth flow, `login`, `logout`, profile refresh | P1 |

#### Batch D — Critical Components (6 files)

| File | Tests to Write | Priority |
|---|---|---|
| `src/components/admin/Sidebar.tsx` | Route rendering with permissions, mobile toggle | P1 |
| `src/components/events/EventCard.tsx` | Registration states, click navigation, image fallback | P1 |
| `src/components/layout/navbar.tsx` | Responsive rendering, mobile menu, active route | P1 |
| `src/components/providers/ReactQueryProvider.tsx` | Client creation, default options | P1 |
| `src/components/confirmation-dialog.tsx` | Open/close, confirm/cancel actions | P1 |
| `src/components/datatable.tsx` | Sort, paginate, search, empty state | P1 |

#### Batch E — Page-Level Integration Tests (4 files)

| File | Tests to Write | Priority |
|---|---|---|
| `src/app/admin/dashboard/page.tsx` | Dashboard data rendering, loading, error | P2 |
| `src/app/events/page.tsx` | Event listing, filter interactions | P2 |
| `src/app/admin/events/page.tsx` | Admin event CRUD flow | P2 |
| `src/app/updates/page.tsx` | Feed rendering, category switching, infinite scroll | P2 |

### 1.4 Install Dependencies

```
pnpm --filter @cict/web add -D @vitest/coverage-v8 msw @testing-library/jest-dom
```

---

## Phase 2: Data Fetching Consolidation

### Goal

Eliminate legacy `useState`/`useEffect` patterns, standardize on React Query, set intelligent cache policies.

### 2.1 Migrate `useOrganizations` → React Query

**File:** `src/hooks/useOrganizations.ts`

Replace the `useState`/`useEffect` pattern:

**Before:**
```typescript
export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    organizationService.getAll()
      .then(setOrganizations)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { organizations, loading, error };
}
```

**After:**
```typescript
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 min — org list rarely changes
  });
}
```

### 2.2 Migrate `AdminDashboard` → React Query

**File:** `src/app/admin/dashboard/page.tsx`

Replace `useState` + `useEffect` + `AbortController` with `useQuery`:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['admin', 'dashboard-summary'],
  queryFn: () => adminAPI.getDashboardSummary(),
});
```

### 2.3 Migrate `usePermissionMetadata` → React Query

**File:** `src/hooks/use-permission-metadata.ts`

Same pattern — `useEffect` → `useQuery` with `staleTime: Infinity` (permissions metadata is static).

### 2.4 Set Intelligent `staleTime` Values

Create a `src/lib/query-keys.ts` factory to centralize query key definitions and cache policies:

```typescript
export const queryKeys = {
  news: {
    all: ['news'] as const,
    list: (page: number, filters?: Record<string, unknown>) =>
      ['news', 'list', page, filters] as const,
    detail: (id: string) => ['news', 'detail', id] as const,
  },
  events: {
    all: ['events'] as const,
    list: (page: number, filters?: Record<string, unknown>) =>
      ['events', 'list', page, filters] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
  },
  announcements: {
    all: ['announcements'] as const,
    list: (page: number, filters?: Record<string, unknown>) =>
      ['announcements', 'list', page, filters] as const,
    detail: (id: string) => ['announcements', 'detail', id] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
  },
  faq: {
    all: ['faq'] as const,
  },
} as const;
```

**Recommended `staleTime` policy:**

| Data Type | `staleTime` | Rationale |
|---|---|---|
| FAQ content | `Infinity` | Static, rarely changes |
| Organizations list | `5 * 60 * 1000` | Changes infrequently |
| Permission metadata | `Infinity` | Static catalog |
| News/Events list | `30 * 1000` | Moderate freshness |
| News/Events detail | `60 * 1000` | Individual item |
| Dashboard summary | `30 * 1000` | Near-real-time |
| Student profile | `5 * 60 * 1000` | Session-level data |
| Updates hub feed | `0` (keep current) | Aggregated, needs freshness |

### 2.5 Standardize API Response Types

**File:** `src/lib/api/errors.ts` (already exists — extend)

Create a generic API response type in `src/types/api.ts`:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

Update all API service files to return typed responses instead of `any`.

---

## Phase 3: Performance Optimization

### Goal

Reduce JS bundle size, add code splitting, leverage Next.js image optimization, enable ISR for public content.

### 3.1 Dynamic Imports for Heavy Libraries

Lazy-load components that depend on heavy libraries (Tiptap, Three.js, QR scanner):

```typescript
// components/admin/DynamicRichTextEditor.tsx
import dynamic from 'next/dynamic';

export const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded" /> }
);

// components/admin/DynamicQrScanner.tsx
export const QrCameraScanner = dynamic(
  () => import('@/components/admin/QrCameraScanner'),
  { ssr: false, loading: () => <div className="h-80 animate-pulse bg-muted rounded" /> }
);
```

**Impact:** Saves ~200KB (Three.js) + ~150KB (Tiptap) + ~80KB (QR scanner) from initial bundle.

### 3.2 Migrate `<img>` → `<Image>`

Find and fix all native `<img>` tags. Full list from codebase scan:

| File | Line(s) |
|---|---|
| `src/app/news/page.tsx` | 65 |
| `src/app/announcements/page.tsx` | 64 |
| `src/app/student/events/page.tsx` | 86 |
| `src/components/ScrollingGallery.tsx` | Check |
| `src/components/sections/landingpage/heroSection.tsx` | Check |
| `src/components/organizations/OrganizationShowcase.tsx` | Check |

Replace with Next.js `<Image>`:

```typescript
import Image from 'next/image';

// Before
<img src={url} alt={alt} className="w-full h-48 object-cover" />

// After
<Image
  src={url}
  alt={alt}
  width={400}
  height={192}
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 3.3 Split Large Pages

**Primary target:** `src/app/admin/events/[id]/page.tsx` (1158 lines)

Extract into:
- `src/components/admin/EventDetail/EventOverview.tsx` — Header, badges, metadata
- `src/components/admin/EventDetail/EventRegistrationsTable.tsx` — Registration list with search/filter
- `src/components/admin/EventDetail/EventAttendanceSection.tsx` — QR scanner + attendance management
- `src/components/admin/EventDetail/EventActions.tsx` — Workflow buttons (publish, cancel, complete)
- `src/components/admin/EventDetail/index.ts` — Barrel export

**Secondary target:** `src/components/updates/UpdatesHubClient.tsx` (614 lines)

Extract into:
- `src/components/updates/UpdatesFilters.tsx` — Category, scope, search controls
- `src/components/updates/UpdatesFeed.tsx` — Feed list with infinite scroll
- `src/components/updates/UpdatesFeatured.tsx` — Featured items section

### 3.4 Add ISR for Public Content Routes

**Files to modify:**

```typescript
// src/app/news/page.tsx — Add revalidation
export const revalidate = 60; // ISR: revalidate every 60 seconds

// Or for dynamic routes with generateStaticParams:
export async function generateStaticParams() {
  const news = await fetch(`${API_URL}/news?limit=50`).then(r => r.json());
  return news.data.map((item: { _id: string }) => ({ id: item._id }));
}

// src/app/events/page.tsx
export const revalidate = 60;
```

**Files affected:**
- `src/app/news/page.tsx`
- `src/app/announcements/page.tsx`
- `src/app/events/page.tsx`
- `src/app/news/[id]/page.tsx`
- `src/app/events/[id]/page.tsx`
- `src/app/announcements/[id]/page.tsx`
- `src/app/organization/[id]/page.tsx`

### 3.5 Add `generateMetadata` for SEO

```typescript
// src/app/news/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const news = await fetch(`${API_URL}/news/${params.id}`).then(r => r.json());
  return {
    title: `${news.data.title} — CICT News`,
    description: news.data.excerpt,
    openGraph: {
      images: [{ url: news.data.thumbnail }],
    },
  };
}
```

---

## Phase 4: Component Consolidation

### Goal

Eliminate duplicate components, add barrel exports, enforce consistent patterns.

### 4.1 Merge Duplicate Data Tables

| Existing File | Problem |
|---|---|
| `src/components/datatable.tsx` | Generic TanStack table (227 lines, standalone) |
| `src/components/admin/DataTable.tsx` | Admin-specific table (227 lines, imported by admin pages) |

**Resolution:** Keep `src/components/datatable.tsx` as the single source of truth. It already uses `@tanstack/react-table` with sorting, pagination, and search. Update the 3 admin page imports to use it:

- Find: `import { DataTable } from '@/components/admin/DataTable'`
- Replace: `import { DataTable } from '@/components/datatable'`
- Delete `src/components/admin/DataTable.tsx`

### 4.2 Merge Duplicate Confirm Dialogs

| Existing File | Problem |
|---|---|
| `src/components/ui/confirm-dialog.tsx` | Props-based (open/onOpenChange) |
| `src/components/confirmation-dialog.tsx` | Zustand store-based |

**Resolution:** Delete `src/components/ui/confirm-dialog.tsx`. Keep `confirmation-dialog.tsx` (Zustand store provides more flexibility). Update any imports of `ConfirmDialog` from `ui/confirm-dialog` to use the Zustand pattern.

Check for usages of `ConfirmDialog`:

```bash
rg "ConfirmDialog" src/ --include "*.tsx"
```

### 4.3 Add Barrel Exports

**New file:** `src/components/index.ts`

```typescript
// UI primitives
export { Button } from './ui/button';
export { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export { Input } from './ui/input';
export { Badge } from './ui/badge';
// ... all 29 UI components

// Layout
export { MainLayout } from './layout/MainLayout';
export { Navbar } from './layout/navbar';
export { Footer } from './layout/footer';

// Admin
export { Sidebar } from './admin/Sidebar';
export { EventForm } from './admin/EventForm';
// ...

// Shared
export { ConfirmationDialog } from './confirmation-dialog';
export { DataTable } from './datatable';
// ...
```

**New file:** `src/hooks/index.ts`

```typescript
export { useAuth } from '@/context/AuthContext';
export { usePermissions } from './permissions/use-permissions';
export { useNews } from './use-news';
export { useNewsById } from './use-news-by-id';
// ...
```

### 4.4 Remove Dead Dependencies

The `package.json` includes several unused dependencies. Verify and remove:

| Package | Notes | Action |
|---|---|---|
| `radix-ui` | Legacy metapackage; all imports use `@radix-ui/*` | Remove |
| `tanstack` | Likely unused; individual `@tanstack/*` packages are direct deps | Verify & remove |
| `@types/js-cookie` | Likely unused; check if any `import` exists | Verify & remove |
| `postprocessing` | Three.js post-processing; check if imported | Verify & remove |

```bash
pnpm --filter @cict/web remove radix-ui
pnpm --filter @cict/web remove tanstack
pnpm --filter @cict/web remove @types/js-cookie
pnpm --filter @cict/web remove postprocessing
```

Confirm removal with:

```bash
pnpm run web:typecheck && pnpm run web:build
```

---

## Phase 5: Server Components Migration

### Goal

Convert public-facing pages from `'use client'` to React Server Components, reducing JS bundle and improving SEO.

### 5.1 Public Page Migration Plan

| Route | Current | Target | Strategy |
|---|---|---|---|
| `/` (LandingPage) | Server (no `'use client'`) | Keep as RSC | Already correct |
| `/about` | Static content | RSC | Already correct |
| `/academics` | Static content | RSC | Already correct |
| `/admissions` | Static content | RSC | Already correct |
| `/student-life` | Static content | RSC | Already correct |
| `/contact` | Static content | RSC | Already correct |
| `/news` | `'use client'` | RSC + `<Suspense>` | Fetch data in RSC, pass to client child |
| `/news/[id]` | `'use client'` | RSC + `<Suspense>` | Fetch data in RSC with `params.id` |
| `/events` | `'use client'` | RSC + `<Suspense>` | Fetch data in RSC, pass to client child |
| `/events/[id]` | `'use client'` | RSC + `<Suspense>` | Fetch data in RSC with `params.id` |
| `/announcements` | `'use client'` | RSC + `<Suspense>` | Fetch data in RSC, pass to client child |
| `/announcements/[id]` | `'use client'` | RSC + `<Suspense>` | Fetch data in RSC with `params.id` |

### 5.2 RSC + Client Component Pattern

```typescript
// src/app/news/page.tsx — Server Component (no 'use client')
import { Suspense } from 'react';
import { NewsListClient } from './NewsListClient';
import { LoadingSkeleton } from '@/components/ui/skeleton';

async function getNews(page: number = 1) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?page=${page}`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function NewsPage() {
  const initialData = await getNews();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NewsListClient initialData={initialData} />
    </Suspense>
  );
}
```

```typescript
// src/app/news/NewsListClient.tsx — Client Component
'use client';

export function NewsListClient({ initialData }: { initialData: PaginatedResponse<News> }) {
  const queryClient = useQueryClient();
  // Hydrate initial data from RSC
  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    initialData: initialData.data,
  });

  return (/* render with interactivity */);
}
```

### 5.3 Add `generateMetadata` and `generateStaticParams`

For every public dynamic route:

```typescript
// src/app/news/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await fetch(`${API_URL}/news/${params.id}`);
  const data = await res.json();
  return {
    title: `${data.data.title} — CICT News`,
    description: data.data.excerpt,
    openGraph: { images: [data.data.thumbnail].filter(Boolean) },
  };
}

export async function generateStaticParams() {
  const res = await fetch(`${API_URL}/news?limit=100&status=published`);
  const data = await res.json();
  return data.data.map((item: { _id: string }) => ({ id: item._id }));
}

export const revalidate = 3600; // ISR: revalidate every hour
```

---

## Phase 6: Security Hardening

### Goal

Eliminate XSS-vulnerable token storage, add security headers, protect against common web vulnerabilities.

### 6.1 Migrate Student Auth to httpOnly Cookies

**Resolved 2026-06-06:** The web student client no longer stores `student_access_token` or `student_refresh_token` in `localStorage`; membership calls use the cookie-based `student.ts` API client.

**Target state:** Use httpOnly cookies set by the backend on login, matching the admin auth pattern.

**Changes needed:**

**Backend** (`apps/backend/src/controllers/studentAuth.controller.ts`):
- Already sets httpOnly student cookies on login/refresh
- On logout, clears student cookies

**Frontend** (`src/context/StudentAuthContext.tsx`):
- Remove all `localStorage.getItem/setItem` calls
- Use axios with `withCredentials: true` (cookie-based, same as admin)
- Remove manual token injection from request interceptor

**Frontend** (`src/lib/api/student.ts`):
- Remove request interceptor that injects `Bearer` header
- Remove response interceptor that handles token refresh manually
- Add `withCredentials: true` to axios config
- If backend refresh endpoint exists as separate raw-fetch path, migrate to same axios instance

### 6.2 Add Security Headers

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

### 6.3 Input Sanitization in Forms

All forms use `react-hook-form` + `zod` — verify that:
- String fields have `.trim()` and `.max()` constraints
- No dangerous HTML rendered without sanitization
- Rich text content rendered via `dangerouslySetInnerHTML` uses `sanitize-html` (check `StructuredContent.tsx`)

---

## Phase 7: Monitoring & Observability

### Goal

Add error tracking, performance monitoring, and analytics foundation.

### 7.1 Error Boundary Enhancement

**File:** `src/app/error.tsx`

Currently a simple retry UI. Enhance with:
- Error logging to backend audit endpoint on mount
- Distinguish between network errors (show retry) and application errors (show contact support)
- Add error correlation ID

### 7.2 React Query Devtools

Add `@tanstack/react-query-devtools` in development only:

```bash
pnpm --filter @cict/web add -D @tanstack/react-query-devtools
```

```typescript
// src/components/providers/ReactQueryProvider.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 7.3 Performance Metrics

Add Web Vitals reporting in `src/lib/analytics.ts`:

```typescript
'use client';

export function reportWebVitals(metric: any) {
  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  // Send to analytics endpoint in production
  // api.post('/analytics/web-vitals', metric);
}
```

Register in `src/app/layout.tsx`:

```typescript
import { reportWebVitals } from '@/lib/analytics';

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
}
```

---

## Implementation Order & Dependencies

```
Phase 1 (Tests)
  ├── 1.1 Vitest config + setup
  ├── 1.2 Test utilities
  ├── 1.3 Batch A (data layer)
  ├── 1.3 Batch B (hooks)
  ├── 1.3 Batch C (contexts)
  ├── 1.3 Batch D (components)
  └── 1.3 Batch E (pages) ───── depends on Phase 4 (component extraction)

Phase 2 (Data Fetching)
  ├── 2.1 useOrganizations → RQ
  ├── 2.2 AdminDashboard → RQ
  ├── 2.3 usePermissionMetadata
  ├── 2.4 staleTime policy
  └── 2.5 API response types

Phase 3 (Performance)
  ├── 3.1 Dynamic imports
  ├── 3.2 <img> → <Image>
  ├── 3.3 Split large pages ──── test in Phase 1
  ├── 3.4 ISR for public routes
  └── 3.5 generateMetadata

Phase 4 (Consolidation)
  ├── 4.1 Merge data tables
  ├── 4.2 Merge confirm dialogs
  ├── 4.3 Barrel exports
  └── 4.4 Remove dead deps

Phase 5 (Server Components)
  ├── 5.1 Public page migration
  ├── 5.2 RSC + Client pattern
  └── 5.3 generateStaticParams

Phase 6 (Security)
  ├── 6.1 Student auth cookies ── requires backend changes
  ├── 6.2 Security headers
  └── 6.3 Input sanitization

Phase 7 (Observability)
  ├── 7.1 Error boundary
  ├── 7.2 React Query Devtools
  └── 7.3 Web Vitals
```

**Key dependencies between phases:**
- Phase 3.3 (split pages): extracted components should have tests written alongside (Phase 1 Batch D)
- Phase 5 (RSC): benefits from Phase 4 barrel exports for clean imports
- Phase 6.1 (student cookies): requires coordinated backend + frontend deployment
- Each phase must pass `typecheck`, `lint`, and `test` before moving to the next
- Phase 1 is the foundation — all subsequent phases rely on the test infrastructure

---

## Success Criteria

| Criterion | Phase | Measurement |
|---|---|---|
| Test coverage >70% on target files | 1 | `vitest run --coverage` |
| All legacy `useState/useEffect` data fetching eliminated | 2 | `rg "useEffect" src/hooks/` returns 0 data-fetching instances |
| Bundle size reduced by 400KB+ | 3 | `next build` output or bundle analyzer |
| Zero duplicate components | 4 | Manual component audit |
| >50% pages use React Server Components | 5 | Count of `'use client'` directives in `app/` |
| Zero `localStorage` token storage | 6 | `rg "localStorage.*token" src/` returns 0 |
| Error boundaries log to backend | 7 | Integration test confirms audit endpoint called |

---

## Verification Gates (Every Phase)

```bash
pnpm run web:typecheck    # Must pass — zero errors
pnpm run web:lint         # Must pass — zero errors (warnings acceptable)
pnpm run web:test         # Must pass — all existing + new tests green
pnpm run web:build        # Must pass — production build succeeds
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| RSC migration breaks client interactivity | Medium | High | Keep interactive sections as client children; test all interactions after migration |
| Student auth cookie migration breaks existing sessions | Low | High | Deploy backend cookie support first; keep legacy code during transition with feature flag |
| MSW mocks drift from real API responses | Medium | Medium | Add contract comparison test in CI |
| Bundle size regression from barrel exports | Low | Low | Verify with `next build` after Phase 4 |
| Test flakiness from async rendering | Medium | Low | Use `waitFor` with timeouts; use `findBy` queries over `getBy` + `waitFor` |
