# CICT Website Development Team Roles

The following roles are based on the current skills of Mark and Jarl. Their assignments should focus on practical contributions to the CICT Website while allowing them to gradually improve their development skills.

The CICT Website includes a responsive public website and an admin content management platform for news, announcements, events, organizations, and member profiles. It is built on a pnpm monorepo with the following stack:

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **State & Data**: TanStack Query + Zustand + react-hook-form + Zod
- **Backend**: Express 5 + TypeScript + Mongoose 9 + MongoDB 7
- **Auth**: JWT in httpOnly cookies with RBAC permissions (admin + student)
- **Media**: Cloudinary via multer (backend) and next-cloudinary (frontend)
- **Shared**: `packages/contracts/` — Zod schemas and types used by all apps
- **Mobile**: Expo SDK 54 + React Native 0.81 + Expo Router (separate app)
- **Deployment**: Render (backend), Vercel (frontend), MongoDB Atlas (production)

---

## Mark — Junior Frontend Developer and Database Support

### Role Overview

Mark will focus on building and improving the frontend pages of the CICT Website using Next.js 15 and shadcn/ui components. He can also assist with basic database setup and testing using MongoDB via Docker.

Because Mark already has experience with React components, forms, routing, and responsive design, he can handle structured frontend tasks with guidance from the lead developer.

### Main Responsibilities

#### Frontend Development
- Build reusable React components using shadcn/ui primitives and Tailwind CSS v4.
- Create page layouts using Next.js App Router (file-based routing in `apps/web/src/app/`).
- Implement responsive designs for desktop, tablet, and mobile screens.
- Create and improve forms with react-hook-form and Zod validation.
- Use TanStack Query for server data fetching and caching in client components.
- Use Zustand for lightweight client-side state when needed.
- Implement buttons, cards, tables, dialogs, navigation menus, and modals using shadcn/ui.
- Write TypeScript — avoid `any` types; use contracts from `@cict/contracts` where possible.

#### Page Development

Mark may work on pages such as:

- News listing and detail pages
- Events listing and detail pages
- Organization pages (public and admin)
- Member profile pages
- Announcement sections
- Basic admin forms and content-management pages

These pages live in `apps/web/src/app/` under the appropriate route group (public root, `admin/`, or `student/`).

#### Database Support
- Start and stop MongoDB 7 via Docker: `pnpm run backend:mongo:up`
- Connect to MongoDB using MongoDB Compass for local inspection.
- View and verify test records in collections.
- Assist with checking whether forms correctly save and retrieve data.
- Run the backend seed script if available to populate test data.
- Report database issues to the lead developer.

#### Project Organization
- Follow the existing file and folder structure in `apps/web/`:
  - `src/components/` for reusable UI components
  - `src/components/admin/` for admin-specific components
  - `src/hooks/` for custom React hooks
  - `src/lib/` for API client and utilities
  - `src/app/` for routes and pages
- Avoid placing repeated UI code directly inside pages when reusable components can be created.
- Use clear naming conventions for files and components (PascalCase for components, camelCase for hooks/utils).
- Run `pnpm run web:typecheck` and `pnpm run web:lint` before submitting work.

#### Recommended Initial Tasks
- Build reusable cards (using shadcn/ui Card) for news, announcements, and events.
- Improve navigation between public pages using Next.js `<Link>` and App Router.
- Create basic forms with react-hook-form for adding or editing content.
- Build organization and member profile sections.
- Help seed and verify MongoDB test collections via Docker + Compass.
- Document completed pages and report unfinished items.

#### Development Boundary

Mark may create and improve frontend components and assist with basic database setup. Sensitive backend logic, authentication, RBAC permissions, API route creation, deployment configuration, and production database changes should remain under the lead developer unless specifically assigned.

---

## Jarl — Junior UI Developer and Technical Support

### Role Overview

Jarl will focus on basic user-interface development, styling, local MongoDB setup, and Git-based collaboration.

His tasks should begin with clearly defined sections and smaller UI components. As he improves his Tailwind CSS v4 and Git skills, he can gradually handle more complete pages.

### Main Responsibilities

#### Basic UI Development
- Write clean TSX structure inside Next.js page and component files.
- Apply Tailwind CSS v4 utility classes based on the approved design.
- Use shadcn/ui components where available rather than building from scratch.
- Use the project's existing class-variance-authority (cva) patterns for variant styling.
- Build simple UI components such as:
  - buttons (using shadcn/ui Button)
  - cards (using shadcn/ui Card)
  - badges
  - navigation links
  - content sections
  - basic tables (using shadcn/ui Table)
  - footer sections
- Check whether pages look consistent on desktop and mobile screens following the existing responsive patterns.

#### Page and Component Support

Jarl may assist with:

