# HNET Token

HNET is HederaNet's governance and staking token. It gives holders a direct voice in how the network evolves and rewards operators who commit to the platform long-term.

---

## Token Details

| Property | Value |
|----------|-------|
| **Name** | HederaNet Token |
| **Symbol** | HNET |
| **Token ID (Testnet)** | 0.0.7153593 |
| **Total Supply** | 1,000,000,000 (1 billion) |
| **Decimals** | 8 |
| **Testnet Price** | AMM-derived from on-chain pool reserves (initial seed: $0.01, moves with trading) |
| **Price Source** | Constant-product AMM pool (1,000,000 HNET / 10,000 USDC initial reserves) |
| **Type** | HTS Fungible Token |

---

## What HNET Is For

### 1. Governance Voting Weight

The most important use of HNET is governance. When a proposal is active, your vote is weighted by:

```
Voting Power = HNET Balance × Reputation Score
```

An operator with 10,000 HNET and a reputation score of 5 has 50,000 units of voting power — five times more influence than a new participant with the same HNET balance and a reputation score of 1. This design rewards long-term participants who have proven themselves on the network.

### 2. Operator Staking (Tier Advancement)

HNET can be staked alongside HBAR to contribute to operator tier advancement. The combination of HBAR staking and HNET holdings signals the deepest level of commitment to the network.

### 3. Platform Fee Capture (Future)

In the roadmap, HNET holders may receive a share of platform revenue — a portion of the 10% platform fee and 5% community fund could be distributed to staked HNET holders via a governance-approved revenue sharing mechanism. This would give HNET intrinsic financial value backed by real platform usage.

---

## Why HNET Has Value

1. **Fixed supply** — 1 billion HNET total, no additional minting possible. As demand for governance participation grows, the fixed supply creates scarcity.

2. **Staking demand** — Operators who want higher governance influence need to accumulate HNET. This creates organic buy-side demand as the network grows.

3. **Governance power** — For large operators with significant infrastructure and earnings at stake, the ability to influence protocol decisions (fee splits, tier thresholds, supported regions) is economically valuable. They are willing to pay for that influence.

4. **Royalty configuration** — The HNET token's HTS configuration includes royalty fees on transfers, meaning some value is captured at the token layer on every secondary market trade.

---

## How to Get HNET

| Method | How |
|--------|-----|
| **Earn as operator rewards** | Platform distributes HNET rewards for high-performance operators |
| **Swap USDC → HNET** | Use the [Swap page](../market/swapping-tokens.md) to exchange USDC for HNET |
| **Swap HBAR → HNET** | Available on the Swap page |

On testnet, the easiest path is: click **Swap** in the top nav → claim 100 USDC from the faucet → swap USDC → HNET.

> **AMM note:** Buying HNET pushes the pool price up slightly. Selling HNET pushes it down. The price you see on the Swap page is the real-time AMM spot price derived from `poolReserveUsdc / poolReserveToken` — not a fixed rate.

---

## HNET and Governance

HNET is the entry point to HederaNet's governance system. The more HNET you hold, the more your vote counts — but reputation multiplies that weight. This dual-factor design (tokens + reputation) prevents pure "whale governance" where the richest participants always win:

- A new participant with 1,000,000 HNET but reputation 1 has 1,000,000 voting power.
- An established operator with 100,000 HNET but reputation 15 has 1,500,000 voting power.

Long-term community contributors are rewarded with proportionally more influence regardless of their token wealth.

---

## Token ID Verification

You can verify HNET on HashScan at:
`https://hashscan.io/testnet/token/0.0.7153593`

This shows the total supply, current holders, recent transfers, and full token configuration including the royalty fee structure.

---

## Risk Considerations

- HNET is a utility token with no guaranteed monetary value.
- On testnet, the $0.01 price is a reference rate only — no real money changes hands.
- On mainnet, HNET price will be determined by market supply and demand.
- Holding HNET for governance purposes does not guarantee any financial return.
