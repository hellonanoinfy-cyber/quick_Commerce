# FirstCry — Deployment Guide

## Prerequisites

- Docker 24+ and Docker Compose v2 (production), **or**
- .NET 8 SDK, Node.js 22, SQL Server (local dev)
- Strong secrets: JWT (≥32 chars), SQL SA password, optional MSG91 / Razorpay keys

## Quick start (Docker — production-style)

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET, MSSQL_SA_PASSWORD, ALLOWED_ORIGINS, etc.

docker compose -f docker-compose.prod.yml up -d --build
```

| Service    | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:5000  |
| Health    | http://localhost:5000/health |

The frontend proxies `/api/*` and `/hubs/*` to the backend via `API_INTERNAL_URL` (default `http://backend:8080`). Leave `NEXT_PUBLIC_API_URL` empty so the browser uses same-origin requests.

## Environment variables

See [.env.example](.env.example) for the full list. Required for production:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signing key (min 32 characters, no placeholders) |
| `MSSQL_SA_PASSWORD` | SQL Server SA password |
| `DB_CONNECTION_STRING` | EF Core connection string |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS |

Optional: `SMS_MSG91_*` (OTP), `RAZORPAY_*` (payments), `REDIS_CONNECTION_STRING`, `MEILI_*`, `CLOUDINARY_*`.

Backend also reads `Database__MigrateOnStartup` (default `true` in Production) and `Database__SeedOnStartup` (default `false` in Production).

## Local development (no Docker)

```powershell
sqllocaldb start MSSQLLocalDB
cd backend/FirstCry/src/FirstCry.API
dotnet run --urls http://localhost:5181

cd frontend
npm ci && npm run dev
```

Uses `appsettings.Development.json` (LocalDB, auto-migrate + seed). OTP and Razorpay run in demo mode when keys are empty.

## CI

GitHub Actions (`.github/workflows/ci.yml`): frontend lint + build, backend Release build on .NET 8.

See [INTEGRATIONS.md](INTEGRATIONS.md) for the API-key-only checklist and `GET /api/v1/integrations`.

## Smoke test checklist

- [ ] `GET /health` returns `Healthy` with database connected
- [ ] Login: send OTP (SMS / WhatsApp) — check backend logs in demo mode
- [ ] Browse products, cart, checkout
- [ ] Payment: Razorpay demo modal when keys are empty
- [ ] CORS: frontend origin listed in `ALLOWED_ORIGINS`

## Security notes

- Never commit `.env` with real secrets.
- Production rejects weak JWT placeholders at startup.
- HSTS and CSP headers are enabled outside Development.
- Run behind HTTPS reverse proxy; forwarded headers are enabled for `X-Forwarded-*`.
