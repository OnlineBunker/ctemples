# syntax=docker/dockerfile:1

# ─────────────────────────────── deps ───────────────────────────────
# Install production + build dependencies against the lockfile.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ────────────────────────────── builder ─────────────────────────────
# Build the app. next/font downloads + self-hosts fonts at this step
# (Docker build has network access), and output:"standalone" traces a
# minimal server bundle into .next/standalone.
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ────────────────────────────── runner ──────────────────────────────
# Slim runtime image: only the standalone server, static assets, and public/.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js is emitted by Next's standalone output.
CMD ["node", "server.js"]
