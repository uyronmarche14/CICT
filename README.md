# CICT — College of Information and Communication Technology

Full-stack web platform for the CICT department. Public-facing website + admin CMS.

The repository is now a pnpm workspace monorepo with backend, web, mobile, and shared API contracts.

## Start Here for Developers

New to the project? Start with the [Developer Guide](docs/DEVELOPER_GUIDE.md). It explains the monorepo structure, backend/web/mobile responsibilities, request flow, local setup, quality checks, deployment overview, and first-day onboarding checklist.

## Documentation Index

| Document | Purpose |
|---|---|
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Main onboarding guide for new developers |
| [Lookup Protocol](docs/LOOKUP_PROTOCOL.md) | Rules for form lookups, reference data, enums, and backend validation |
| [Workflow, Architecture, and Process Audit](docs/audits/CICT_WORKFLOW_ARCHITECTURE_AND_PROCESS_AUDIT.md) | Evidence-based audit of module connections, approvals, RBAC, QR attendance, mobile flows, and architecture gaps |
| [Module Connection and Approval Flow Map](docs/architecture/CICT_MODULE_CONNECTION_AND_APPROVAL_FLOW_MAP.md) | Mermaid-based map of system architecture, approval flows, QR attendance, dashboard, process, and disconnected flows |
| [Workflow Gaps and Next-Steps Plan](docs/plans/CICT_WORKFLOW_GAPS_AND_NEXT_STEPS.md) | Prioritized remediation backlog for workflow, approval, QR attendance, mobile, RBAC, and architecture gaps |
| [Organization System Connection Architecture](docs/architecture/CICT_ORGANIZATION_SYSTEM_CONNECTION_ARCHITECTURE.md) | Organization-specific connection map for memberships, tasks, meetings, events, budget, voting, storage, activity, notifications, and analytics |
| [Organization Storage and BYOK/BYOS Decision](docs/plans/CICT_ORGANIZATION_STORAGE_BYOK_DECISION.md) | Storage architecture decision, full optional BYOK/BYOS process, and recommendation to use platform-managed storage with org quotas first |
| [Organization System Implementation Plan](docs/plans/CICT_ORGANIZATION_SYSTEM_IMPLEMENTATION_PLAN.md) | Phased organization-system plan for dashboard, activity timeline, storage metadata, mobile membership, voting, files, calendar, notifications, and future BYOS |
| [System Documentation](CICT_SYSTEM_DOCUMENTATION.md) | Deep current-state reference for modules, features, and gaps |
| [CI/CD Pipeline](CICT_CICD_PIPELINE.md) | CI/CD tracker, deployment phases, and verification status |
| [Agent Operational Reference](AGENTS.md) | Agent instructions, scripts, secrets, and branch protection notes |
| [Main Roadmap](apps/web/docs/implementation/MASTER_ROADMAP.md) | Phase 1-9 implementation roadmap |
| [Expansion Roadmap](apps/web/docs/implementation/MASTER_ROADMAP_EXPANSION.md) | Phase 10+ expansion roadmap and business logic |
| [Mobile Architecture](apps/mobile/docs/architecture.md) | Expo app architecture and mobile guidance |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Express 5 + TypeScript + MongoDB (Mongoose) |
| Web | Next.js 15 + React 19 + Tailwind CSS 4 |
| Mobile | Expo + React Native + TypeScript |
| Shared | `@cict/contracts`, `@cict/tsconfig`, `@cict/eslint-config` |
| Auth | JWT (HTTP-only cookies) |
| Media | Cloudinary CDN |
| UI | shadcn/ui + Framer Motion |

## Quick Start (Full Stack)

### Prerequisites
- Node.js 20+
- pnpm 10+
- Docker (for local MongoDB)

### Setup

```bash
# Clone the repo
git clone git@github.com:uyronmarche14/CICT.git
cd CICT

# Install all workspace dependencies
corepack enable
pnpm install
```

### Run Locally

**Terminal 1 - MongoDB + Backend:**
```bash
pnpm run backend:mongo:up
pnpm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
pnpm run web:dev
```

Open http://localhost:3000. The API is at http://localhost:5000/api.

### Seed Database
```bash
pnpm run backend:seed
```

## Available Scripts

### Backend
| Command | Description |
|---|---|
| `pnpm run backend:dev` | Start dev server with nodemon |
| `pnpm run backend:build` | Compile TypeScript |
| `pnpm run backend:lint` | ESLint check |
| `pnpm run backend:typecheck` | TypeScript type check |
| `pnpm run backend:test` | Run tests |
| `pnpm run backend:seed` | Seed database |

### Frontend
| Command | Description |
|---|---|
| `pnpm run web:dev` | Next.js dev server (turbopack) |
| `pnpm run web:build` | Production build |
| `pnpm run web:lint` | ESLint check |
| `pnpm run web:typecheck` | TypeScript type check |
| `pnpm run web:test` | Run tests |

### Mobile
| Command | Description |
|---|---|
| `pnpm run mobile:dev` | Start Expo dev server from the repo root |
| `pnpm run mobile:android` | Run the Expo app on Android |
| `pnpm run mobile:ios` | Run the Expo app on iOS |
| `pnpm run mobile:web` | Run the Expo app on the web |
| `pnpm run backend:tunnel` | Expose the backend through a temporary public tunnel for phone testing |

## Environment Setup

1. Copy env examples:
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

2. Add your own values (MongoDB URI, JWT secrets, Cloudinary keys)

For phone testing from WSL, prefer a tunnel-backed mobile API URL instead of `localhost`.

## Branch Strategy

```
feature/* -> PR -> staging -> push -> Render staging backend
                 -> PR -> main -> push -> Render production backend + Vercel frontend
```

## CI/CD

Three GitHub Actions workflows:
- **CI** - lint, typecheck, test, build, security scan (on every PR)
- **Deploy Staging** - push to `staging` deploys backend to Render
- **Deploy Production** - push to `main` deploys to Render (backend) and Vercel (frontend)

See `AGENTS.md` for CI/CD reference and required GitHub Secrets.
