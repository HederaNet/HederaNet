# Swap Overview

The HederaNet **Swap** page is a built-in token exchange that lets you swap between all five HederaNet assets. It is accessible to all signed-in users from the **Swap** link in the top navigation bar at `/dashboard/market`.

---

## What the Swap Does

The Swap serves two key purposes:

1. **Price discovery** — It establishes a real, market-determined USD price for every HederaNet asset. For HNET, HEC, and HCC, prices are derived from on-chain AMM pool reserves (see AMM Pricing below). For HBAR, the price is fetched live from CoinGecko every 5 minutes.

2. **Liquidity** — Operators who earn HEC (energy credits) or HCC (compute credits) through platform activity can convert those tokens to USDC or HBAR for real-world spending.

---

## Why This Matters for Different Users

### For Operators
- Realize the value of HEC and HCC earned from energy generation.
- Swap USDC → HNET to build governance voting weight.
- Swap USDC → HBAR to top up your staking balance.

### For Subscribers
- Claim testnet USDC from the faucet, then swap USDC → HBAR to pay for subscriptions and energy.
- Track the relative value of your token holdings in one place.

### For Governance Participants
- Accumulate HNET (swap USDC → HNET) to build voting influence.
- Monitor the HNET price, which now moves with real trading activity.

---

## The Five Tradeable Assets

| Token | Symbol | Testnet Token ID | Price Source | What It Represents |
|-------|--------|-----------------|-------------|-------------------|
| Hedera HBAR | ℏ | Native | CoinGecko (live) | Network currency, payments, staking |
| HederaNet Token | HNET | 0.0.7153593 | AMM pool reserves | Governance and staking token |
| Energy Credits | HEC | 0.0.7153605 | AMM pool reserves | 1 kWh of verified solar energy |
| Compute Credits | HCC | 0.0.7153651 | AMM pool reserves | Compute contribution credits |
| USD Coin | USDC | 0.0.9038720 | Fixed $1.00 | USD-pegged testnet stablecoin |

---

## AMM Pricing

HNET, HEC, and HCC use a **constant-product automated market maker (AMM)** — the same mathematical model used by Uniswap v2 — to determine prices and calculate swap output amounts.

### How It Works

Each pool token (HNET, HEC, HCC) is paired with USDC in a liquidity pool. The pool holds two reserves:

- `poolReserveToken` — the amount of HNET/HEC/HCC in the pool
- `poolReserveUsdc` — the amount of USDC in the pool

The **invariant** is: `poolReserveToken × poolReserveUsdc = k` (constant)

The **spot price** of any pool token is derived as:

```
price (USDC per token) = poolReserveUsdc / poolReserveToken
```

### Swap Output Formula

When you swap an amount `amountIn` of one token for another:

```
amountOut = (amountIn × (1 − fee) × reserveOut)
            ÷ (reserveIn + amountIn × (1 − fee))
```

The fee is **0.3%** (30 basis points), matching the Uniswap v2 standard.

### What This Means in Practice

- Prices move with every trade — if you buy HNET, the HNET price goes up slightly.
- Large swaps relative to pool size cause **price impact** (slippage). The preview always shows you the exact output before you confirm.
- Pool reserves are updated on-chain after every successful swap and reflected immediately in the spot price.

### Initial Pool Reserves (Testnet)

| Token | Initial Token Reserve | Initial USDC Reserve | Implied Price |
|-------|-----------------------|----------------------|---------------|
| HNET | 1,000,000 HNET | 10,000 USDC | $0.01 |
| HEC | 500,000 HEC | 1,000 USDC | $0.002 |
| HCC | 10,000,000 HCC | 1,000 USDC | $0.0001 |

These prices will drift over time as the testnet community trades. The Explorer page always shows the current live price.

---

## HBAR Price

HBAR price is fetched live from the [CoinGecko public API](https://www.coingecko.com/) every 5 minutes and cached in the database. The USD value shown for HBAR-denominated amounts reflects the current market price — not a fixed placeholder.

---

## On-Chain Settlement

All swaps are settled as real Hedera Token Service (HTS) transactions — no simulation. Each swap is executed as a **single atomic transaction** on Hedera:

- **USDC ↔ HBAR swaps**: A single `TransferTransaction` moves USDC from the user and HBAR from the treasury (or vice versa) simultaneously. If either leg fails, the entire transaction reverts and the user keeps their funds.
- **HNET/HEC/HCC ↔ USDC swaps**: A single `TransferTransaction` moves both tokens atomically. The treasury mints the output tokens before the transaction executes.

This eliminates the previous risk of a two-step swap where the first leg could succeed while the second failed, leaving the user without either token.

---

## Testnet vs Mainnet

| Aspect | Testnet | Mainnet |
|--------|---------|---------|
| USDC | Deployed by HederaNet treasury (0.0.9038720) | Circle's official Hedera USDC |
| USDC value | Zero real value — claim free from faucet | Real USD, 1:1 backed |
| HBAR price | Live from CoinGecko (real market price) | Same |
| AMM pools | Seeded by treasury on testnet | Seeded by community liquidity providers |
| Faucet | Available (100 USDC / 24 h) | Removed |

No platform code changes are required for the USDC switch — it is a single configuration variable (`USDC_TOKEN_ID`).

---

## What You Can Do on the Swap Page

| Section | Purpose |
|---------|---------|
| **Price Ticker** | Current rates for all 5 tokens — HBAR from CoinGecko, others from AMM pools |
| **Portfolio Overview** | Total USD value, per-token balances from Hedera mirror node |
| **Swap Interface** | Exchange any token pair with live AMM-calculated output |
| **USDC Faucet** | Claim 100 free testnet USDC (once per 24 hours) |
| **Swap History** | Recent swaps with on-chain tx hash and status |

---

## Getting Started

1. Sign in to your HederaNet account.
2. Click **Swap** in the top navigation bar.
3. Claim USDC from the faucet if you have no starting balance.
4. Use the swap interface to exchange USDC for HBAR, HNET, HEC, or HCC.
5. Track your portfolio value in the overview section.

See [Swapping Tokens](swapping-tokens.md), [USDC Faucet](usdc-faucet.md), and [Your Portfolio](your-portfolio.md) for detailed guides on each section.
