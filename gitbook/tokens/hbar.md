# HBAR

HBAR (symbol: ℏ) is the native cryptocurrency of the Hedera Hashgraph network. It is the primary payment currency for every service on HederaNet — internet subscriptions, energy purchases, staking, and transaction fees all denominated and settled in HBAR.

---

## What HBAR Is

HBAR is not a token created by HederaNet — it is the foundational currency of the entire Hedera network, issued and governed by the Hedera Governing Council (whose members include Google, IBM, Boeing, LG, Deutsche Telekom, and others). HederaNet chose HBAR as its payment currency because of Hedera's speed, low cost, and environmental credentials.

**Symbol:** ℏ (the symbol for the reduced Planck constant, reflecting Hedera's physics-inspired branding)

**Supply:** 50 billion HBAR total, with a fixed issuance schedule controlled by the Hedera Governing Council.

---

## Role in HederaNet

HBAR is the universal unit of account for all HederaNet services:

| Activity | HBAR Use |
|----------|---------|
| **Hotspot subscription** | Subscriber pays monthly price in ℏ to operator |
| **Energy purchase** | Buyer pays price/kWh in ℏ to energy operator |
| **Staking** | Operators lock ℏ to advance tiers (Bronze/Silver/Gold) |
| **Transaction fees** | Every Hedera operation costs a tiny ℏ fee (~$0.0001) |
| **Governance rewards** | Platform distributes ℏ rewards for participation |

All prices on the platform (hotspot monthly prices, energy kWh prices) are denominated in HBAR. This means real-world value depends on the current HBAR market price.

---

## Real-World Value

HBAR is publicly traded on major exchanges including **Binance**, **Coinbase**, **OKX**, and **KuCoin**.

- **Price source:** HederaNet fetches the live HBAR/USD price from the [CoinGecko public API](https://www.coingecko.com/) every 5 minutes. Every USD value shown in the Swap page, portfolio, and Explorer transaction feed uses this live rate.
- **Actual market price:** Fluctuates with market conditions. Check [CoinMarketCap](https://coinmarketcap.com/currencies/hedera-hashgraph/) or [CoinGecko](https://coingecko.com/en/coins/hedera) for the current price.

> ℹ️ **Note:** USD values shown in HederaNet (portfolio totals, transaction USD values) are estimates based on the last CoinGecko price fetch. They update every 5 minutes and reflect real market rates, not a fixed placeholder.

---

## Why HederaNet Uses HBAR

### Speed
Hedera finalizes transactions in 3 to 5 seconds — fast enough that a subscriber's internet service activates in near-real-time after payment. No waiting for block confirmations.

### Cost
Each Hedera transaction costs approximately **$0.0001** (one-hundredth of a cent). This makes micropayments economically viable. A 5 ℏ hotspot subscription generates enough fee revenue to cover thousands of on-chain operations.

### Carbon-Negative
Hedera uses a leaderless Proof-of-Stake variant of the hashgraph algorithm. Its annual energy consumption is a tiny fraction of Proof-of-Work networks. Hedera has certified its operations as carbon-negative since 2021 — a natural fit for a platform built around renewable energy.

### Regulatory Clarity
The Hedera Governing Council structure gives HBAR more regulatory clarity than many other cryptocurrencies. This matters for the communities and institutions HederaNet serves in Africa.

---

## How to Get HBAR on Testnet

When you create a HederaNet account, a small HBAR allocation is automatically credited to your new testnet account. Additional HBAR can be obtained by:

1. **Earning as an operator** — Every subscription and energy sale deposits HBAR into your account.
2. **Swapping** — Swap USDC (claim free from the faucet) → HBAR on the [Swap page](../market/swapping-tokens.md).
3. **Hedera testnet faucet** — Visit [https://portal.hedera.com](https://portal.hedera.com) and use the official Hedera testnet faucet to top up your account directly.

On mainnet, purchase HBAR on any major exchange and transfer to your HederaNet Hedera account ID.

---

## Viewing Your HBAR Balance

Your HBAR balance is visible in multiple places:

- **Profile page** — Shows your live balance fetched from the mirror node.
- **Staking page** — Shows your full HBAR balance (including staked and liquid portions).
- **Portfolio (Market page)** — Shows your HBAR as part of your overall portfolio.
- **HashScan** — Visit `https://hashscan.io/testnet/account/YOUR_ACCOUNT_ID` for the full on-chain view.

---

## HBAR and the 85/10/5 Split

When a subscriber pays for a hotspot or buys energy, the HBAR payment flows through the **ServicePayment smart contract** (0.0.7153764), which splits it:

- **85%** → Operator's Hedera account (HBAR)
- **10%** → Platform treasury (HBAR)
- **5%** → Community governance fund (HBAR)

All three destinations are Hedera accounts, and all transfers are on-chain and verifiable on HashScan.
