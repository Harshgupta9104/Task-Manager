# Deployment Debugging - Failed to Fetch Error

## Issue
Frontend shows: `Failed to fetch` error when calling the backend API

## Root Causes (in order of likelihood)

### 1. Backend Database Not Initialized
**Symptom:** Requests fail when backend tries to access database  
**Check:** Render build logs

1. Go to Render dashboard → Your service
2. Click **Logs** tab
3. Scroll through deployment logs looking for:
   - Errors from `alembic upgrade head`
   - Database connection errors
   - Permission errors

**Fix if failed:**
- Render > Service Settings > Build & Deploy
- Verify **Build Command** is:
  ```
  pip install -r requirements.txt && alembic upgrade head
  ```
- If not, update it
- Trigger a new deploy: **Render > Manual Deploy > Deploy latest commit**

### 2. CORS Preflight Failing
**Symptom:** Browser OPTIONS request is rejected  
**Check:** Browser DevTools Network tab on deployed site

1. Open deployed frontend: `https://task-manager-pi-gray.vercel.app`
2. Open DevTools (F12) → Network tab
3. Reload page (Ctrl+R)
4. Look for failed requests
5. Click on the failed request
6. Check **Response Headers** for `Access-Control-Allow-Origin`

**If missing CORS header:**
- Your Render `ALLOWED_ORIGINS` doesn't match frontend URL
- Must be EXACT: `https://task-manager-pi-gray.vercel.app` (no trailing slash!)
- Update on Render and redeploy

### 3. Backend Port Not Exposed
**Symptom:** Connection refused  
**Check:** Render service running with correct port

Render automatically uses the `$PORT` environment variable.

Verify **Start Command** on Render is:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4. Network/Connectivity Issue Between Vercel and Render
**Symptom:** Requests timeout  
**Check:** Direct API call from browser

Try in browser console (while on Vercel domain):
```javascript
fetch('https://task-manager-y9as.onrender.com/health', {
  headers: { 'Accept': 'application/json' }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

If this fails: Your Render backend isn't responding to external requests.

---

## Step-by-Step Fix

### Step 1: Check Render Logs
```
1. Go to Render dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for errors in the last deployment
```

**Expected to see:**
```
Starting Task Management API v1.0.0 with CORS allowed origins: ['https://task-manager-pi-gray.vercel.app']
```

**If you see errors:** Screenshot them and share

### Step 2: Verify ALLOWED_ORIGINS
On Render dashboard:
1. Go to Environment → Your service
2. Check **Environment** tab (Settings > Environment)
3. Verify `ALLOWED_ORIGINS` is exactly: `https://task-manager-pi-gray.vercel.app`
   - No `http://` (must be `https://`)
   - No trailing `/`
   - No `*` wildcard

### Step 3: Test Health Endpoint
In browser console (while on `https://task-manager-pi-gray.vercel.app`):
```javascript
fetch('https://task-manager-y9as.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(e => alert(e.message))
```

Should show: `{"status":"healthy","app":"Task Management API",...}`

**If it fails:** Backend isn't accessible

### Step 4: Check Tasks Endpoint with Preflight
In browser console:
```javascript
fetch('https://task-manager-y9as.onrender.com/api/v1/tasks/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://task-manager-pi-gray.vercel.app'
  }
})
  .then(r => r.json())
  .then(console.log)
  .catch(e => alert(`Error: ${e.message}`))
```

---

## Common Fixes

### Fix 1: Re-run Database Migrations
On Render:
1. Manual Deploy > Redeploy latest commit
2. This runs build command including `alembic upgrade head`

### Fix 2: Update ALLOWED_ORIGINS
On Render:
1. Settings > Environment > Edit
2. Update `ALLOWED_ORIGINS` to your exact Vercel URL
3. Save and manual redeploy

### Fix 3: Restart Backend
On Render:
1. Go to your service
2. Click **Suspend** button
3. Wait 30 seconds
4. Click **Resume**

---

## What to Check & Report Back

1. **Render logs** - Are there any errors during deployment?
2. **ALLOWED_ORIGINS value** - Exact value you set
3. **Health endpoint test** - Does `https://task-manager-y9as.onrender.com/health` work?
4. **Browser console** - Any CORS errors or specific error messages?

Once you run through these steps, you'll identify exactly where the issue is!
