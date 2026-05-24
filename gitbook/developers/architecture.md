# Architecture

HederaNet is a monorepo containing multiple applications, shared packages, and service workers. This page describes the overall system design, tech stack, and key architectural decisions.

---

## Repository Structure

```
hederanet/
├── apps/
│   ├── api/          # Express.js REST API + WebSocket server
│   ├── web/          # Next.js 14 web application
│   ├── mobile/       # React Native mobile app
├── packages/
│   ├── types/        # Shared TypeScript types and Zod schemas
│   ├── hedera/       # Hedera SDK wrapper utilities
│   ├── ui/           # Shared React component library
├── services/
│   └── ussd/         # Africa's Talking USSD handler service
└── docs/
    └── gitbook/      # This documentation
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Web application |
| **Mobile** | React Native / Expo | iOS and Android app |
| **API** | Express.js (TypeScript) | REST API and WebSocket server |
| **ORM** | Prisma | Database schema and queries |
| **Database** | PostgreSQL | Primary data store |
| **Cache / Queue** | Redis + BullMQ | Session cache, job queues |
| **Real-time** | Socket.io | WebSocket events to frontend |
| **Data fetching** | React Query (TanStack Query) | Client-side data fetching and caching |
| **Blockchain** | Hedera JavaScript SDK | Hedera network operations |
| **USSD** | Africa's Talking SDK | USSD gateway integration |
| **Payments** | Flutterwave SDK | Mobile money disbursements |
| **Auth** | JWT (access + refresh tokens) | Session management |

---

## System Layers

```
┌─────────────────────────────────────────────┐
│           Hedera Hashgraph Network           │
│  HCS │ HTS │ HSCS │ Mirror Node API         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              HederaNet API                   │
│  Express.js + Prisma + Hedera SDK            │
│  BullMQ workers for async Hedera ops         │
│  Socket.io for real-time push                │
└────────┬─────────────────┬───────────────────┘
         │                 │
┌───────���▼──────┐  ┌───────▼────────┐  ┌──────────────┐
│  Next.js Web  │  │  React Native  │  │  USSD Service │
│  (Vercel)     │  │  Mobile App    │  │  (Africa's    │
│               │  │                │  │   Talking)    │
└───────────────┘  └────────────────┘  └──────────────┘
```

---

## Key Design Decisions

### Custodial Key Model (Testnet)

On testnet, the platform manages Hedera private keys on behalf of users. Keys are encrypted using **AES-256-GCM** before storage in PostgreSQL. When a user triggers an on-chain operation, the API:

1. Retrieves the encrypted private key from the database.
2. Decrypts it in memory using the server-side encryption key.
3. Signs and submits the transaction to Hedera.
4. Clears the decrypted key from memory.

The decrypted key never leaves the API server process and is never stored unencrypted. On mainnet, users will hold their own keys via non-custodial wallets.

### React Query for All Data Fetching

The web app uses React Query (TanStack Query) for every data fetch — no useEffect data fetching, no manual loading states. This provides:
- Automatic background refetching
- Optimistic updates on mutations
- Cache invalidation on related queries
- Consistent loading/error states across the app

### Portal Modals

All modal dialogs (energy buy, hotspot deploy, unstake, governance vote) render through React portals to `document.body`. This escapes CSS stacking contexts created by positioned parent elements, preventing z-index issues that commonly break modals in complex dashboard layouts.

### ESM Throughout

The entire monorepo uses ES Modules (`"type": "module"` in package.json). This ensures consistent module resolution across the API, web app, and shared packages. Prisma and some native modules required specific ESM compatibility configuration.

### Hedera Operations with Retry/Backoff

All Hedera SDK operations (transactions and queries) are wrapped with an exponential backoff retry mechanism. Transient Hedera network errors (gRPC timeouts, BUSY status) are automatically retried up to 3 times before surfacing an error to the user.

---

## Database Schema Overview

The PostgreSQL database has approximately 15 primary tables:

| Table | Purpose |
|-------|---------|
| `User` | Accounts, roles, KYC status, encrypted keys |
| `Operator` | Operator profiles with location data |
| `Hotspot` | Deployed hotspots with HCS topic IDs |
| `Subscription` | Active subscriber-to-hotspot relationships |
| `SolarInstallation` | Registered solar panels |
| `EnergyListing` | Active energy market listings |
| `EnergyTrade` | Completed energy purchases |
| `Staking` | Operator staking records and tiers |
| `Proposal` | Governance proposals |
| `Vote` | Individual governance votes |
| `Transaction` | Unified transaction history log |
| `MarketPrice` | Token prices used by the market |
| `SwapRecord` | Token swap history |
| `FaucetClaim` | USDC faucet claim tracking (rate limiting) |
| `ReputationNFT` | NFT metadata records |

---

## Authentication Flow

```
User submits email/password (or Google OAuth token)
        │
        ▼
API validates credentials
        │
        ▼
JWT access token (15min) + refresh token (7d) issued
        │
        ▼
Frontend stores tokens in memory (access) and
httpOnly cookie (refresh)
        │
        ▼
All API requests include:
  Authorization: Bearer <access_token>
        │
        ▼
apiClient interceptor automatically refreshes
access token using refresh token before expiry
```

---

## API URLs

| Environment | Web App | API |
|-------------|---------|-----|
| Development | `http://localhost:3000` | `http://localhost:4000` |
| Production | `https://hederanet.vercel.app` | `https://api.hederanet.online` |

---

## Background Jobs (BullMQ)

Asynchronous Hedera operations run as BullMQ jobs in Redis:

| Queue | Jobs |
|-------|------|
| `hedera-ops` | Transaction submission, HCS message publishing |
| `oracle-confirmations` | IoT energy delivery confirmations |
| `reward-distribution` | Periodic tier reward calculations |
| `sync` | Mirror node balance sync |
