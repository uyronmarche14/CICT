# CICT — College of Information and Communication Technology

Full-stack web platform for the CICT department. Public-facing website + admin CMS.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Express 5 + TypeScript + MongoDB (Mongoose) |
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 |
| Auth | JWT (HTTP-only cookies) |
| Media | Cloudinary CDN |
| UI | shadcn/ui + Framer Motion |

## Quick Start (Full Stack)

### Prerequisites
- Node.js 20+
- Docker (for local MongoDB)

### Setup

```bash
# Clone the repo
git clone git@github.com:uyronmarche14/CICT.git
cd CICT

# Install backend dependencies
cd cict-backend
npm install
cd ..

# Install frontend dependencies
cd cictv4
npm install --legacy-peer-deps
cd ..
```

### Run Locally

**Terminal 1 — MongoDB + Backend:**
```bash
cd cict-backend

# Start MongoDB (Docker)
npm run docker:mongo:up

# Start backend dev server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd cictv4
npm run dev
```

Open http://localhost:3000 — API at http://localhost:5000/api

### Seed Database
```bash
cd cict-backend
npm run seed
```

## Available Scripts

### Backend
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Run tests |
| `npm run seed` | Seed database |

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server (turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Run tests |

## Environment Setup

1. Copy env examples:
```bash
cp cict-backend/.env.example cict-backend/.env
cp cictv4/.env.example cictv4/.env.local
```

2. Add your own values (MongoDB URI, JWT secrets, Cloudinary keys)

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
