# CICT — Manual Setup Guide

## Step 1: Create the Monorepo on GitHub

1. Go to https://github.com/new
2. Repo name: `CICT`
3. Owner: `uyronmarche14`
4. Public or Private — your choice
5. **Do NOT** initialize with README/.gitignore/LICENSE (we have them)

---

## Step 2: Push the Code

```bash
cd /home/ronmarche14/projects/CICT
git init
git checkout -b main
git add .
git commit -m "initial commit: CICT full-stack with CI/CD pipeline"

# Create staging branch
git branch staging main

# Add remote
git remote add origin git@github.com:uyronmarche14/CICT.git

# Push everything
git push -u origin main
git push -u origin staging
```

---

## Step 3: Rotate Exposed Credentials

**Before anyone clones**, rotate the leaked credentials:

1. **Cloudinary:** https://cloudinary.com/console → Settings → Access Keys → Regenerate
2. **MongoDB Atlas:** https://cloud.mongodb.com → Database Access → Generate new password

The `.gitignore` already excludes `.env*` files, so new commits won't leak them.

---

## Step 4: Reconnect Vercel to Monorepo

Current: Vercel reads from `uyronmarche14/cictv4` (standalone repo)

1. Go to https://vercel.com → your `cictv4` project → **Settings** → **Git**
2. Click **Disconnect** the current repo
3. Click **Connect Git Repository** → select `uyronmarche14/CICT`
4. Set **Root Directory** to `cictv4`
5. Set **Production Branch** to `main`
6. Save — Vercel will auto-deploy `cictv4/` from the monorepo

Zero downtime — your live site keeps serving during the switch.

---

## Step 5: Create Render Staging Backend Service

1. Go to https://dashboard.render.com → **New** → **Web Service**
2. Connect `uyronmarche14/CICT` repo
3. Branch: `staging`
4. **Root Directory:** `cict-backend`
5. **Name:** `cict-backend-staging`
6. **Runtime:** Node
7. **Build Command:** `npm install && npm run build`
8. **Start Command:** `npm start`
9. **Health Check Path:** `/health`

### Environment Variables

| Variable | Value |
|---|---|
| `NODE_ENV` | `staging` |
| `MONGODB_URI` | Your staging Atlas URI (from Step 6) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your new Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your new Cloudinary API secret |
| `CORS_ORIGIN` | Frontend staging URL (if applicable) |

After creation → **Settings** → **Deploy Hook** → copy URL → save for step 7

---

## Step 6: Create Staging MongoDB Atlas DB

1. https://cloud.mongodb.com → create cluster `cict-crm-staging` (M0 free tier)
2. **Database Access** → `cict-staging` user with strong password
3. **Network Access** → add `0.0.0.0/0`
4. **Connect** → Drivers → copy URI:
   ```
   mongodb+srv://cict-staging:<password>@cluster.xxxxx.mongodb.net/cict-crm-staging
   ```
5. Use this as `MONGODB_URI` in Render staging

---

## Step 7: Add GitHub Secrets

Go to `github.com/uyronmarche14/CICT` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Source |
|---|---|
| `RENDER_STAGING_DEPLOY_HOOK` | Render staging service → Settings → Deploy Hook |
| `RENDER_PRODUCTION_DEPLOY_HOOK` | Render production service → Settings → Deploy Hook |
| `RENDER_STAGING_URL` | `https://cict-backend-staging.onrender.com` |
| `RENDER_PRODUCTION_URL` | Your existing Render production URL |
| `VERCEL_TOKEN` | Vercel Account → Settings → Tokens → Create |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General → Project ID |
| `VERCEL_PRODUCTION_URL` | Your existing Vercel production URL |

---

## Step 8: Enable Branch Protection

`github.com/uyronmarche14/CICT` → **Settings** → **Branches** → **Add rule**

### `main`:
- [x] Require PR
- [x] Require 1 approval
- [x] Require status checks: `backend-checks`, `frontend-checks`, `security-audit`, `dependency-review`
- [x] Require up-to-date
- [x] Do not allow bypass

### `staging`:
- [x] Require PR
- [x] Require status checks: `backend-checks`, `frontend-checks`, `security-audit`, `dependency-review`
- [x] Require up-to-date
- [x] Do not allow bypass

---

## Step 9: Verify CI/CD

1. Push any branch: `git checkout -b test/verify-ci` → edit → push → PR to `staging`
2. GitHub Actions tab → 5 jobs run: backend-checks, frontend-checks, security-audit, secret-scan, dependency-review
3. Merge PR → `deploy-staging.yml` triggers → Render deploys backend staging
4. Push to `main` → `deploy-production.yml` triggers → Render + Vercel deploy
5. Check `https://cict-backend-staging.onrender.com/health` → 200
