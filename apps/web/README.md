# CICT Frontend

This web app is designed to run with the `apps/backend` API and supports three environments:

- Local development against MongoDB Atlas
- Local development against MongoDB in Docker
- Production deployment on Vercel with the backend on Render

## Prerequisites

- Node.js 20+
- pnpm 10+
- A running backend API
- MongoDB Atlas for always-on deployments, or Docker for local-only MongoDB

## Frontend Environment

Frontend env files are separated by environment:

- `.env.development` for local development
- `.env.production` for production builds
- `.env.local` or `.env.development.local` for machine-specific overrides

Copy the example file and adjust values as needed:

```bash
cp apps/web/docs/.env.development.example apps/web/.env.development
```

Required frontend variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ddnxfpziq
NEXT_PUBLIC_AUTH_COOKIE_NAME=token
```

## Local Development

Install dependencies and start the frontend:

```bash
pnpm install
pnpm run web:dev
```

The app runs at `http://localhost:3000`.

## Backend Environment

The backend now supports environment-specific files too:

- `.env.development` for local development
- `.env.production` for production-like runs
- `.env.local` or `.env.development.local` for machine-specific overrides

Local backend example:

```bash
cp /home/ronmarche14/projects/CICT/apps/backend/.env.development.example /home/ronmarche14/projects/CICT/apps/backend/.env.development
```

## Production Build

Use the standard Next.js production build for local verification and Vercel deployments:

```bash
pnpm run web:build
pnpm --filter @cict/web start
```

## Vercel Deployment

Set these environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<value-if-needed>
NEXT_PUBLIC_AUTH_COOKIE_NAME=token
```

Suggested Vercel settings:

- Framework: `Next.js`
- Root directory: `CICT/apps/web` if deploying from the parent repo
- Build command: `pnpm --filter @cict/contracts build && pnpm --filter @cict/web build`

## Backend On Render

Use the backend service from `CICT/apps/backend` with these Render settings:

- Runtime: `Node`
- Root directory: `CICT`
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @cict/contracts build && pnpm --filter @cict/backend build`
- Start command: `pnpm --filter @cict/backend start`
- Health check path: `/health`

Set these environment variables in Render:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/cict-crm?retryWrites=true&w=majority
JWT_SECRET=<strong-secret>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<strong-secret>
JWT_REFRESH_EXPIRE=30d
SESSION_SECRET=<strong-secret>
CORS_ORIGIN=https://<your-vercel-domain>
ALLOW_VERCEL_PREVIEWS=true
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_TO_FILES=false
CLOUDINARY_CLOUD_NAME=<value-if-used>
CLOUDINARY_API_KEY=<value-if-used>
CLOUDINARY_API_SECRET=<value-if-used>
```

You can also use the included [render.yaml](/home/ronmarche14/projects/CICT/apps/backend/render.yaml:1) as a starting point.

## MongoDB Atlas

For an always-on deployment, use MongoDB Atlas instead of local Docker.

- Atlas keeps working even when your device is off
- Local Docker MongoDB stops when Docker or your device stops

Use an explicit app database name in the URI:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/cict-crm?retryWrites=true&w=majority
```

## Full Stack Commands

Run the backend in a separate terminal:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run backend:dev
```

Then run the frontend:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run web:dev
```

If you are using Atlas locally, update `CICT/apps/backend/.env` first so `MONGODB_URI` points to your Atlas URI instead of localhost.

## Docker MongoDB Workflow

If you want MongoDB locally in Docker while keeping the frontend and backend in the terminal:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run backend:mongo:up
pnpm run backend:seed
pnpm run backend:dev
```

Then run the frontend normally:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run web:dev
```

Stop the local MongoDB container later with:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run backend:mongo:down
```

## Seed Admin User

To seed the default admin account:

```bash
cd /home/ronmarche14/projects/CICT
pnpm run backend:seed
```

Default seeded credentials:

```text
admin@cict.edu / Admin@123456
```
