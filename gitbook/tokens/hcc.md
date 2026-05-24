# HCC — Hedera Compute Credits

Hedera Compute Credits (HCC) represent contributions of computational processing power to the HederaNet network. They are the most experimental of the three HederaNet utility tokens, with a roadmap tied to a distributed compute marketplace currently under development.

---

## Token Details

| Property | Value |
|----------|-------|
| **Name** | Hedera Compute Credits |
| **Symbol** | HCC |
| **Token ID (Testnet)** | 0.0.7153651 |
| **Decimals** | 6 (micro-credit precision) |
| **Supply** | Infinite (minted on verified compute contribution) |
| **Testnet Price** | AMM-derived (initial seed: $0.0001, moves with trading) |
| **Price Source** | Constant-product AMM pool (10,000,000 HCC / 1,000 USDC initial reserves) |
| **Type** | HTS Fungible Token |

---

## What HCC Represents

HCC tokens represent a unit of shared compute contribution to the HederaNet infrastructure. Think of it as a credit system similar to:

- **AWS Credits** — Amazon's prepaid compute tokens
- **Render (RNDR)** — Tokens earned by contributing GPU compute power for rendering
- **Akash (AKT)** — Tokens for a distributed cloud compute marketplace

In HederaNet's model, participants who contribute processing power to the network earn HCC tokens. Those tokens can then be used to pay for compute jobs on the platform, or sold for USDC on the market.

---

## How HCC Is Earned

HCC is minted when a verified compute contribution is confirmed:

```
Participant contributes compute resources
(CPU/GPU time, bandwidth processing, etc.)
        │
        ▼
Platform measures and verifies contribution
        │
        ▼
HCC minted to participant's account
(amount proportional to verified compute)
        │
        ▼
HCC appears in portfolio, tradeable on market
```

On the current testnet, HCC distribution is managed through the platform's reward system. Full decentralized compute contribution tracking is part of the development roadmap.

---

## Use Cases for HCC

### Current (Testnet)
- Hold HCC and watch its balance in your portfolio.
- Swap HCC → USDC or HCC → HBAR on the [Swap page](../market/swapping-tokens.md) to realize value.
- Demonstrate how a compute credit market could work.

### Future (Roadmap)
- **Pay for AI workloads** — Use HCC to pay for AI inference jobs run on the HederaNet distributed compute network.
- **Distributed rendering** — Pay for 3D rendering, video encoding, and media processing using HCC.
- **Edge computing** — Pay nodes at the network edge to process IoT data locally before sending to the chain.
- **Compute marketplace** — Buy and sell compute time between participants, with HCC as the medium of exchange.

---

## Why 6 Decimal Places?

HCC uses 6 decimal places (minimum unit: 0.000001 HCC). This "micro-credit" precision supports billing for very small compute jobs — a single API inference call that takes 10 milliseconds of GPU time is still measurable and billable in HCC without rounding errors.

This is analogous to how AWS charges to the second for compute time and to the kilobyte for storage — granular billing only works with granular token precision.

---

## HCC vs HEC vs HNET

It helps to understand how the three utility tokens differ in purpose:

| Token | What It Represents | Backed By |
|-------|-------------------|-----------|
| HNET | Governance rights and staking commitment | Fixed supply + staking demand |
| HEC | Verified solar energy generation (1 kWh) | Physical IoT-confirmed energy |
| HCC | Compute resource contributions | Processing power contributed to the network |

HCC is the most speculative of the three because the compute marketplace it is designed for is not yet fully built. Its value is primarily in its future use case rather than present utility.

---

## Getting HCC

| Method | How |
|--------|-----|
| **Earn via compute contribution** | Contribute processing resources when the compute marketplace launches |
| **Swap on Swap page** | Swap USDC → HCC or HBAR → HCC on the [Swap page](../market/swapping-tokens.md) |

On testnet, swapping is the primary way to acquire HCC for testing purposes.

---

## Viewing HCC on HashScan

Verify HCC on HashScan:
`https://hashscan.io/testnet/token/0.0.7153651`

The token page shows total minted supply, current holders, and all HTS token configuration details.

---

## A Note on Experimental Status

HCC is explicitly the most experimental of the HederaNet tokens. The compute marketplace is in early planning stages, and HCC's utility use cases depend on that marketplace being built and adopted. Governance proposals will define how HCC integrates with future compute features. Treat HCC holdings with appropriate caution regarding future value.
