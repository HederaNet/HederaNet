# HederaNet API Reference

Base URL: `http://localhost:4000` (dev) / `https://api.hederanet.online` (prod)

## Authentication

All authenticated endpoints require: `Authorization: Bearer <jwt>`

Obtain a JWT via `POST /auth/signup`, `POST /auth/signin`, or `POST /auth/google`.

---

## Health

```
GET /health → { status, network, timestamp }
```

---

## Auth

```
POST /auth/signup   { email, password, name }
                    → { token, user }
                    Auto-provisions a Hedera testnet account for the new user.

POST /auth/signin   { email, password }
                    → { token, user }

POST /auth/google   { accessToken }          // Google OAuth implicit-flow access token
                    → { token, user }         // Creates account on first sign-in

GET  /auth/me       [auth]
                    → { user }

PATCH /auth/me      [auth] { name?, email?, avatarUrl?, currentPassword?, newPassword? }
                    → { user }
                    avatarUrl must be a base64 data URL (data:image/...) ≤ 300 KB.
                    Password change requires currentPassword.
```

---

## Network

```
GET /network/stats    → NetworkStats (cached 60s)
```

---

## Hotspots

```
GET  /hotspots        ?lat=&lng=&radiusKm=&minUptime=&maxPriceHbar=&tier=&page=&limit=
GET  /hotspots/:id    → Hotspot + activeSubscriptions count
POST /hotspots        [operator] { lat, lng, coverageRadiusMeters, monthlyPriceHbar }
PUT  /hotspots/:id    [operator] { isActive?, monthlyPriceHbar?, coverageRadiusMeters? }
```

---

## Operators

```
GET  /operators              ?page=&limit=  → PaginatedResponse<Operator>
GET  /operators/:id          → Operator + hotspots + solarInstallations + counts

POST /operators/register     [auth] { country, city, lat, lng }
                             → Operator (also upgrades user role to OPERATOR)

POST /operators/stake        [operator] { amount }   // amount in HBAR
                             → updated Operator with new stakedHbar

POST /operators/unstake      [operator] { amount }
                             → updated Operator; errors if amount > stakedHbar

GET  /operators/:accountId/earnings  [auth]
                             → { earnings: Transaction[], totalHbar }
                             Only accessible by the account owner or ADMIN.

GET  /operators/:accountId/hotspots  [auth]
                             → Hotspot[]
                             Only accessible by the account owner or ADMIN.
```

**Tier thresholds (app-level):**
| Tier | Minimum staked HBAR |
|------|---------------------|
| BRONZE | 0 ℏ |
| SILVER | 100 ℏ |
| GOLD | 500 ℏ |

---

## Subscriptions

```
POST   /subscriptions     [auth] { hotspotId, durationDays?, txHashHedera? }
GET    /subscriptions/:id [auth] → Subscription
DELETE /subscriptions/:id [auth]
```

---

## Energy

```
GET  /energy/listings            ?lat=&lng=&page=&limit=
                                 → EnergyListing[] with installation + operator info

POST /energy/solar-installation  [operator] { capacityKw, lat, lng }
                                 → SolarInstallation
                                 Must register a solar installation before creating a listing.

POST /energy/listings            [operator] { installationId, pricePerKwhHbar, availableUnits }
                                 → EnergyListing

PUT  /energy/listings/:id        [operator] { isActive?, pricePerKwhHbar?, availableUnits? }

POST /energy/trade               [auth] { listingId, units, txHashHedera? }
                                 → EnergyTrade
```

---

## Governance

```
GET  /governance/proposals        ?status=ACTIVE|PENDING|PASSED|REJECTED|EXECUTED&page=&limit=
GET  /governance/proposals/:id    → Proposal + vote counts
POST /governance/proposals        [auth] { title (≥10), description (≥50), votingPeriodDays (3–30) }
POST /governance/vote             [auth] { proposalId, choice: YES|NO|ABSTAIN, txHashHedera? }
```

---

## Token Market

All prices are stored in USDC. Swaps settle on-chain when `USDC_TOKEN_ID` is configured.

```
GET  /market/tokens               → MarketToken[] with current prices
     Response: [{ symbol, name, tokenId, decimals, priceUsdc, logoEmoji }, ...]

GET  /market/portfolio            [auth]
     → { portfolio: [{ symbol, name, balance, priceUsdc, valueUsdc }], totalUsdc }
     Balances are fetched live from Hedera mirror node.

GET  /market/faucet/eligibility   [auth]
     → { eligible: bool, nextClaimAt: ISO8601|null, amountUsdc: 100 }

POST /market/faucet               [auth]
     → { amountUsdc, hederaTxId: string|null, simulated: bool }
     Rate limited: 100 USDC per 24 hours per account.
     On-chain transfer attempted when USDC_TOKEN_ID is set; falls back to simulation.

POST /market/swap                 [auth] { fromSymbol, toSymbol, fromAmount }
     → { id, fromSymbol, toSymbol, fromAmount, toAmount, status, hederaTxId, simulated }
     toAmount = fromAmount * fromToken.priceUsdc / toToken.priceUsdc
     Supported pairs: any token ��� any token (HBAR, HNET, HEC, HCC, USDC)

GET  /market/swaps                [auth] ?limit=20
     → SwapTransaction[]

PATCH /market/tokens/:symbol      [admin] { priceUsdc }
     Updates the exchange rate for a token. Admin role required.
```

**Default token prices (admin-updatable):**
| Symbol | Name | Price (USDC) | Token ID |
|--------|------|-------------|----------|
| USDC | USD Coin | $1.000000 | set via USDC_TOKEN_ID env |
| HBAR | HBAR | $0.070000 | — (native) |
| HNET | HederaNet Token | $0.010000 | 0.0.7153593 |
| HEC | Hedera Energy Credits | $0.002000 | 0.0.7153605 |
| HCC | Hedera Compute Credits | $0.000100 | 0.0.7153651 |

---

## Transactions

```
GET /transactions/:accountId  [auth] ?page=&limit=
    → { data: Transaction[], pagination }
    Returns all transactions (incoming and outgoing) for the account.
    Only accessible by the account owner or ADMIN.
```

**Transaction types:** `SUBSCRIPTION`, `ENERGY_TRADE`, `STAKE`, `UNSTAKE`, `REWARD`, `WITHDRAWAL`, `GOVERNANCE`, `SWAP`, `FAUCET`

---

## Metrics

```
GET /metrics → Prometheus text format (scrape endpoint)
```

---

## WebSocket Events

Connect: `ws://localhost:4000` with query `?accountId=0.0.xxx`

```javascript
// Subscribe to channels
socket.emit('subscribe:hotspot', hotspotId)
socket.emit('subscribe:trade', tradeId)

// Listen to events
socket.on('uptime_ping',         { hotspotId, uptimePct, isOnline, timestamp })
socket.on('payment_received',    { amountHbar, from, txHash, type })
socket.on('trade_status_update', { tradeId, status, txHash? })
socket.on('network:stats',       NetworkStats)  // every 60s
```

---

## Error Format

All errors return:
```json
{ "success": false, "error": "Human-readable message" }
```

Common HTTP codes:
- `400` — validation error or business logic rejection
- `401` — missing or invalid JWT
- `403` — insufficient role (e.g., operator-only endpoint)
- `404` — resource not found
- `409` — conflict (e.g., duplicate account)
- `429` — rate limit exceeded (general: 100/min; auth: 10/min; faucet: 1 claim/24h)
- `500` — internal server error
