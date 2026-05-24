FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/hedera-sdk/package.json ./packages/hedera-sdk/
COPY services/ussd/package.json ./services/ussd/
RUN pnpm install --frozen-lockfile --filter @hederanet/ussd...

FROM deps AS build
COPY packages/ ./packages/
COPY services/ussd/ ./services/ussd/
RUN pnpm --filter @hederanet/types build
RUN pnpm --filter @hederanet/config build
RUN pnpm --filter @hederanet/hedera-sdk build
RUN pnpm --filter @hederanet/ussd build

FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 hederanet
WORKDIR /app

COPY --from=build --chown=hederanet:nodejs /app/services/ussd/dist ./dist
COPY --from=build --chown=hederanet:nodejs /app/services/ussd/node_modules ./node_modules
COPY --from=build --chown=hederanet:nodejs /app/services/ussd/package.json ./

ENV NODE_ENV=production
USER hederanet
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
