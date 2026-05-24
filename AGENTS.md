# CICT — Agent Operational Reference

## CI/CD Pipeline Overview

```
feature/* ──PR──→ staging ──push──→ Staging (Render backend only)
                      │                    Frontend staging is a separate repo
                      │ PR
                      ↓
                    main ──push──→ Production (Render backend + Vercel frontend)
```

## GitHub Secrets Required

| Secret | Purpose |
|---|---|
| `RENDER_STAGING_DEPLOY_HOOK` | Render deploy hook URL for staging backend |
| `RENDER_PRODUCTION_DEPLOY_HOOK` | Render deploy hook URL for production backend |
| `RENDER_STAGING_URL` | Staging backend URL (e.g. https://cict-backend-staging.onrender.com) |
| `RENDER_PRODUCTION_URL` | Production backend URL |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_PRODUCTION_URL` | Production frontend URL |

## Workflow Files

| File | Trigger | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | PR to staging/main | Lint, typecheck, test, build, security audit, CodeQL, secret scan |
| `.github/workflows/deploy-staging.yml` | Push to staging | Deploy backend to Render staging |
| `.github/workflows/deploy-production.yml` | Push to main | Deploy backend to Render production + frontend to Vercel production |

## Available Scripts

### Backend (`apps/backend/`)
| Script | Command |
|---|---|
| `pnpm run backend:dev` | Start dev server with nodemon |
| `pnpm run backend:build` | Compile TypeScript |
| `pnpm run backend:lint` | ESLint check |
| `pnpm --filter @cict/backend lint:fix` | ESLint auto-fix |
| `pnpm run backend:typecheck` | TypeScript type check (no emit) |
| `pnpm run backend:test` | Run vitest tests |

### Web (`apps/web/`)
| Script | Command |
|---|---|
| `pnpm run web:dev` | Next.js dev server (turbopack) |
| `pnpm run web:build` | Next.js production build |
| `pnpm run web:lint` | ESLint check |
| `pnpm run web:typecheck` | TypeScript type check (no emit) |
| `pnpm run web:test` | Run vitest tests |

### Mobile (`apps/mobile/`)
| Script | Command |
|---|---|
| `pnpm run mobile:dev` | Start Expo dev server |
| `pnpm run mobile:android` | Run on Android |
| `pnpm run mobile:ios` | Run on iOS |
| `pnpm run mobile:web` | Run in web mode |
| `pnpm run mobile:lint` | Run Expo lint |
| `pnpm run mobile:typecheck` | TypeScript type check |
| `pnpm run mobile:test` | Run Jest tests |

## Full Stack Local Dev

```bash
# Start MongoDB
pnpm run backend:mongo:up

# Start backend (terminal 1)
pnpm run backend:dev

# Start frontend (terminal 2)
pnpm run web:dev
```

Open http://localhost:3000 (frontend) — API at http://localhost:5000 (backend)

To run mobile locally, start the backend first, then run Expo with `pnpm run mobile:dev`.

## Setting Up Staging Environment

1. **Render Staging Backend:**
   - Create new Web Service in Render dashboard
   - Use `apps/backend/render.staging.yaml` as Blueprint
   - Branch: `staging`
   - Set `MONGODB_URI` to a separate Atlas DB (e.g. `cict-crm-staging`)
   - Copy CLOUDINARY vars from production or use separate cloud
   - Note the deploy hook URL from Render dashboard

2. **Frontend Staging:**
   - The staging frontend is deployed from a **separate repository** with its own CI/CD pipeline
   - This repo only handles backend staging deployment

3. **Configure GitHub Secrets:**
   - Add all secrets listed above to repo Settings → Secrets and variables → Actions

## Branch Protection Rules

Configure in GitHub Settings → Branches:

| Branch | Rules |
|---|---|
| `main` | Require PR, require CI checks, require up-to-date, no direct push |
| `staging` | Require PR, require CI checks, require up-to-date, no direct push |

Required checks: `contracts-checks`, `backend-checks`, `frontend-checks`, `mobile-checks`, `security-audit`, `dependency-review`
