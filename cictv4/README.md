# CICT Frontend

This frontend is designed to run with the `cict-backend` API and supports three environments:

- Local development against MongoDB Atlas
- Local development against MongoDB in Docker
- Production deployment on Vercel with the backend on Render

## Prerequisites

- Node.js 20+
- npm
- A running backend API
- MongoDB Atlas for always-on deployments, or Docker for local-only MongoDB

## Frontend Environment

Frontend env files are separated by environment:

- `.env.development` for local development
- `.env.production` for production builds
- `.env.local` or `.env.development.local` for machine-specific overrides

Copy the example file and adjust values as needed:

```bash
cp .env.development.example .env.development
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
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Backend Environment

The backend now supports environment-specific files too:

- `.env.development` for local development
- `.env.production` for production-like runs
- `.env.local` or `.env.development.local` for machine-specific overrides

Local backend example:

```bash
cp /home/ronmarche14/projects/CICT/cict-backend/.env.development.example /home/ronmarche14/projects/CICT/cict-backend/.env.development
```

## Production Build

Use the standard Next.js production build for local verification and Vercel deployments:

```bash
npm run build
npm start
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
- Root directory: `CICT/cictv4` if deploying from the parent repo
- Build command: `npm run build`

## Backend On Render

Use the backend service from `CICT/cict-backend` with these Render settings:

- Runtime: `Node`
- Root directory: `CICT/cict-backend` if deploying from the parent repo
- Build command: `npm install && npm run build`
- Start command: `npm start`
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

You can also use the included [render.yaml](/home/ronmarche14/projects/CICT/cict-backend/render.yaml:1) as a starting point.

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
cd /home/ronmarche14/projects/CICT/cict-backend
npm install
npm run dev
```

Then run the frontend:

```bash
cd /home/ronmarche14/projects/CICT/cictv4
npm install
npm run dev
```

If you are using Atlas locally, update `CICT/cict-backend/.env` first so `MONGODB_URI` points to your Atlas URI instead of localhost.

## Docker MongoDB Workflow

If you want MongoDB locally in Docker while keeping the frontend and backend in the terminal:

```bash
cd /home/ronmarche14/projects/CICT/cict-backend
npm run docker:mongo:up
npm run seed
npm run dev
```

Then run the frontend normally:

```bash
cd /home/ronmarche14/projects/CICT/cictv4
npm run dev
```

Stop the local MongoDB container later with:

```bash
cd /home/ronmarche14/projects/CICT/cict-backend
npm run docker:mongo:down
```

## Seed Admin User

To seed the default admin account:

```bash
cd /home/ronmarche14/projects/CICT/cict-backend
npm run seed
```

Default seeded credentials:

```text
admin@cict.edu / Admin@123456
```