- Homepage sections
- Footer and navigation improvements
- News and event cards
- Organization information sections
- Member profile layouts
- Empty-state messages
- Simple admin dashboard sections
- Responsive spacing and layout fixes using Tailwind breakpoints

The CICT Website requires a responsive public interface that is usable on both desktop and mobile devices.

#### Database Setup Support
- Install Docker Desktop and pull the MongoDB 7 image.
- Start MongoDB via: `pnpm run backend:mongo:up`
- Connect to the local database using MongoDB Compass.
- View collections and documents to verify data is present.
- Insert test records manually via Compass or a seed script.
- Help verify whether sample content appears correctly on the website.

#### Git Collaboration
- Clone the repository.
- Create a branch for assigned tasks (e.g., `fix/footer-layout`, `feature/event-cards`).
- Pull the latest changes from `staging` before starting work.
- Commit changes with clear messages following conventional commits style.
- Push the assigned branch.
- Create or assist with pull requests targeting `staging`.
- Avoid directly pushing changes to the `main` or `staging` branches.

#### Recommended Initial Tasks
- Build reusable buttons, badges, and section headers using shadcn/ui.
- Improve the footer and navigation layout.
- Create responsive news, announcement, and event cards.
- Apply spacing and alignment fixes across existing pages.
- Set up MongoDB via Docker and explore collections in Compass.
- Practice Git branches, commits, pushes, and pull requests.

#### Development Boundary

Jarl should begin with UI tasks, local database support, and Git collaboration. React logic, complex forms (react-hook-form + Zod), authentication, RBAC permissions, API routes, TanStack Query usage, and any backend implementation should be assigned only after he has completed the required training or received direct guidance.

---

## System Overview (for context)

```
cict/                          # pnpm monorepo
├── apps/
│   ├── backend/               # Express 5 + Mongoose 9 + MongoDB
│   │   ├── src/models/        # 40 Mongoose models (User, Event, News, etc.)
│   │   ├── src/routes/        # REST API routes
│   │   ├── src/middleware/    # Auth, RBAC, validation, rate limiting
│   │   ├── src/controllers/   # Business logic
│   │   └── docker-compose.mongo.yml  # MongoDB 7 local dev
│   │
│   ├── web/                   # Next.js 15 + React 19 + shadcn/ui
│   │   ├── src/app/           # App Router (public/, admin/, student/)
│   │   ├── src/components/    # Reusable components + admin components
│   │   ├── src/hooks/         # Custom hooks + TanStack Query hooks
│   │   ├── src/lib/           # API client, utilities
│   │   └── src/context/       # AuthContext, StudentAuthContext
│   │
│   └── mobile/                # Expo SDK 54 (separate student app)
│
└── packages/
    └── contracts/             # Zod schemas + TypeScript types shared across all apps
```

## Role Comparison

| Area | Mark | Jarl |
|---|---|---|
| HTML / TSX | Can independently build sections | Can build basic sections with guidance |
| Tailwind CSS v4 | Can use for responsive layouts | Basic usage; needs gradual training |
| Responsive design | Can implement and test | Can assist with layout fixes |
| shadcn/ui / Radix | Can use primitives effectively | Can use basic components with guidance |
| React components | Can create reusable components | Can assist after additional training |
| React forms (react-hook-form + Zod) | Can create basic forms | Not yet a primary responsibility |
| Next.js App Router | Can implement routes and navigation | Can assist with navigation UI |
| TanStack Query | Can use for data fetching | Not yet a primary responsibility |
| Zustand | Can use for client state | Not yet a primary responsibility |
| TypeScript | Can write typed components | Learning; should follow existing types |
| MongoDB / Docker | Can start DB, seed data, verify via Compass | Can start DB and inspect collections |
| Git workflow | Should follow standard workflow | Primary learning and collaboration requirement |
| Best focus | Frontend pages, forms, data fetching, DB support | UI components, styling, setup, Git support |

## Team Structure

```
Lead Developer
├── Mark
│   └── Junior Frontend Developer and Database Support
└── Jarl
    └── Junior UI Developer and Technical Support
```

The lead developer should continue handling the critical areas of the platform:

- system architecture and monorepo configuration
- backend development (Express routes, controllers, models)
- authentication and JWT cookie management
- RBAC permissions and authorization middleware
- security (helmet, CORS, rate limiting, sanitization, CSRF)
- API design and contract definitions (`packages/contracts/`)
- Cloudinary media integration
- deployment pipelines (Render, Vercel, CI/CD workflows)
- production database (MongoDB Atlas) changes and migrations
- code review and pull-request approval
- mobile app (Expo) coordination

The website includes protected admin operations and role-based access rules, so sensitive functionality should be reviewed carefully before merging changes.
