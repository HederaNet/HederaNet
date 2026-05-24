# Internet Services

HederaNet's internet service connects subscribers to community-operated WiFi hotspots. Instead of paying a distant telecom company, you pay a local operator directly — and 85 cents of every dollar you spend stays within your community.

---

## How Subscriptions Work

Each operator deploys a physical WiFi hotspot at a specific location and sets a monthly HBAR price. As a subscriber, you browse available hotspots, find one that covers your location, and pay the monthly subscription fee. The smart contract handles everything else automatically.

---

## Finding a Hotspot

### From the Web App

Hotspots are listed in the network's explore or map view. When evaluating a hotspot, look at:

| Field | What to Look For |
|-------|-----------------|
| **Location / Coverage** | Does the coverage radius include your address? |
| **Monthly Price** | Competitive pricing ranges from 2–10 ℏ/month in most cities |
| **Uptime %** | Higher is better — aim for hotspots with 90%+ uptime |
| **Operator Tier** | Gold-tier operators have more locked capital, signaling commitment |
| **Node ID** | A unique identifier (e.g., `A3F9C2`) for tracking this specific hotspot |

### Uptime Percentage

Uptime percentage shows what fraction of the last 30 days the hotspot was active and reachable. A hotspot with 95% uptime was down for roughly 1.5 days in the past month. For critical connectivity (e.g., a business), choose the highest-uptime operators in your area.

---

## Subscribing to a Hotspot

1. Sign in to [https://hederanet.vercel.app](https://hederanet.vercel.app).
2. Browse the available hotspots.
3. Select a hotspot that covers your location.
4. Click **Subscribe** and confirm the monthly price in HBAR.
5. The **ServicePayment smart contract** (0.0.7153764) processes the payment instantly.

Payment is split automatically:
- **85%** → Operator's Hedera account
- **10%** → Platform treasury
- **5%** → Community governance fund

---

## Your Active Subscription

After subscribing, your active subscription appears in the dashboard. It shows:
- Which hotspot you are subscribed to (Node ID and operator)
- The monthly price you are paying
- Your subscription expiry date
- Coverage area details

---

## Renewing Your Subscription

Your subscription is valid for 30 days from the payment date. Before expiry, you can renew by:

1. Returning to the hotspot listing.
2. Clicking **Renew** or **Subscribe** again.
3. Paying another month's fee.

There is no automatic renewal on the current testnet — you initiate each monthly payment manually. Mainnet may introduce auto-renewal with user consent.

---

## Cancelling a Subscription

To stop a subscription:
- Simply do not renew when your current period expires.
- There are no cancellation fees — subscriptions are month-to-month.
- Existing subscription periods are non-refundable (the smart contract has already distributed the funds to the operator).

---

## What If My Hotspot Goes Offline?

If your subscribed hotspot goes offline during your subscription period:

1. Check the hotspot's current status — it may be temporarily inactive (the operator deactivated it for maintenance).
2. If it has been offline for an extended period, you can subscribe to a different hotspot.
3. Dispute resolution for downtime is managed through the governance process — submit a governance proposal or contact support if a hotspot's operator has abandoned it.

> 💡 **Tip:** Subscribe to hotspots with consistently high uptime percentages to minimize the risk of service interruption. The uptime% shown on the listing is a trailing 30-day average.

---

## USSD Access

If you do not have a smartphone or browser access, you can manage your internet subscription via USSD on any mobile phone. Dial `*384*1#` and navigate to **Internet Services** in the menu. See [USSD Access](ussd-access.md) for the full guide.

---

## Getting HBAR to Pay for Subscriptions

You need HBAR to pay for subscriptions. Ways to get HBAR on testnet:
- A small HBAR amount is automatically credited when you create your account.
- Earn HBAR by becoming an operator and deploying infrastructure.
- Use the USDC faucet to claim testnet USDC, then swap to HBAR on the [Swap page](../market/overview.md).

On mainnet, you will need to purchase HBAR on an exchange (Binance, Coinbase, etc.) and transfer it to your HederaNet account.
