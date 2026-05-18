# FirstCry — Pre-Deploy Security & Smoke-Test Checklist

Target: Frontend on Vercel, Backend on Render or Fly.io.
Use this as a sign-off list before flipping production traffic.

---

## 1. Secrets rotation (do this FIRST)

`.env` is local-only (verified: not tracked by git), but the values in it
must not be reused in production. Generate fresh secrets and set them in
the PaaS dashboards directly — never in any committed file.

### 1.1 Generate new secrets

```bash
# JWT secret (>= 32 chars)
openssl rand -hex 32

# SQL Server SA password (strong, mixed case + symbols)
openssl rand -base64 24
```

### 1.2 Set on Render (backend service → Environment)

Required:

| Variable | Value |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | Azure SQL / Aiven SQL Server full string |
| `Jwt__Secret` | Output of `openssl rand -hex 32` |
| `Jwt__Issuer` | `FirstCry` |
| `Jwt__Audience` | `FirstCryApp` |
| `Jwt__ExpirationInMinutes` | `15` |
| `Jwt__RefreshTokenExpirationInDays` | `7` |
| `Cors__AllowedOrigins` | `https://<your-vercel-domain>` (comma-sep for multiple) |
| `Database__MigrateOnStartup` | `true` for first deploy, `false` after |
| `Database__SeedOnStartup` | `false` |

Optional (live mode for each integration):

| Variable | Notes |
|---|---|
| `ConnectionStrings__Redis` | Upstash URL with `abortConnect=false` |
| `Sms__Msg91__AuthKey`, `Sms__Msg91__TemplateId` | Real OTP |
| `Sms__Msg91__WhatsAppTemplateName`, `Sms__Msg91__WhatsAppIntegratedNumber` | Real WhatsApp OTP |
| `Razorpay__KeyId`, `Razorpay__KeySecret`, `Razorpay__WebhookSecret` | Live payments |
| `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret` | Live image uploads |

### 1.3 Set on Vercel (frontend → Environment Variables)

| Variable | Value |
|---|---|
| `API_INTERNAL_URL` | `https://<your-firstcry-api>.onrender.com` |
| `NEXT_PUBLIC_API_URL` | leave empty (use same-origin via rewrites) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-domain>` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your cloud name (if using Cloudinary) |

### 1.4 Local-disk secrets

Once production secrets are live in Render/Vercel, you can either:

- Keep `.env` locally for dev (it is already gitignored), **OR**
- Delete `.env` from disk and rely on `appsettings.Development.json` defaults

Either is fine — the file is never built into the Docker image
(verified in [.dockerignore](.dockerignore)).

---

## 2. Hard security gates (must pass before going live)

| # | Check | How to verify |
|---|---|---|
| 1 | JWT secret is ≥ 32 chars and not a placeholder | Startup will throw `InvalidOperationException` if not — see [JwtConfigurationExtensions.cs](backend/FirstCry/src/FirstCry.API/Extensions/JwtConfigurationExtensions.cs) |
| 2 | CORS allows only your Vercel domain | `curl -I -H "Origin: https://your-vercel-domain" https://<api>/api/v1/health` → `Access-Control-Allow-Origin` matches |
| 3 | HSTS header present in prod | `curl -I https://<api>/health` → contains `Strict-Transport-Security` |
| 4 | Swagger NOT exposed in prod | `curl https://<api>/swagger/index.html` → `404` |
| 5 | `.env` is not in the Docker image | `docker run --rm <image> sh -c "ls -la /app | grep env"` → nothing |
| 6 | SQL connection uses TLS | Connection string has `Encrypt=True;TrustServerCertificate=False` (or trusted root) |
| 7 | Razorpay webhook signed | `Razorpay__WebhookSecret` set; test webhook delivery via Razorpay dashboard |
| 8 | Rate limiter active on auth | Send 6 OTP requests in 1 min → 6th returns `429` |
| 9 | Health endpoint returns DB state | `GET /health` shows `"Status":"Healthy"` and `"Database":{"Status":"connected"}` |
| 10 | Admin route locked down | `curl https://<api>/api/v1/admin/dashboard` (no token) → `401` |

