# Buying Energy

HederaNet's energy market connects buyers directly with solar panel operators in their area. You purchase kilowatt-hours at the operator's listed price in HBAR, and an IoT oracle confirms delivery before the transaction is finalized.

***

## How the Energy Market Works

Operators who own solar installations list their available electricity on the market with a price per kWh in HBAR. As a buyer, you browse these listings, select one, and purchase the amount of energy you need. The EnergyMarket smart contract (0.0.7153712) handles the payment and triggers the IoT confirmation flow.

***

## Browsing Energy Listings

### Step 1: Go to Dashboard → Energy

Navigate to [https://hederanet.online/dashboard/energy](https://hederanet.online/dashboard/energy).

The energy market table shows all available listings from operators across the network.

### Reading the Listings Table

| Column              | What It Means                                                            |
| ------------------- | ------------------------------------------------------------------------ |
| **Location / City** | Where the solar installation is physically located                       |
| **Capacity (kW)**   | The rated power of the operator's solar system                           |
| **Available (kWh)** | How many kilowatt-hours remain for sale in this listing                  |
| **Price / kWh**     | Cost per kilowatt-hour in HBAR (ℏ)                                       |
| **Operator Tier**   | Bronze, Silver, or Gold — higher tiers indicate more committed operators |

### Evaluating Listings

* **Location proximity** — Choose a listing near you to minimize grid transmission. On mainnet, delivery confirmation is tied to a specific IoT meter.
* **Price comparison** — Prices vary by operator. Shop around before committing to a purchase.
* **Operator tier** — Gold-tier operators have staked 500+ ℏ as a commitment. Their listings tend to be more reliable for dispute resolution.
* **Available units** — Make sure the listing has enough kWh for your planned purchase before clicking Buy.

***

## Purchasing Energy

### Step 1: Click "Buy"

Find a listing you want to purchase from and click the **Buy** button on that row. A purchase modal appears.

### Step 2: Review the Summary

The modal displays:

* **Location** — City and coordinates of the solar installation.
* **Price per kWh** — The HBAR rate for this listing (e.g., `0.05 ℏ/kWh`).
* **Available units** — Maximum kWh you can buy in this transaction.

### Step 3: Enter the Amount

Type the number of kilowatt-hours you want to purchase in the **kWh amount** field. As you type, the modal shows a **live total cost** calculated as:

```
Total Cost = Amount (kWh) × Price per kWh (ℏ)

Example: 50 kWh × 0.05 ℏ/kWh = 2.5 ℏ
```

Make sure you have sufficient HBAR in your account to cover the total.

### Step 4: Confirm Purchase

Click **Confirm Purchase**. The platform:

1. Verifies your HBAR balance is sufficient.
2. Submits the purchase to the **EnergyMarket contract** (0.0.7153712).
3. Deducts the kWh amount from the listing's available units.
4. Creates an `EnergyTrade` record in the transaction history.

***

## What Happens After Purchase

### On Testnet

On testnet, the transaction completes immediately. The IoT delivery step is simulated — funds are transferred to the operator's account without waiting for a physical sensor reading.

### On Mainnet

On mainnet, the process is fully verified:

1. **Payment escrowed** — Your HBAR is held by the smart contract.
2. **IoT oracle reads** — The solar installation's smart meter reports actual energy generation.
3. **3-of-5 oracle confirmation** — At least 3 of the 5 oracle nodes must submit matching readings.
4. **Delivery confirmed** — The contract releases HBAR to the operator and finalizes your purchase.
5. **HEC minted** — The operator receives 1 Hedera Energy Credit per kWh as a renewable energy certificate.

### Dispute Resolution

If you believe energy was not delivered after purchase:

* The **EnergyMarket contract** has a 24-hour dispute window.
* Contact support at support@hederanet.online with your transaction ID.
* An admin reviews the IoT oracle data. If delivery is unconfirmed, you receive a refund.

***

## Your Purchase History

All energy purchases appear in your transaction history on the [Earnings page](../operators/tracking-earnings.md) under type `ENERGY_TRADE`. The record includes the amount, price, operator, and status.

***

## Why Buy Local Solar Energy?

1. **Support local operators** — 85% of your payment goes directly to the solar panel owner in your community.
2. **Verified renewable energy** — Every kWh is backed by an IoT-confirmed solar generation record.
3. **Transparent pricing** — All prices are public on-chain. No hidden fees, no surcharges.
4. **Competitive rates** — Market competition between operators drives fair pricing.
5. **Financial inclusion** — Pay with HBAR or via mobile money through USSD — no bank account required.

***

## Related Pages

* [USSD Energy Market](ussd-access.md) — Buy energy from a feature phone without internet.
* [HEC Token](../tokens/hec.md) — Learn about the energy certificates generated by your purchases.
* [EnergyMarket Contract](../developers/smart-contracts.md) — Technical details of the payment and dispute system.
