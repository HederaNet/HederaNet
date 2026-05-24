# Multi-stage build for apps/api
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/hedera-sdk/package.json ./packages/hedera-sdk/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --filter @hederanet/api...

# Build packages
FROM deps AS build
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN pnpm --filter @hederanet/types build
RUN pnpm --filter @hederanet/config build
RUN pnpm --filter @hederanet/hedera-sdk build
RUN pnpm --filter @hederanet/api build

# Production image
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 hederanet
WORKDIR /app

COPY --from=build --chown=hederanet:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=hederanet:nodejs /app/apps/api/prisma ./prisma
COPY --from=build --chown=hederanet:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=hederanet:nodejs /app/apps/api/package.json ./

ENV NODE_ENV=production
USER hederanet
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
