# Solar Energy & Listings

HederaNet's energy market lets solar panel owners sell excess electricity to local buyers — peer-to-peer, on-chain, with IoT delivery confirmation. The process has two distinct steps: registering your physical solar installation, then creating a listing with your pricing.

---

## Prerequisites

- You must be registered as an **Operator**.
- You need a physical solar installation with a measurable output capacity.
- You need the GPS coordinates of the solar panel location.
- For mainnet, an IoT meter must be connected to the oracle network for delivery confirmation.

---

## Step 1: Register Your Solar Installation

Before you can list energy for sale, you must register the physical solar panel on-chain. This creates a verifiable record of the installation that underpins the energy market's trust model.

### How to Register

1. Go to **Dashboard → Energy** (or navigate to `/dashboard/energy`).
2. Click **+ List Energy**. The registration form opens.
3. Fill in:

| Field | Description | Example |
|-------|-------------|---------|
| **Capacity (kW)** | The rated power output of your solar installation | `5` (for a 5kW system) |
| **Latitude** | GPS latitude of the solar panel location | `6.5244` |
| **Longitude** | GPS longitude of the solar panel location | `3.3792` |

4. Click **Next: Create Listing**.

This creates a `SolarInstallation` record in the platform database and registers the installation on-chain. The installation ID is used to link all future listings and energy deliveries to this specific physical installation.

> ℹ️ **Note:** You can register multiple solar installations at different locations. Each installation can have its own independent listings.

---

## Step 2: Create an Energy Listing

After registering the installation, the second step creates the market listing that buyers will see.

### How to Create a Listing

In the listing form (which follows directly from Step 1), fill in:

| Field | Description | Example |
|-------|-------------|---------|
| **Price per kWh (HBAR)** | How much you charge per kilowatt-hour | `0.05` ℏ/kWh |
| **Available Units (kWh)** | How many kWh you are making available for sale | `100` kWh |

Click **Create** to publish the listing.

Your listing immediately appears in the energy market table and is visible to all buyers on the platform.

### Worked Example

A 5kW solar installation running 6 hours of peak sun per day generates approximately 30 kWh per day. If a household uses 10 kWh, 20 kWh of surplus is available to sell. At 0.05 ℏ/kWh, that is 1 ℏ per day in revenue — roughly $0.07/day, or $25/year at current testnet reference prices. On mainnet with real HBAR prices and larger installations, the economics scale significantly.

---

## Managing Your Listings

### The Energy Market Table

Your listings appear in the energy market table visible to all users. The table shows:

- **Location / City** — Where the solar installation is located.
- **Capacity (kW)** — The installation's rated output.
- **Available kWh** — How many units remain for sale.
- **Price per kWh** — Your HBAR price per unit.
- **Operator Tier** — Your Bronze, Silver, or Gold tier badge.

Buyers browsing the market can use this information to select the best listing for their needs.

### When Units Sell Out

When all `availableUnits` in a listing are purchased, the listing shows as sold out. To continue selling energy, create a new listing for the same installation:

1. Go to **Dashboard → Energy**.
2. Click **+ List Energy** again.
3. Skip the installation registration (your existing installation is already on record).
4. Enter new `availableUnits` and optionally adjust the price.
5. Click **Create**.

### Adjusting Your Price

There is no in-place price edit — to change your price, let the current listing sell through or contact support, then create a new listing with the updated price.

---

## IoT Delivery Confirmation

On mainnet, energy delivery is verified by a decentralized oracle network before funds are released to you:

1. **Buyer purchases kWh** — Payment is escrowed in the EnergyMarket smart contract.
2. **IoT meter reads energy output** — Your solar installation's smart meter records actual generation.
3. **Oracle nodes report** — At least 3 out of 5 oracle nodes submit the same reading.
4. **Delivery confirmed** — The contract releases the escrowed HBAR to your account.
5. **HEC minted** — Hedera Energy Credits (1 HEC = 1 kWh) are minted to your account as a verifiable record of renewable generation.

> ℹ️ **On Testnet:** IoT delivery is simulated. When a buyer clicks Confirm Purchase, the EnergyTrade is created and funds are transferred immediately without waiting for oracle confirmation. This allows testing the full flow without physical hardware.

---

## Dispute Resolution

If a buyer claims energy was not delivered, the EnergyMarket contract has a **24-hour dispute window** after purchase. Within that window:

- A buyer can flag the trade as disputed.
- An admin reviews the IoT oracle data.
- If delivery is confirmed, funds release to you. If not confirmed, the buyer is refunded.

This protects both parties and ensures the energy market operates on real-world data rather than trust alone.

---

## Pricing Tips

### Competitive Pricing
Research what other operators in your city are charging. The energy market table is publicly visible — browse it as a buyer to understand local rates before setting your own price.

### Seasonal Variation
Solar output varies with seasons and weather. During the dry season (higher sun hours), you will have more surplus to sell and can potentially lower prices to move more volume. During the rainy season, reduce available units to match actual production.

### Tier Premium
Gold-tier operators with a strong reputation score can charge a slight premium — buyers who value reliability and dispute protection will pay more for an established operator's listings.

---

## Related Pages

- [Tracking Earnings](tracking-earnings.md) — See revenue from energy trades.
- [Staking & Tiers](staking-and-tiers.md) — Advance to Gold tier for better market visibility.
- [HEC Token](../tokens/hec.md) — Learn more about the Hedera Energy Credits you earn.
