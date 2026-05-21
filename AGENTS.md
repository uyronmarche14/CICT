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

### Backend (`cict-backend/`)
| Script | Command |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm test` | Run vitest tests |

### Frontend (`cictv4/`)
| Script | Command |
|---|---|
| `npm run dev` | Next.js dev server (turbopack) |
| `npm run build` | Next.js production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm test` | Run vitest tests |

## Full Stack Local Dev

```bash
# Start MongoDB
cd cict-backend && npm run docker:mongo:up

# Start backend (terminal 1)
cd cict-backend && npm run dev

# Start frontend (terminal 2)
cd cictv4 && npm run dev
```

Open http://localhost:3000 (frontend) — API at http://localhost:5000 (backend)

## Setting Up Staging Environment

1. **Render Staging Backend:**
   - Create new Web Service in Render dashboard
   - Use `cict-backend/render.staging.yaml` as Blueprint
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

Required checks: `backend-checks`, `frontend-checks`, `security-audit`, `dependency-review`
