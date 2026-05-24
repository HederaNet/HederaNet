# Swapping Tokens

The swap interface lets you exchange any HederaNet token for any other token. All five tokens — HBAR, HNET, HEC, HCC, and USDC — are available.

---

## How to Swap

### Step 1: Open the Swap Page

Click **Swap** in the top navigation bar or navigate directly to `/dashboard/market`. Sign in if prompted.

### Step 2: Find the Swap Panel

The Swap panel is the central card on the page. It has two sides: **You Pay** (the token you are giving) and **You Receive** (the token you are getting).

### Step 3: Select Tokens

Click the token selector on the **You Pay** side. Choose from HBAR, HNET, HEC, HCC, or USDC. Then select the token you want to receive on the **You Receive** side.

### Step 4: Enter the Amount

Type the amount in the **You Pay** field. As you type, the **You Receive** amount auto-calculates.

For HNET, HEC, and HCC swaps the output is calculated using the **AMM formula** (constant-product with 0.3% fee). For HBAR ↔ USDC the calculation uses the live CoinGecko HBAR price.

Example output for an AMM pool swap:
```
You Pay:     100 USDC

You Receive: 9,850 HNET    ← slightly less than 10,000 due to 0.3% fee + price impact
             (≈ $0.01016 per HNET)
```

The USD value of each side is shown below the input fields.

### Step 5: Review

Check the rate and the exact output amount. The rate shown reflects the AMM spot price at the moment — it may shift slightly between preview and execution if another trade happens first.

### Step 6: Execute

Click **Swap [TOKEN_A] → [TOKEN_B]**. The swap executes as a single atomic Hedera transaction (typically confirmed within 3–5 seconds). The result appears immediately in your Swap History.

---

## The Flip Button

The **⇅** button between the two panels reverses the swap direction (e.g. HNET → USDC becomes USDC → HNET). Amounts recalculate automatically.

---

## What Happens On-Chain

When you click Swap:

1. The platform verifies you have sufficient balance of the "You Pay" token.
2. For pool tokens (HNET/HEC/HCC ↔ USDC): the treasury mints the output token amount, then a single atomic `TransferTransaction` moves both tokens simultaneously.
3. For HBAR ↔ USDC: a single atomic `TransferTransaction` moves token and HBAR simultaneously — if either leg fails, the entire transaction reverts.
4. Pool reserves are updated, moving the price in the direction of your trade.
5. A swap record is added to your Swap History with the on-chain transaction ID.

Every swap produces a real Hedera transaction — there are no simulated swaps.

---

## Swap History

The Swap History table below the swap panel shows your recent exchanges:

| Column | Description |
|--------|-------------|
| **From** | Token and amount you paid |
| **To** | Token and amount you received |
| **Rate** | Exchange rate at the time of the swap |
| **Status** | `SUCCESS` (on-chain) or `FAILED` (transaction reverted) |
| **Tx Hash** | Hedera transaction ID — click to view on HashScan |

> Timestamps are not shown in the Swap History table. Click the transaction hash to see the exact block time on [HashScan](https://hashscan.io/testnet).

---

## Price Impact and Slippage

Because HNET, HEC, and HCC use an AMM, large swaps move the price:

- Swapping **1 USDC → HNET** on a pool with 1,000,000 HNET / 10,000 USDC has negligible price impact.
- Swapping **500 USDC** into the same pool moves the price noticeably.

The swap preview always shows the **exact output amount** including price impact, so you know exactly what you will receive before confirming.

---

## Supported Swap Pairs

Every token can be swapped for every other token. Common pairs and their use cases:

| Pair | Direction | Use Case |
|------|-----------|---------|
| USDC → HBAR | Buy HBAR | Fund your account for subscriptions and fees |
| HBAR → USDC | Sell HBAR | Convert network earnings to stablecoin |
| USDC → HNET | Buy HNET | Build governance voting weight |
| HNET → USDC | Sell HNET | Take profits on governance tokens |
| HEC → USDC | Sell HEC | Realise value from energy credits earned |
| HCC → USDC | Sell HCC | Realise value from compute credits earned |
| USDC → HEC | Buy HEC | Purchase energy credits for solar energy trades |

---

## Tips

1. **Start with the faucet** — claim 100 free testnet USDC before your first swap.
2. **Keep some HBAR for fees** — every Hedera transaction costs a tiny ℏ fee (~$0.0001). Keep a small HBAR reserve.
3. **Check the Explorer** — the [Chain Explorer](/explorer) shows real-time prices derived from pool reserves so you can monitor price trends before swapping.
4. **Flip to check both directions** — use the ⇅ button to see both sides of a trade before deciding which direction gives you better value.
