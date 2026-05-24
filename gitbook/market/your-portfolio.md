# Your Portfolio

The Portfolio section of the Market page gives you a complete, at-a-glance view of all your token holdings and their current USD value.

---

## Accessing Your Portfolio

Click **Swap** in the top navigation bar, or go directly to `/dashboard/market`. The Portfolio Overview is displayed in the right-hand card on the page, above the swap interface.

---

## Total Portfolio Value

At the top right of the portfolio card, your **Total Value** is shown in USD. This is calculated by multiplying each token balance by its current testnet price:

```
Total Value = 
  (HBAR balance × live HBAR/USD price from CoinGecko)
+ (HNET balance × AMM-derived HNET/USDC price)
+ (HEC balance  × AMM-derived HEC/USDC price)
+ (HCC balance  × AMM-derived HCC/USDC price)
+ (USDC balance × $1.00)
```

Prices update automatically — HBAR is fetched live from CoinGecko every 5 minutes; HNET, HEC, and HCC prices are derived in real time from their on-chain AMM pool reserves (`poolReserveUsdc / poolReserveToken`).

---

## The Color Bar

Directly below the total value is a **proportional color bar** — a horizontal bar divided into colored segments, each representing one token as a percentage of your total portfolio value:

| Token | Color | Token ID |
|-------|-------|---------|
| HBAR | Purple | Native |
| HNET | Green | 0.0.7153593 |
| HEC | Yellow | 0.0.7153605 |
| HCC | Blue | 0.0.7153651 |
| USDC | Bright Green | 0.0.9038720 |

Each segment's width is proportional to that token's share of your total portfolio. If HBAR makes up 70% of your value, the purple segment takes 70% of the bar's width.

This visual makes it immediately obvious if your holdings are well-diversified or heavily concentrated in one token.

---

## Individual Token Rows

Below the color bar, each token has its own row showing:

| Column | What It Shows |
|--------|--------------|
| **Token icon + name** | Visual identifier and full token name |
| **Balance** | Your current holding in that token's native units |
| **USD Value** | Balance × current price, shown in dollars |

### Example Portfolio

```
HBAR      250.00 ℏ          $17.50
HNET    1,500.00 HNET        $15.00
HEC     2,000.00 HEC          $4.00
HCC    10,000.00 HCC          $1.00
USDC       50.00 USDC        $50.00
                         ─────────
                  Total:   $87.50
```

---

## How Balances Are Sourced

Your token balances come from two sources:

| Token | Source |
|-------|--------|
| **HBAR** | Hedera mirror node (on-chain, real-time) |
| **HNET, HEC, HCC, USDC** | Hedera mirror node (on-chain) when tokens are properly associated; otherwise platform database |

The mirror node data is fetched each time you load the market page. For the most current balance, **refresh the page** — there is no continuous streaming on the portfolio view.

Balances refresh approximately every 30 seconds if you keep the market page open.

---

## Why a Token Shows 0 Balance

| Token | How to Get It |
|-------|--------------|
| **HBAR** | Auto-credited on account creation (small amount). Earn more as an operator, or swap USDC → HBAR |
| **HNET** | Earn as operator reward, or swap USDC → HNET on the market |
| **HEC** | Earn by generating solar energy (operator), or swap USDC → HEC |
| **HCC** | Earn by contributing compute resources, or swap USDC → HCC |
| **USDC** | Use the faucet (100 USDC/day free on testnet) |

If all your balances show 0, start by claiming USDC from the faucet, then swap some USDC for other tokens.

---

## Price Ticker Cards

At the very top of the Swap page — above the portfolio — are **price ticker cards** showing the current rate for each of the five tokens. These are the same prices used to calculate your portfolio USD values:

| Token | Price Source |
|-------|-------------|
| HBAR | Live market price from CoinGecko (refreshes every 5 min) |
| HNET | AMM pool — constant-product formula, moves with trading |
| HEC | AMM pool — constant-product formula, moves with trading |
| HCC | AMM pool — constant-product formula, moves with trading |
| USDC | Fixed $1.00 |

Buying a token pushes its AMM price up slightly; selling pushes it down. The spot price shown is derived from `poolReserveUsdc / poolReserveToken` in real time.

---

## Portfolio Strategy Tips

1. **Use USDC as your base** — Claim faucet USDC daily while on testnet to build up a starting balance.
2. **Diversify** — Holding a mix of tokens lets you participate in different parts of the ecosystem (governance via HNET, energy market via HEC).
3. **Watch the color bar** — If you are an operator planning to advance to Gold tier, make sure your HBAR allocation is growing toward the 500 ℏ threshold.
4. **Track your growth** — Compare your total portfolio value week-over-week to see whether your operator earnings are compounding.
