# Multi-stage Dockerfile for Next.js production deployment
# Build on GitHub Actions, deploy to VPS

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables at build time
ARG DATABASE_URL
ARG GROQ_API_KEY
ARG NEXT_PUBLIC_BASE_URL

# Generate Prisma client and build Next.js
RUN corepack enable pnpm && \
    pnpm db:generate && \
    pnpm build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy standalone output and Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