---

## 3. Frontend gates

| # | Check | How |
|---|---|---|
| 1 | Build succeeds on Linux (Vercel uses Linux) | CI green after the `cross-env` script fix |
| 2 | Security headers present | DevTools Network tab on Vercel deployment → response headers include `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy` |
| 3 | No console errors on Home, Login, Cart, Checkout | Browser DevTools console clean |
| 4 | API requests go through `/api/*` rewrite | DevTools Network → URLs are `https://your-vercel-domain/api/v1/...`, NOT direct to backend |
| 5 | Cookie flags | DevTools Application → Cookies → `firstcry_auth_token` and refresh cookie are `Secure` (note: `HttpOnly` only applies to backend-set refresh cookie; client-set `firstcry_auth_token` is intentionally readable for the auth-store) |

---

## 4. Dependency vulnerability sweep

CI now runs these as warn-only steps. Run manually before each deploy:

```bash
# Frontend
cd frontend && npm ci && npm audit --omit=dev --audit-level=high

# Backend
cd backend/FirstCry && dotnet restore && \
  dotnet list src/FirstCry.API/FirstCry.API.csproj package --vulnerable --include-transitive
```

Action: address `high` / `critical` findings only. `moderate` is OK for first deploy.

---

## 5. Smoke-test checklist (run against staging)

After Render and Vercel are both deployed:

```bash
API=https://your-firstcry-api.onrender.com
WEB=https://your-vercel-domain.com
```

| # | Test | Expected |
|---|---|---|
| 1 | `curl -s $API/health` | JSON with `"Status":"Healthy"`, `"Database":{"Status":"connected"}` |
| 2 | `curl -s -X POST $API/api/v1/auth/send-otp -H "Content-Type: application/json" -d '{"phoneNumber":"<your-test-phone>"}'` | 200, OTP sent (live SMS or logged in console if demo) |
| 3 | Verify OTP via `$API/api/v1/auth/verify-otp` | JWT in body + `refreshToken` cookie set |
| 4 | Call `$API/api/v1/auth/refresh-token` with refresh cookie | New JWT, old refresh token revoked |
| 5 | Browse `$WEB/` → Home loads, category nav works | No 4xx/5xx in console |
| 6 | Login on `$WEB/auth/login` with the test number | Redirect to home, account menu shows user |
| 7 | Add product to cart, go to `/checkout`, place order with Razorpay demo or live | Order appears in admin panel |
| 8 | Login as admin (`User.Role = "Admin"`) → visit `$WEB/admin` | Dashboard loads, `/api/v1/admin/dashboard` returns 200 |
| 9 | Send 6 OTPs in 60 s | 6th returns 429 |
| 10 | Direct hit to `/api/v1/admin/dashboard` without token | 401 |

---

## 6. Post-deploy hardening (recommended, not required for launch)

These are intentionally out-of-scope for the first deploy to avoid
breaking the working auth flow, but should be planned next:

| Item | Why |
|---|---|
| Move JWT access token to HttpOnly + Secure cookie | Reduces XSS impact |
| Add anti-CSRF token on state-changing routes | Cookie-based auth requires it |
| Add DB indexes on `Users.PhoneNumber`, `Orders.UserId`, `Products.Slug` | Performance at scale |
| Idempotency keys on order/payment endpoints | Prevent duplicate orders on retry |
| Wire APM (Application Insights / OpenTelemetry) | Production observability |
| Flip `Database__MigrateOnStartup=false` and run migrations as a one-off | Safe multi-instance scaling |
| Set `typescript.ignoreBuildErrors: false` in `next.config.mjs` | Catch type errors at build time |
| Add integration tests for auth, place-order, payment webhook | Prevent regressions |

---

## 7. Rollback plan

If staging smoke test fails:

1. Render → service → Deploys → click previous green deploy → "Redeploy"
2. Vercel → Deployments → previous good build → "Promote to Production"
3. If DB migration is the issue, restore from automated daily backup (Azure SQL / Aiven both provide PITR)

Never run destructive SQL without a fresh backup first.
