# Production Deployment Checklist

## Pre-Deployment

- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript clean (`pnpm typecheck`)
- [ ] Smart contract audit complete
- [ ] Environment variables set in CI/CD secrets
- [ ] Database migrations reviewed
- [ ] USDC token deployed and `USDC_TOKEN_ID` set (see below)
- [ ] Sentry DSN configured

---

## USDC Token Setup (one-time per network)

The token market requires a USDC token to be deployed. Run once per environment:

```bash
# Deploy testnet USDC and mint 10M to treasury
pnpm --filter @hederanet/api deploy:usdc

# The command prints:
# USDC_TOKEN_ID=0.0.XXXXXXX
# Add this to your .env / secrets, then restart the server.
```

**Mainnet:** Do NOT run the deploy script on mainnet. Instead, set:
```env
USDC_TOKEN_ID=0.0.456858   # Circle's official USDC on Hedera mainnet
```
No other code changes are needed — the platform automatically uses this token for swaps and faucets.

---

## Infrastructure

```bash
# Build production images
docker build -t hederanet-api -f apps/api/Dockerfile .
docker build -t hederanet-ussd -f services/ussd/Dockerfile .

# Production compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Migrations run automatically on startup via db-init.ts
# Manual run if needed:
docker-compose exec api pnpm exec prisma migrate deploy
```

---

## Environment Secrets (production)

```env
# Hedera
HEDERA_NETWORK=mainnet
HEDERA_OPERATOR_ID=0.0.MAINNET_OPERATOR_ID
HEDERA_OPERATOR_PRIVATE_KEY=<production key — use HSM or secrets manager>

# Auth
JWT_SECRET=<32+ char secret — use secrets manager>

# Database / Cache
DATABASE_URL=<production postgres URL with SSL>
REDIS_URL=<production Redis URL with TLS>

# Token IDs
HNET_TOKEN_ID=<mainnet HNET token ID>
HEC_TOKEN_ID=<mainnet HEC token ID>
HCC_TOKEN_ID=<mainnet HCC token ID>
USDC_TOKEN_ID=0.0.456858    # Circle's official USDC on Hedera mainnet

# Optional
SENTRY_DSN=<Sentry DSN>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
```

---

## Web App (Vercel)

```bash
cd apps/web
vercel --prod

# Required env vars in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.hederanet.online
NEXT_PUBLIC_MAPBOX_TOKEN=<Mapbox public token>
```

---

## Mobile (EAS Build)

```bash
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## Monitoring

- Prometheus: http://your-server:9090
- Grafana: http://your-server:3001 (admin/hederanet default — **CHANGE THIS**)
- Key alerts:
  - Hotspot uptime < 95%
  - API error rate > 1%
  - BullMQ queue depth > 1000
  - Hedera tx failures > 5/min

---

## Market Module Admin

After deployment, update token prices via the admin API:
```bash
curl -X PATCH https://api.hederanet.online/market/tokens/HBAR \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"priceUsdc": 0.085}'
```

---

## Rollback

```bash
docker-compose pull hederanet-api:previous-sha
docker-compose up -d api
```
