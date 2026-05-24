# CICT — College of Information and Communication Technology

Full-stack web platform for the CICT department. Public-facing website + admin CMS.

The repository is now a pnpm workspace monorepo with backend, web, mobile, and shared API contracts.

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

**Terminal 1 — MongoDB + Backend:**
```bash
pnpm run backend:mongo:up
pnpm run backend:dev
```

**Terminal 2 — Frontend:**
```bash
pnpm run web:dev
```

Open http://localhost:3000 — API at http://localhost:5000/api

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
feature/* ──PR──→ staging ──push──→ Render staging backend
                      │ PR
                      ↓
                    main ──push──→ Render production backend + Vercel frontend
```

## CI/CD

Three GitHub Actions workflows:
- **CI** — lint, typecheck, test, build, security scan (on every PR)
- **Deploy Staging** — push to `staging` → deploys backend to Render
- **Deploy Production** — push to `main` → deploys to Render (backend) + Vercel (frontend)

See `AGENTS.md` for CI/CD reference and required GitHub Secrets.
