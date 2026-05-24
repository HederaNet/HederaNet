# HederaNet Architecture

## System Overview

```
                        ┌──────────────────────────────────────┐
                        │           Hedera Hashgraph           │
                        │  HCS Topics  |  HTS Tokens  |  HSCS  │
                        └──────────────────────────────────────┘
                                          ▲
                        ┌─────────────────┼─────────────────┐
                        │                 │                 │
               ┌────────┴──────┐ ┌───────┴──────┐ ┌───────┴──────┐
               │  apps/api     │ │  apps/web    │ │  apps/mobile │
               │  (Express)    │ │  (Next.js)   │ │  (Expo RN)   │
               └───────────────┘ └──────────────┘ └──────────────┘
                        │
               ┌────────┴──────────┐
               │  services/ussd    │
               │  (Africa's Talk.) │
               └───────────────────┘
                        │
               ┌────────┴──────┐
               │  PostgreSQL   │
               │  Redis        │
               └───────────────┘
```

---

## Layer 1: Hedera Services

### HCS (Hedera Consensus Service)
- **Governance Topic (0.0.1006)**: Proposal creation and vote publication
- **Service Quality Topic (0.0.1005)**: Hotspot uptime reports from operators
- **Energy Trading Topic (0.0.1007)**: IoT delivery confirmations from oracle

### HTS (Hedera Token Service)
- **HNET (0.0.7153593)**: Governance and staking token — 1B supply, 8 decimals
- **HEC (0.0.7153605)**: Energy credit — 1 HEC = 1 kWh of verified solar energy, infinite supply
- **HCC (0.0.7153651)**: Compute credit — 6 decimals, infinite supply
- **Reputation NFT (0.0.7153666)**: Non-transferable (soulbound) operator reputation badges
- **USDC (testnet, env: USDC_TOKEN_ID)**: Platform stablecoin for the token market.  
  Deployed via `pnpm --filter @hederanet/api deploy:usdc`. On mainnet, replace with  
  Circle's official USDC token ID — no other code changes required.

### HSCS (Hedera Smart Contract Service)
- **EnergyMarket (0.0.7153712)**: P2P energy listings, purchases, dispute resolution
- **OperatorStaking (0.0.7153764)**: Tier system, rewards, slashing
- **HederaNetOracle (0.0.7153782)**: IoT confirmation 3-of-5 multi-sig
- **Governance**: On-chain proposal voting

---

## Layer 2: Backend API

**apps/api** is a Node.js/Express service that:
- Authenticates users via email/password or Google OAuth → JWT
- Auto-provisions Hedera testnet accounts for new users (custodial model for testnet)
- Provides REST endpoints backed by PostgreSQL (Prisma ORM)
- Streams real-time events via Socket.io
- Processes async jobs (Hedera tx retries, IoT data) via BullMQ
- Exposes Prometheus metrics at `/metrics`

### Custodial Key Model (testnet)
New user accounts are provisioned with a Hedera ECDSA key pair. The private key is stored
AES-256-GCM encrypted (key derived from JWT_SECRET) in the `User.hederaPrivateKey` column.
The API decrypts it server-side to sign token associations and market swap transactions on
the user's behalf. This custodial approach is intentional for testnet to lower the barrier
for UNICEF demo testing. On mainnet, migrate to a non-custodial wallet-signature model.

### DB Migrations
Located in `apps/api/prisma/migrations/`. Applied automatically at startup via `db-init.ts`
which runs `prisma migrate deploy`. All migrations are idempotent.

| Migration | Changes |
|-----------|---------|
| `20240101000000_init` | Full initial schema: 10 enums, 12 tables |
| `20240102000000_add_avatar_url` | `avatarUrl TEXT` on User |
| `20240104000000_add_market` | `MarketToken`, `SwapTransaction`, `FaucetClaim` tables; `SWAP`/`FAUCET` transaction types |

---

## Layer 3: Frontend Applications

### apps/web (Next.js 14 App Router)

Public routes (no auth):
- `/` — Landing page with live network stats
- `/map` — Full-screen Mapbox network visualization
- `/impact` — UNICEF demo page with public impact metrics
- `/explore` — Subscriber marketplace

Authenticated dashboard (`/dashboard/*`):
- `/dashboard` — Overview with live stats cards
- `/dashboard/hotspots` — Deploy and manage operator hotspots
- `/dashboard/energy` — Register solar installations, list and buy energy
- `/dashboard/governance` — Create proposals, vote YES/NO/ABSTAIN
- `/dashboard/earnings` — Earnings chart and full transaction history
- `/dashboard/staking` — Stake/unstake HBAR, view tier status
- `/dashboard/market` — Swap HNET/HEC/HCC/HBAR ↔ USDC, faucet, portfolio

Authentication uses email/password or Google OAuth. The dashboard layout (`DashboardLayout`)
handles auth guarding — any unauthenticated visit to `/dashboard/*` shows a sign-in prompt.

### apps/mobile (Expo SDK 51)
- Mirrors web functionality for iOS/Android
- Offline support via AsyncStorage
- Biometric authentication for transactions
- Push notifications for income events
- QR scanner for device pairing

### services/ussd
- Africa's Talking USSD webhook handler
- Redis session management (5min TTL)
- Supports feature phones with no smartphone required
- Multi-language: English, Yoruba, Hausa, Swahili

---

## Data Flow: Token Market Swap

```
1. User requests swap: POST /market/swap { fromSymbol: 'HNET', toSymbol: 'USDC', fromAmount: 100 }
2. API looks up prices → toAmount = 100 × $0.01 / $1.00 = 1.00 USDC
3. SwapTransaction created in DB with status PENDING
4. Server decrypts user's Hedera private key (custodial)
5. ensureTokenAssociated: user's account associated with destination token (if needed)
6. transferTokenFromUser: 100 HNET transferred user → treasury (user's key signs)
7. mintFungibleTokens: 1,000,000 USDC base units minted to treasury
8. transferToken: 1.00 USDC transferred treasury → user (operator key signs)
9. SwapTransaction updated to SUCCESS with hederaTxId
10. Transaction record written to global Transaction log
```

If the on-chain step fails, the swap falls back to simulation mode and status = FAILED for
the on-chain leg. DB always records the attempt.

## Data Flow: Energy Trade

```
1. Seller creates solar installation (POST /energy/solar-installation)
2. Seller creates listing (POST /energy/listings)
3. Listing published to HCS Energy Trading Topic
4. Buyer selects listing (Web/Mobile/USSD)
5. Buyer POST /energy/trade → EnergyTrade created, listing units decremented
6. IoT device delivers energy → sends reading to USSD/API
7. 3 oracle nodes confirm via HederaNetOracle.confirmReading
8. EnergyMarket.confirmDelivery called → trade finalized
9. HCS message published → trade confirmed on-chain
```

---

## Security

- All API endpoints: JWT authentication (HS256, JWT_SECRET ≥ 32 chars)
- Rate limiting: 100/min general, 10/min auth endpoints, 1 faucet claim/24h
- USSD: 10 sessions per phone number per hour
- Smart contracts: ReentrancyGuard, Pausable, multi-sig oracle
- User private keys: AES-256-GCM encrypted at rest (custodial testnet model only)
- Sensitive fields stripped from all API responses (`passwordHash`, `hederaPrivateKey`)
- Input validation: Zod schemas on all POST/PATCH bodies and query parameters
- CORS: restricted to `NEXT_PUBLIC_APP_URL`
- Helmet: standard HTTP security headers
- Google OAuth: access token verified via `https://www.googleapis.com/oauth2/v3/userinfo`
