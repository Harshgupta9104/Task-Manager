# Production CORS Failure — Technical Note

## Symptom

The deployed frontend:

- `https://task-manager-pi-gray.vercel.app`

calls the deployed backend:

- `https://task-manager-y9as.onrender.com/api/v1`

The browser console reported:

```
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

The backend was reachable (requests completed server-side), but the browser
blocked the response because the CORS headers were not emitted for the
frontend origin.

## Root cause

The application stores allowed origins in `ALLOWED_ORIGINS` and passes them
directly to FastAPI's `CORSMiddleware`. FastAPI matches the request's
`Origin` header against that list with an **exact string comparison**.

The deployment environment was configured with a value that included a
trailing slash:

```
ALLOWED_ORIGINS=https://task-manager-pi-gray.vercel.app/
```

The browser, however, always sends the origin **without** a trailing slash:

```
Origin: https://task-manager-pi-gray.vercel.app
```

Because `https://task-manager-pi-gray.vercel.app/` !=
`https://task-manager-pi-gray.vercel.app`, the middleware did not consider the
origin allowed and did not emit `Access-Control-Allow-Origin`. With
`allow_credentials=True`, FastAPI cannot fall back to a wildcard origin, so the
request was effectively blocked at the CORS layer.

## Fix

Two changes were made:

1. **Origin normalization in `app/config.py`**  
   Every configured origin is now normalized by:
   - stripping surrounding whitespace
   - removing a single trailing slash

   This makes `https://example.com/` and `https://example.com` compare equal.

   The parser also became more robust:
   - plain string: `https://example.com`
   - comma-separated: `https://a.com,https://b.com`
   - JSON array: `["https://a.com","https://b.com"]`

   All three forms are accepted so the Render environment variable can be set
   either way.

2. **Startup diagnostics**  
   The application now logs the normalized allowed origins at startup from both
   `app/config.py` (construction time) and `app/main.py` (lifespan). These
   diagnostics expose only configuration, never secrets.

## What did NOT change

- Frontend API URL — it already pointed at the correct Render backend.
- `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]`.
- No `allow_origins=["*"]` — that would be incompatible with credentials.
- No authentication or Phase 1 work — this is a pure CORS configuration fix.

## Verification

The following were asserted by backend tests:

- OPTIONS preflight from the Vercel origin receives the correct
  `Access-Control-Allow-Origin` header.
- Normal GET requests from the Vercel origin receive the correct CORS header.
- An unrelated origin is not allowed.
- A configured origin with a trailing slash still matches the browser origin
  without a trailing slash.
- The default localhost development origin still works.
- A JSON-array `ALLOWED_ORIGINS` value configures the origin correctly.
- `allow_credentials`, `allow_methods`, and `allow_headers` remain as required.

## Deployment guidance

Set on Render:

```
ALLOWED_ORIGINS=https://task-manager-pi-gray.vercel.app
```

A trailing slash is no longer fatal, but the clean form is preferred because it
matches what the browser sends.

If additional production origins are added later, the same normalization rules
apply.
