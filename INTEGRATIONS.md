# API keys & deployment checklist

After hosting the app, you should only need to **fill environment variables** and run a quick smoke test. Everything else is built in.

## 1. Required (not third-party APIs)

| Variable | Notes |
|----------|--------|
| `JWT_SECRET` | Min 32 random characters |
| `DB_CONNECTION_STRING` | SQL Server connection |
| `MSSQL_SA_PASSWORD` | If using Docker SQL |
| `ALLOWED_ORIGINS` | Your frontend URL(s) |
| `NEXT_PUBLIC_APP_URL` | Public site URL (frontend build) |

## 2. Optional API keys (enable live features)

### MSG91 — OTP (SMS / WhatsApp)

| Variable | Required for |
|----------|----------------|
| `SMS_MSG91_AUTH_KEY` | Any MSG91 mode |
| `SMS_MSG91_TEMPLATE_ID` | Live SMS OTP |
| `SMS_MSG91_WHATSAPP_TEMPLATE_NAME` | Live WhatsApp OTP |
| `SMS_MSG91_WHATSAPP_INTEGRATED_NUMBER` | Live WhatsApp OTP |

**Without keys:** OTP is printed in API console/logs (fine for beta).

### Razorpay — online payments

| Variable | Required for |
|----------|----------------|
| `RAZORPAY_KEY_ID` | Live checkout |
| `RAZORPAY_KEY_SECRET` | Live checkout |
| `RAZORPAY_WEBHOOK_SECRET` | Payment confirmation via webhook (recommended) |

**Without keys:** “Razorpay Demo” modal — no real charge.

**With keys:** Razorpay Checkout opens automatically. Register webhook:

`POST https://your-api-domain/api/v1/payments/webhook`

### Cloudinary — product images (admin)

| Variable |
|----------|
| `CLOUDINARY_CLOUD_NAME` |
| `CLOUDINARY_API_KEY` |
| `CLOUDINARY_API_SECRET` |

**Without keys:** uploads saved locally on the API server.

### Redis (optional)

| Variable |
|----------|
| `REDIS_CONNECTION_STRING` |

**Without:** in-memory OTP/cache (OK for single-server beta).

### Meilisearch (optional — not required)

Search uses **SQL Server**. Meilisearch keys are only needed if you add indexing later.

---

## 3. Check integration status

After the API starts:

```http
GET /api/v1/integrations
```

Or read startup logs — each module is listed as `demo`, `live`, or `fallback`.

---

## 4. Smoke test (5 minutes)

1. `GET /api/v1/health` → database connected  
2. `GET /api/v1/integrations` → note pending keys  
3. Login with OTP (check API logs if demo)  
4. Add to cart → checkout → pay (demo or live)  
5. `GET /api/v1/delivery/check?pincode=560001` → delivery ETA  

---

## 5. What you do **not** need for beta

- Google Sign-In  
- Meilisearch  
- Custom pincode API (delivery uses seeded shipping zones in DB)  

See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker and local run commands.
