# Staking & Tiers

Staking is how operators signal commitment to the network and unlock higher earnings. By locking HBAR in the staking contract, you advance through Bronze, Silver, and Gold tiers — each with a higher reward multiplier that increases earnings from all your infrastructure.

---

## The Tier System

| Tier | Minimum Staked | Reward Multiplier | What It Means |
|------|---------------|-------------------|---------------|
| **BRONZE** | 0 ℏ | 1× | Base reward rate. All new operators start here. |
| **SILVER** | 100 ℏ | 1.5× | 50% more rewards on every payment received. |
| **GOLD** | 500 ℏ | 2× | Double the base reward rate on all services. |

### Why Tiers Matter

The multiplier applies to all income streams — subscription payments from hotspot subscribers and energy sales. If the base rate produces 100 ℏ/month from your infrastructure:

- At **Bronze**: you earn **100 ℏ**
- At **Silver**: you earn **150 ℏ**
- At **Gold**: you earn **200 ℏ**

Over a 12-month period, the difference between Bronze and Gold is 1,200 ℏ vs 2,400 ℏ — the Gold stake of 500 ℏ pays itself back in increased earnings within a few months.

### The Cost of Gold Tier

At the current live HBAR price (fetched from CoinGecko and displayed on the Swap page):
- **Silver** — 100 ℏ × current HBAR price in locked capital
- **Gold** — 500 ℏ × current HBAR price in locked capital

The exact USD cost changes with HBAR's market price. Check the Swap page for the current rate before staking. The key point is that staked HBAR is not spent — it is locked and can be unstaked at any time (with a resulting tier reduction).

---

## How to Stake HBAR

### Step 1: Go to the Staking Page

Navigate to **Staking** in the top navigation bar, or go directly to `/dashboard/staking`.

### Step 2: Check Your Live Balance

At the top of the staking page, your **current HBAR balance** is displayed. This balance is fetched directly from the **Hedera mirror node** in real time — it reflects your actual on-chain balance, not a cached platform value.

> ℹ️ **Note:** The balance shown here is your total HBAR on your Hedera account. Staked amounts are tracked separately — the staking page shows both your total balance and how much is currently staked.

### Step 3: Enter Amount to Stake

In the **Stake** form, enter the amount of HBAR you want to stake. Consider:
- Staking at least 100 ℏ to reach Silver tier.
- Staking at least 500 ℏ to reach Gold tier.
- Keeping some HBAR unstaked to cover transaction fees (each Hedera transaction costs ~$0.0001).

### Step 4: Click "Stake"

Click the **Stake** button. The platform:
1. Submits a transaction to the Hedera network.
2. Locks the specified HBAR amount in the operator staking record.
3. Updates your tier immediately based on the new total staked amount.
4. Creates a `STAKE` transaction in your earnings history.

Your tier badge updates instantly on the staking page and across the dashboard.

---

## How to Unstake HBAR

You can withdraw your staked HBAR at any time, but doing so may reduce your tier if the remaining stake drops below a tier threshold.

### Step 1: Click "Unstake Tokens"

On the staking page, click the **Unstake Tokens** button. A modal dialog opens.

### Step 2: Enter Amount to Unstake

Type the number of HBAR you want to unstake. The modal shows:
- Your current staked amount.
- What tier you will be at after unstaking.
- A warning if the amount will reduce your tier.

### Step 3: Confirm

Click **Confirm Unstake**. The HBAR is returned to your account balance and your tier is recalculated immediately. An `UNSTAKE` transaction appears in your earnings history.

> ⚠️ **Warning:** Unstaking reduces your reward multiplier immediately. If you are a Gold operator earning 2× rewards, dropping below 500 ℏ staked moves you to Silver (1.5×) or Bronze (1×), significantly reducing future earnings. Plan unstaking carefully.

---

## KYC Status and Staking

Your KYC (Know Your Customer) status is visible on the staking page. On testnet, KYC status does not block staking. On mainnet, certain threshold staking amounts may require `APPROVED` KYC status to comply with financial regulations. See [KYC Verification](../account/kyc-verification.md) for details.

---

## Staking and Governance

Your staked HBAR indirectly boosts your governance influence. Operators who have staked more tend to have higher reputation scores (accumulated over time), which multiplies HNET voting power. Staking is a signal of long-term alignment with the network — a key input to reputation calculations.

---

## Staking FAQ

**Can I lose my staked HBAR?**
On the current testnet implementation, staking is non-punitive — your staked HBAR is always returned when you unstake. There is no "slashing" mechanism. On mainnet, the governance process may introduce slashing for malicious behavior, but this would require a community vote to implement.

**Is there a lock-up period?**
No. Unstaking is immediate on testnet. On mainnet, a short unbonding period (e.g., 7 days) may be introduced via governance to discourage rapid stake/unstake cycling.

**What if my HBAR balance drops below my staked amount?**
The platform maintains a separate accounting of your staked balance versus your liquid balance. Staking locks the funds — they cannot be spent until unstaked.

**How often is my balance updated?**
Your HBAR balance on the staking page is fetched from the Hedera mirror node each time the page loads. It is not continuously streaming — refresh the page to get the latest balance.
