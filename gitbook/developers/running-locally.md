# Running Locally

This guide walks you through getting HederaNet running on your local machine for development and testing.

---

## Prerequisites

Before starting, ensure you have:

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | 9+ | `npm install -g pnpm@9` |
| **Docker Desktop** | Latest | [docker.com](https://docker.com) |
| **Git** | Any recent version | System package manager |
| **Hedera testnet account** | — | [portal.hedera.com](https://portal.hedera.com) |

### Getting a Free Hedera Testnet Account

1. Visit [https://portal.hedera.com](https://portal.hedera.com).
2. Sign up and create a testnet account.
3. Note your **Account ID** (e.g., `0.0.1234567`) and **DER-encoded private key**.
4. You receive free testnet HBAR automatically — enough for all development operations.

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/hederanet/hederanet.git
cd hederanet
```

---

## Step 2: Install Dependencies

```bash
pnpm install
```

This installs all dependencies for every app and package in the monorepo. It may take 1–2 minutes on first run.

---

## Step 3: Configure the API Environment

```bash
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and fill in the required values:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hederanet"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT secrets (generate with: openssl rand -hex 64)
JWT_ACCESS_SECRET="your_long_random_string_here"
JWT_REFRESH_SECRET="your_different_long_random_string_here"

# Encryption key for Hedera private keys (32 bytes hex)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="your_32_byte_hex_key_here"

# Hedera operator account (your testnet account)
HEDERA_OPERATOR_ID="0.0.1234567"
HEDERA_OPERATOR_KEY="302e020100300506032b657004220420..."
HEDERA_NETWORK="testnet"

# HederaNet token IDs (deployed on testnet)
HNET_TOKEN_ID="0.0.7153593"
HEC_TOKEN_ID="0.0.7153605"
HCC_TOKEN_ID="0.0.7153651"
USDC_TOKEN_ID="0.0.9038720"
REPUTATION_NFT_TOKEN_ID="0.0.7153666"

# Smart contract addresses
ENERGY_MARKET_CONTRACT_ID="0.0.7153712"
SERVICE_PAYMENT_CONTRACT_ID="0.0.7153764"
GOVERNANCE_CONTRACT_ID="0.0.7153782"

# Optional: Google OAuth (for Google sign-in)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Optional: Africa's Talking (for USSD)
AT_API_KEY="your_africastalking_api_key"
AT_USERNAME="your_africastalking_username"

# Optional: Flutterwave (for mobile money)
FLUTTERWAVE_SECRET_KEY="FLWSECK-..."
```

> ⚠️ **Warning:** If you do not fill in real values for `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY`, the API will log warnings and Hedera operations will fail or enter simulation mode. The platform will still run — most UI features work with mocked responses.

---

## Step 4: Start Infrastructure Services

```bash
docker-compose up -d postgres redis
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379

Both use Docker volumes for data persistence. On first run, Docker will pull the images (may take a minute).

Verify they are running:

```bash
docker-compose ps
```

Both services should show `Up` status.

---

## Step 5: Run Database Migrations

```bash
pnpm --filter @hederanet/api db:migrate
```

This runs all Prisma migrations to set up the database schema. On a fresh database, this creates all 15 tables.

---

## Step 6: Start All Applications

```bash
pnpm dev
```

This command:
1. Builds all packages in the correct dependency order.
2. Starts the API server in watch mode.
3. Starts the Next.js web app in development mode.
4. Starts the USSD service (if configured).

Wait for the output to show:

```
[api] Server running on http://localhost:4000
[web] ready - started server on http://localhost:3000
```

---

## Verifying Your Setup

| URL | Expected Response |
|-----|------------------|
| `http://localhost:3000` | HederaNet web app home page |
| `http://localhost:4000/health` | `{"status":"ok","environment":"testnet"}` |
| `http://localhost:4000/api/network/stats` | Network statistics JSON |

---

## Optional: Deploy USDC Token for Full Market Testing

To enable on-chain token market swaps (rather than simulation mode), deploy the USDC test token:

```bash
pnpm --filter @hederanet/api deploy:usdc
```

This deploys a USDC HTS token using your operator account and prints the new token ID. Update `USDC_TOKEN_ID` in your `.env` file with the new ID and restart the API.

---

## Useful Commands

```bash
# Type-check all packages
pnpm typecheck

# Run linter across all packages
pnpm lint

# Run all tests
pnpm test

# Open Prisma Studio (database GUI)
pnpm --filter @hederanet/api db:studio

# Apply new migrations after schema changes
pnpm --filter @hederanet/api db:migrate

# Generate Prisma client after schema changes
pnpm --filter @hederanet/api db:generate

# Build all packages for production
pnpm build
```

---

## Common Issues and Fixes

### "Cannot connect to database"

Ensure Docker Desktop is running and the postgres container is up:

```bash
docker-compose ps
docker-compose up -d postgres
```

### "HEDERA_OPERATOR_ID not set" warning

The API will log this warning but continue running in degraded mode. Most UI flows work without it. To fix, add your Hedera testnet credentials to `.env`.

### Redis connection refused

```bash
docker-compose up -d redis
```

If Redis is running but still failing, check the `REDIS_URL` in your `.env` matches the Docker container's port.

### pnpm workspace package not found

If a package import fails, ensure you ran `pnpm install` from the repo root (not a subdirectory):

```bash
cd /path/to/hederanet
pnpm install
```

### Next.js hydration errors

If the web app shows hydration mismatches, clear the Next.js cache:

```bash
rm -rf apps/web/.next
pnpm --filter @hederanet/web dev
```

### Port already in use

If port 3000 or 4000 is taken by another process:

```bash
# Find and kill the process using port 4000
lsof -ti:4000 | xargs kill -9
```
