# API Reference

All HederaNet platform features are accessible via the REST API. This reference documents every endpoint, authentication requirements, and request/response shapes.

---

## Base URLs

| Environment | Base URL |
|-------------|---------|
| Development | `http://localhost:4000` |
| Production | `https://api.hederanet.online` |

---

## Authentication

Most endpoints require a JWT Bearer token obtained from the auth endpoints.

```
Authorization: Bearer <access_token>
```

Tokens expire after 15 minutes. Use the refresh endpoint to obtain a new access token.

---

## Error Format

All errors return the following JSON shape:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "statusCode": 400
}
```

Common error codes: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, `INSUFFICIENT_BALANCE`, `RATE_LIMITED`.

---

## Auth Endpoints

### POST /api/auth/signup

Create a new user account.

**Auth required:** No

**Request body:**
```json
{
  "name": "Tomiwa Adeyemi",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "name": "Tomiwa Adeyemi",
    "email": "user@example.com",
    "role": "SUBSCRIBER",
    "kycStatus": "PENDING",
    "hederaAccountId": "0.0.1234567"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### POST /api/auth/signin

Sign in with email and password.

**Auth required:** No

**Request body:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response:** Same shape as signup.

---

### POST /api/auth/google

Sign in or sign up with Google OAuth.

**Auth required:** No

**Request body:**
```json
{ "idToken": "google_id_token_from_frontend" }
```

**Response:** Same shape as signup.

---

### GET /api/auth/me

Get the current authenticated user's profile.

**Auth required:** Yes

**Response:**
```json
{
  "id": "clx...",
  "name": "Tomiwa Adeyemi",
  "email": "user@example.com",
  "role": "OPERATOR",
  "kycStatus": "APPROVED",
  "hederaAccountId": "0.0.1234567",
  "publicKey": "302a300506...",
  "operator": { "id": "op_...", "country": "Nigeria", "city": "Lagos" }
}
```

---

### POST /api/auth/refresh

Refresh an expired access token.

**Auth required:** No (uses refresh token in request body or cookie)

**Request body:**
```json
{ "refreshToken": "eyJ..." }
```

**Response:**
```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```

---

## Network Endpoints

### GET /api/network/stats

Get live network statistics shown on the Overview dashboard.

**Auth required:** No

**Response:**
```json
{
  "activeHotspots": 142,
  "earningsToday": "1243.50",
  "networkNodes": 189,
  "energyTraded": "4521.00"
}
```

---

## Hotspot Endpoints

### GET /api/hotspots

List all hotspots (network-wide or filtered by operator).

**Auth required:** Yes

**Query parameters:**
- `operatorId` — Filter by operator ID
- `active` — `true` or `false`

**Response:**
```json
{
  "hotspots": [
    {
      "id": "hs_...",
      "nodeId": "A3F9C2",
      "latitude": 6.5244,
      "longitude": 3.3792,
      "coverageRadius": 500,
      "monthlyPriceHbar": "5.00",
      "isActive": true,
      "hcsTopicId": "0.0.1234567",
      "createdAt": "2026-01-15T10:00:00Z",
      "operator": { "city": "Lagos", "tier": "GOLD" }
    }
  ]
}
```

---

### POST /api/hotspots

Deploy a new hotspot.

**Auth required:** Yes (OPERATOR role)

**Request body:**
```json
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "coverageRadius": 500,
  "monthlyPriceHbar": "5.00"
}
```

**Response:** Created hotspot object.

---

### PATCH /api/hotspots/:id

Toggle hotspot active/inactive status.

**Auth required:** Yes (OPERATOR, must own hotspot)

**Request body:**
```json
{ "isActive": false }
```

---

## Operator Endpoints

### POST /api/operators/register

Register as an operator.

**Auth required:** Yes (SUBSCRIBER role)

**Request body:**
```json
{
  "country": "Nigeria",
  "city": "Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

---

### POST /api/operators/stake

Stake HBAR to advance operator tier.

**Auth required:** Yes (OPERATOR role)

**Request body:**
```json
{ "amountHbar": "100" }
```

**Response:**
```json
{
  "success": true,
  "newTier": "SILVER",
  "totalStaked": "100.00",
  "transaction": { "id": "txn_...", "type": "STAKE", "amount": "100.00" }
}
```

---

### POST /api/operators/unstake

Unstake HBAR.

**Auth required:** Yes (OPERATOR role)

**Request body:**
```json
{ "amountHbar": "50" }
```

---

### GET /api/operators/:id/earnings

Get operator earnings summary and chart data.

**Auth required:** Yes (must be the operator or ADMIN)

**Response:**
```json
{
  "totalEarned": "1243.50",
  "totalEarnedUsd": "87.05",
  "transactionCount": 47,
  "averagePerTransaction": "26.46",
  "chartData": [
    { "date": "2026-05-16", "amount": "45.00" },
    { "date": "2026-05-17", "amount": "62.00" }
  ]
}
```

---

## Energy Endpoints

### GET /api/energy/listings

List all available energy listings.

**Auth required:** Yes

**Response:**
```json
{
  "listings": [
    {
      "id": "el_...",
      "pricePerKwhHbar": "0.05",
      "availableUnits": 100,
      "solarInstallation": {
        "capacityKw": 5,
        "latitude": 6.5244,
        "longitude": 3.3792,
        "city": "Lagos"
      },
      "operator": { "tier": "GOLD", "city": "Lagos" }
    }
  ]
}
```

---

### POST /api/energy/solar-installation

Register a solar installation.

**Auth required:** Yes (OPERATOR role)

**Request body:**
```json
{
  "capacityKw": 5,
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

---

### POST /api/energy/listings

Create an energy listing.

**Auth required:** Yes (OPERATOR role)

**Request body:**
```json
{
  "solarInstallationId": "si_...",
  "pricePerKwhHbar": "0.05",
  "availableUnits": 100
}
```

---

### POST /api/energy/buy

Purchase kWh from a listing.

**Auth required:** Yes

**Request body:**
```json
{
  "listingId": "el_...",
  "amountKwh": 20
}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "et_...",
    "amountKwh": 20,
    "totalCostHbar": "1.00",
    "status": "COMPLETED"
  }
}
```

---

## Subscription Endpoints

### POST /api/subscriptions

Subscribe to a hotspot.

**Auth required:** Yes

**Request body:**
```json
{ "hotspotId": "hs_..." }
```

---

### GET /api/subscriptions/active

Get the current user's active subscriptions.

**Auth required:** Yes

---

## Governance Endpoints

### GET /api/governance/proposals

List proposals with optional status filter.

**Auth required:** Yes

**Query parameters:** `status` — `PENDING`, `ACTIVE`, `PASSED`, `REJECTED`

---

### POST /api/governance/proposals

Create a governance proposal.

**Auth required:** Yes

**Request body:**
```json
{
  "title": "Reduce Silver tier to 75 HBAR",
  "description": "Full description at least 50 chars...",
  "votingPeriodDays": 7
}
```

---

### POST /api/governance/proposals/:id/vote

Cast a vote on a proposal.

**Auth required:** Yes

**Request body:**
```json
{ "vote": "YES" }
```

Valid values: `YES`, `NO`, `ABSTAIN`

---

## Market Endpoints

### GET /api/market/prices

Get current token prices.

**Auth required:** Yes

**Response:**
```json
{
  "prices": {
    "HBAR": { "usd": 0.07 },
    "HNET": { "usd": 0.01 },
    "HEC":  { "usd": 0.002 },
    "HCC":  { "usd": 0.0001 },
    "USDC": { "usd": 1.00 }
  }
}
```

---

### GET /api/market/portfolio

Get the current user's full portfolio.

**Auth required:** Yes

**Response:**
```json
{
  "totalValueUsd": "87.50",
  "balances": {
    "HBAR": { "balance": "250.00", "valueUsd": "17.50" },
    "HNET": { "balance": "1500.00", "valueUsd": "15.00" },
    "HEC":  { "balance": "2000.00", "valueUsd": "4.00" },
    "HCC":  { "balance": "10000.00", "valueUsd": "1.00" },
    "USDC": { "balance": "50.00", "valueUsd": "50.00" }
  }
}
```

---

### POST /api/market/swap

Execute a token swap.

**Auth required:** Yes

**Request body:**
```json
{
  "fromToken": "HNET",
  "toToken": "USDC",
  "fromAmount": "100"
}
```

**Response:**
```json
{
  "success": true,
  "swap": {
    "fromToken": "HNET",
    "fromAmount": "100",
    "toToken": "USDC",
    "toAmount": "1.00",
    "rate": "0.01",
    "status": "SUCCESS"
  }
}
```

---

### POST /api/market/faucet

Claim USDC from the testnet faucet.

**Auth required:** Yes

**Request body:** None

**Response:**
```json
{
  "success": true,
  "amount": "100",
  "nextClaimAt": "2026-05-24T12:00:00Z",
  "onChain": true
}
```

**Error (rate limited):**
```json
{
  "error": "Faucet claimed recently. Try again in 23h 45m.",
  "nextClaimAt": "2026-05-24T12:00:00Z"
}
```

---

### GET /api/market/swaps

Get the current user's swap history.

**Auth required:** Yes

---

### GET /api/market/faucet/status

Check faucet availability for the current user.

**Auth required:** Yes

**Response:**
```json
{
  "canClaim": false,
  "nextClaimAt": "2026-05-24T12:00:00Z",
  "secondsRemaining": 85500
}
```

---

## Transaction Endpoints

### GET /api/transactions

Get the current user's transaction history.

**Auth required:** Yes

**Query parameters:**
- `type` — Filter by transaction type (SUBSCRIPTION, ENERGY_TRADE, STAKE, etc.)
- `limit` — Number of records (default 20, max 100)
- `offset` — Pagination offset

---

## Metrics Endpoints

### GET /health

API health check.

**Auth required:** No

**Response:**
```json
{
  "status": "ok",
  "environment": "testnet",
  "database": "connected",
  "hedera": "connected",
  "timestamp": "2026-05-23T10:00:00Z"
}
```

---

## WebSocket Events

Connect to the Socket.io server at the base URL. After connection, authenticate:

```javascript
socket.emit('authenticate', { token: accessToken });
```

### Events Emitted by Server

| Event | Payload | When |
|-------|---------|------|
| `transaction:new` | Transaction object | New transaction recorded |
| `hotspot:status` | `{ hotspotId, isActive }` | Hotspot toggled |
| `governance:vote` | `{ proposalId, totals }` | New vote cast |
| `energy:trade` | Trade object | Energy purchase completed |
| `balance:update` | `{ hbar: "..." }` | HBAR balance changed |
