# Deployment Guide

## Overview

This application consists of two separate deployments:
- **Frontend**: React app on Vercel
- **Backend**: FastAPI app on Render

The critical part of deployment is configuring the frontend to know where the backend is located.

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://[your-render-backend-url]/api/v1`
   - **Example**: `https://task-manager-y9as.onrender.com/api/v1`
4. Select environments: **Production** (or all if you prefer)
5. Click **Save**

### Step 2: Verify Build Settings

Ensure Vercel's build settings are:
- **Framework Preset**: Other (or Vite)
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### Why VITE_API_URL Matters

During the Vercel build:
1. `npm run build` runs with `VITE_API_URL` environment variable
2. Vite reads this value and embeds it in the built JavaScript files
3. At runtime, the frontend uses this URL to call the backend
4. **Without this**, the frontend defaults to `/api/v1` (relative path), which fails on Vercel because:
   - Vercel's domain (e.g., `task-manager-pi-gray.vercel.app`) doesn't have `/api/v1`
   - Requests fail with 404 errors

## Backend Deployment (Render)

### Prerequisites
- Render account
- GitHub repository connected to Render

### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name**: `task-manager` (or your preferred name)
   - **Environment**: Python 3
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

### Step 2: Set Environment Variables on Render

In **Environment**, add:
- **ALLOWED_ORIGINS**: `https://[your-vercel-url]`
  - **Example**: `https://task-manager-pi-gray.vercel.app`
  - **Note**: No trailing slash!
- **DATABASE_URL**: (optional, defaults to SQLite in `./task_manager.db`)
- **DEBUG**: `false` (for production)

### Step 3: Database Migration

The build command includes `alembic upgrade head` which:
1. Initializes the SQLite database file (if it doesn't exist)
2. Runs all migrations to create the `tasks` table
3. Happens automatically during Render deployment

If you need to manually create the database:
```bash
alembic upgrade head
```

## Common Issues & Solutions

### Issue: 404 Errors on Every Refresh

**Cause**: Frontend doesn't know where backend is (VITE_API_URL not set)

**Solution**:
1. Check Vercel environment variables are set correctly
2. Trigger a rebuild on Vercel (Settings → Deployments → Redeploy)
3. Verify backend URL in Render dashboard (copy exact URL)
4. Ensure no trailing slash in ALLOWED_ORIGINS on Render

### Issue: CORS Errors in Browser Console

**Cause**: ALLOWED_ORIGINS on Render doesn't match frontend origin

**Solution**:
1. Get exact frontend URL from Vercel (e.g., `https://task-manager-pi-gray.vercel.app`)
2. Update Render's ALLOWED_ORIGINS to match exactly (no trailing slash)
3. Redeploy Render backend

### Issue: Database Connection Errors

**Cause**: Migrations didn't run during deployment

**Solution**:
1. Check Render build logs for Alembic errors
2. If using external database, ensure DATABASE_URL env var is set correctly
3. For SQLite, ensure the build command runs `alembic upgrade head`

## Quick Deployment Checklist

- [ ] Backend URL is copied from Render
- [ ] VITE_API_URL set in Vercel environment variables
- [ ] ALLOWED_ORIGINS set in Render environment variables
- [ ] Frontend URL matches Render's ALLOWED_ORIGINS exactly
- [ ] Database migrations ran successfully (check Render build logs)
- [ ] Rebuild triggered on Vercel after env var changes
- [ ] Test API call in browser dev tools Network tab

## Development with External Backend

To test against deployed backend locally:

```bash
# Frontend directory
echo "VITE_API_URL=https://[render-url]/api/v1" > .env
npm run dev
```

## See Also

- [CORS_FIX_TECHNICAL_NOTE.md](CORS_FIX_TECHNICAL_NOTE.md) - Understanding CORS setup
- [PHASE_0_ANALYSIS.md](PHASE_0_ANALYSIS.md) - Architecture details
