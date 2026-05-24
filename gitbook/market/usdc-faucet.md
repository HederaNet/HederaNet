# USDC Faucet

The USDC Faucet provides free testnet USDC to anyone testing HederaNet. It is the primary on-ramp for new users who need tokens to explore the platform.

---

## What the Faucet Is

On testnet, real money should never be required to explore HederaNet's features. The USDC Faucet dispenses **100 USDC** (testnet USD Coin, token ID 0.0.9038720) every 24 hours to any authenticated user. This is enough to:

- Swap for HBAR to pay for a few hotspot subscriptions.
- Swap for HNET to participate in governance.
- Test the full swap interface across all token pairs.
- Simulate a realistic portfolio without spending real money.

---

## How to Claim USDC

### Step 1: Go to the Market Page

Click **Swap** in the top navigation bar, or go directly to `/dashboard/market`.

### Step 2: Find the Faucet Section

Scroll down to the **USDC Faucet** section — it is displayed as a blue card below the portfolio overview.

### Step 3: Click "Claim USDC"

Click the **Claim USDC** button. Within seconds, **100 USDC** is credited to your account.

Your portfolio balance updates to reflect the new USDC, and a `FAUCET` transaction appears in your earnings history.

---

## Rate Limit: Once per 24 Hours

Each account can claim the faucet once every 24 hours. After claiming:

- The **Claim USDC** button becomes disabled.
- A **countdown timer** appears showing exactly how many hours and minutes until you can claim again.
- At the 24-hour mark, the button re-enables automatically — refresh the page if needed.

> ℹ️ **Note:** The 24-hour timer is account-based, not IP-based. Each HederaNet account has its own independent cooldown.

---

## What USDC Is Used For

| Use Case | How |
|----------|-----|
| **Buy HBAR** | Swap USDC → HBAR to pay for subscriptions and energy |
| **Buy HNET** | Swap USDC → HNET to build governance voting power |
| **Buy HEC** | Swap USDC → HEC to hold energy credits |
| **Buy HCC** | Swap USDC → HCC to hold compute credits |
| **Test the swap interface** | Verify swap mechanics work correctly |
| **Portfolio testing** | Simulate a realistic token allocation |

---

## On-Chain vs Simulation Mode

The faucet operates in one of two modes depending on the platform configuration:

### On-Chain Mode (fully configured)
When the `USDC_TOKEN_ID` environment variable is set to a valid Hedera token ID (0.0.9038720), the faucet executes an actual Hedera token transfer. You receive real testnet USDC tokens in your Hedera account, verifiable on HashScan.

### Simulation Mode (placeholder setup)
If USDC_TOKEN_ID is not configured or the token is not associated with your account, the faucet simulates the credit by updating your balance in the platform database. The USDC shows in your portfolio but has no on-chain representation. A `FAUCET` transaction is still created in your history, marked as simulated.

> 💡 **Tip:** You can tell which mode you are in by checking whether a FAUCET transaction appears on your HashScan account page. If it appears there, the faucet is operating on-chain.

---

## This Is Testnet-Only

The USDC Faucet is a **testnet-only feature**. It will not exist on mainnet.

On mainnet:
- Our testnet USDC (0.0.9038720) will be replaced by Circle's official Hedera USDC (0.0.456858).
- You must acquire real USDC through Circle, an exchange, or an on-ramp service.
- There will be no free token dispensing.

The faucet exists solely to remove financial barriers to testing and exploring HederaNet before committing real funds.

---

## Troubleshooting

**The Claim button is greyed out and there is no timer.**
You may have already claimed within the past 24 hours. Refresh the page to load the current cooldown state.

**I claimed but my USDC balance still shows 0.**
Check if you are in simulation mode (see above). Also try refreshing the portfolio section — balances update from the mirror node which may have a brief delay.

**The timer says 0:00 but I cannot claim.**
This is a display edge case. Refresh the page to reset the UI state and the button should re-enable.

If problems persist, contact support@hederanet.online with your Hedera Account ID (not your private key) and the approximate time of your claim attempt.
