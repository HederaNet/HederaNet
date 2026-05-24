# Tracking Earnings

The Earnings page gives you a complete view of your financial performance on HederaNet — from a top-line summary to a detailed transaction log and a time-series chart showing your earning trajectory.

---

## Accessing the Earnings Page

Navigate to **Dashboard → Earnings** or go directly to `/dashboard/earnings`.

---

## Summary Cards

At the top of the page, three summary cards give you a quick snapshot:

| Card | What It Shows |
|------|--------------|
| **Total Earned** | Your cumulative HBAR earnings with a USD estimate (at $0.07/ℏ) |
| **Transactions** | Total number of earnings-related transactions in your history |
| **Average per Transaction** | Total earned divided by number of transactions, in HBAR |

The USD estimate is calculated using the testnet reference price of $0.07/ℏ. On mainnet, it will use a live HBAR price feed.

---

## Earnings Chart

Below the summary cards is an **area chart** showing your earnings over the last 14 days. Each bar or data point represents one day's total earnings in HBAR.

This chart is useful for spotting patterns:
- Did a new hotspot you deployed start generating income?
- Did energy sales spike after you listed more units?
- Is there a day-of-week pattern in subscription activity?

The chart groups all transaction types together into a single daily total so you see your net earning trend at a glance.

---

## Transaction History Table

Below the chart is a full transaction history table. Each row represents one transaction with the following columns:

| Column | Description |
|--------|-------------|
| **Type** | What kind of transaction it is (see table below) |
| **Direction** | ↑ outgoing (you paid) or ↓ incoming (you received) |
| **Amount** | HBAR amount, positive for incoming / negative for outgoing |
| **Status** | `SUCCESS`, `PENDING`, or `FAILED` |
| **Date** | Timestamp of the transaction |

### Transaction Types

| Type | Meaning |
|------|---------|
| `SUBSCRIPTION` | A subscriber paid for your hotspot service |
| `ENERGY_TRADE` | A buyer purchased kWh from your energy listing |
| `STAKE` | You staked HBAR (outgoing to staking contract) |
| `UNSTAKE` | Staked HBAR was returned to your account |
| `REWARD` | A bonus reward credited to your account (e.g., tier bonus, governance reward) |
| `SWAP` | You exchanged tokens on the market |
| `FAUCET` | You claimed USDC from the testnet faucet |

---

## How Payment Distribution Works

Every service payment that flows through HederaNet is split automatically by the **ServicePayment smart contract** (0.0.7153764):

```
Subscriber pays X HBAR
  └─ 85% → Your Hedera account   (SUBSCRIPTION income)
  └─ 10% → Platform treasury     (platform fee)
  └─  5% → Community fund        (governance treasury)
```

This means that when you see a `SUBSCRIPTION` transaction in your history for, say, 8.5 ℏ, the subscriber actually paid 10 ℏ — 1.5 ℏ went to the platform and community fund.

Similarly for energy trades via the **EnergyMarket contract** (0.0.7153712):

```
Buyer pays Y HBAR
  └─ 85% → Your Hedera account   (ENERGY_TRADE income)
  └─ 10% → Platform treasury
  └─  5% → Community fund
```

> ℹ️ **Note:** The 85/10/5 split is encoded in the smart contracts at the time of deployment. Changing the split would require a governance proposal and a contract upgrade — this is how the community protects operators from arbitrary fee increases.

---

## Reward Multiplier Effect

If you are a Silver or Gold tier operator, the multiplier applies to the reward component of your earnings. The base 85% distribution is a fixed contract parameter, but the platform layer applies additional reward bonuses based on your tier:

| Tier | Multiplier | Effect on Rewards |
|------|-----------|-------------------|
| BRONZE | 1× | Standard reward rate |
| SILVER | 1.5× | Reward bonuses 50% higher |
| GOLD | 2× | Reward bonuses doubled |

Track these bonus rewards in your transaction history under the `REWARD` type.

---

## Exporting Your Earnings Data

Currently, the earnings page does not have a built-in export button. To obtain a full record of your on-chain transactions, you can:

1. Find your **Hedera Account ID** on your [Profile page](../getting-started/your-profile.md).
2. Visit `https://hashscan.io/testnet/account/YOUR_ACCOUNT_ID` on HashScan.
3. The Transactions tab shows all on-chain HBAR movements for your account.

You can also query the API directly if you are a developer — see the [API Reference](../developers/api-reference.md) for the `/api/transactions` endpoint.

---

## Tips for Growing Earnings

1. **Add more hotspots** — Each active, well-subscribed hotspot compounds your total.
2. **Stake to Gold tier** — Doubling your reward multiplier is the highest-ROI action available.
3. **Price competitively** — A hotspot at 4 ℏ/month with 30 subscribers out-earns a hotspot at 10 ℏ/month with 8 subscribers.
4. **List energy regularly** — Create new energy listings whenever your previous listing sells out.
5. **Maintain uptime** — High-uptime operators attract and retain more subscribers, improving the consistency of the `SUBSCRIPTION` income line.
