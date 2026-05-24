# USDC (Testnet)

USDC is HederaNet's USD-pegged stablecoin — the reference currency that gives all other platform tokens their dollar value. On testnet, it is a custom token deployed by the HederaNet treasury. On mainnet, it will be replaced by Circle's official Hedera USDC.

---

## Token Details

| Property | Testnet Value | Mainnet Value |
|----------|--------------|--------------|
| **Token ID** | 0.0.9038720 | Circle's official USDC: 0.0.456858 |
| **Decimals** | 6 | 6 |
| **Peg** | 1.00 USD | 1.00 USD |
| **Issuer** | HederaNet treasury (testnet) | Circle Financial (mainnet) |
| **Minting** | Unlimited (testnet) | Regulated by Circle |
| **Faucet** | 100 USDC/day free | Not available |

---

## Purpose in HederaNet

USDC serves as the USD reference layer for the entire token economy:

1. **Price discovery** — All other tokens (HNET, HEC, HCC, HBAR) have USD prices because they can be swapped for USDC at a known rate. Without USDC, there would be no dollar-denominated price for any HederaNet asset.

2. **Testnet on-ramp** — New users who need tokens to test the platform can claim free testnet USDC from the faucet and swap it for any other token. This removes financial barriers to exploring the platform.

3. **Value realization** — Operators who earn HEC or HCC can swap those tokens to USDC to capture their dollar value before converting to HBAR or withdrawing.

4. **Stable accounting** — When the earnings page shows a USD estimate next to your HBAR balance, it uses HBAR's price relative to USDC as the conversion reference.

---

## Key Difference from Real USDC

The testnet USDC (0.0.9038720) differs from Circle's real USDC in several important ways:

| Property | Testnet USDC | Real Circle USDC |
|----------|-------------|-----------------|
| **Who issues it** | HederaNet treasury | Circle Financial |
| **Minting cap** | Unlimited | Regulated 1:1 with USD held |
| **Regulatory backing** | None | US banking regulations |
| **Redemption** | Not redeemable for real USD | Redeemable for real USD via Circle |
| **Free to acquire** | Yes (faucet) | No — must buy with real USD |

The testnet USDC exists only to make testing realistic. It is worthless in the real world.

---

## Testnet vs Mainnet Behavior

The only change needed to switch from testnet USDC to Circle's official Hedera USDC is updating the `USDC_TOKEN_ID` environment variable in the platform configuration:

```
# Testnet:
USDC_TOKEN_ID=0.0.9038720

# Mainnet:
USDC_TOKEN_ID=0.0.456858
```

No code changes are required. All market logic, swap interfaces, portfolio calculations, and faucet gating work identically — only the token being operated on changes.

> ℹ️ **Note:** On mainnet, after the switch, the faucet will be removed. Users will need to bring their own USDC from an exchange or Circle account.

---

## How to Get Testnet USDC

The easiest way is the [USDC Faucet](../market/usdc-faucet.md):

1. Click **Swap** in the top navigation bar.
2. Find the blue Faucet card.
3. Click **Claim USDC** — 100 USDC is credited immediately.
4. Repeat every 24 hours.

Alternatively, swap any other token for USDC on the swap interface if you have an existing token balance.

---

## 6 Decimal Places

USDC uses 6 decimal places, which is the same precision as Circle's official USDC on Ethereum and other chains. This means the minimum USDC unit is 0.000001 USDC (one-millionth of a dollar). This precision is important for:

- Accurate swap calculations when exchanging very small amounts.
- Proper representation of USD values for HCC tokens (which are worth $0.0001 each — one-hundredth of a cent).

---

## Viewing USDC on HashScan

Verify the testnet USDC token:
`https://hashscan.io/testnet/token/0.0.9038720`

This page shows the total minted supply, all current holders (including the faucet contract and user accounts), and all transfer history.

---

## USDC in Your Portfolio

On the [Portfolio page](../market/your-portfolio.md), USDC shows in bright green and has a fixed exchange rate of $1.00. This makes it the simplest asset in your portfolio — its USD value is always exactly equal to your USDC balance. Use your USDC balance as the "cash" portion of your portfolio — the stable foundation from which you swap into other tokens.
