# ══════════════════════════════════════════════════
# Frontend Dockerfile — Next.js Multi-stage Build
# ══════════════════════════════════════════════════

FROM node:22-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

# Render injects service env vars during `docker build` (see render.yaml).
# API_INTERNAL_URL is read at build time by next.config.mjs rewrites — set it
# to your backend's public URL (e.g. https://mummaxpress-api.onrender.com).
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Cap heap for Render build VMs (8192 in package.json often OOMs on Starter).
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Do not set PORT here — Render assigns it at runtime (e.g. 10000).
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
