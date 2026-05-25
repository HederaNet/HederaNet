# Becoming an Operator

Operators are the backbone of the HederaNet network. They own and deploy physical infrastructure — WiFi hotspots and solar panels — and earn HBAR for every unit of service their equipment provides.

***

## What Operators Do

As an operator, you can:

* **Deploy WiFi hotspots** — set a monthly subscription price and earn HBAR each time a subscriber pays.
* **List solar energy** — register your solar installation and sell excess energy at your chosen price per kWh.
* **Stake HBAR** — lock HBAR to advance through Bronze, Silver, and Gold tiers with increasing reward multipliers.
* **View earnings analytics** — a dedicated earnings page tracks all your revenue by type and over time.

***

## Requirements

| Requirement            | Details                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **HederaNet account**  | Any signed-in account (email or Google)                                                                 |
| **GPS coordinates**    | Latitude and longitude of your installation location                                                    |
| **Physical equipment** | A WiFi hotspot device and/or solar panel installation (real hardware for mainnet; simulated on testnet) |

***

## How to Register as an Operator

Operator registration is done inline — no separate page required. When you navigate to any operator-gated feature as a SUBSCRIBER, a registration card appears directly on that page.

### Where the Registration Card Appears

* **Hotspots page** (`/dashboard/hotspots`) — when you try to deploy a hotspot
* **Energy page** (`/dashboard/energy`) — when you try to register a solar installation
* **Staking page** (`/dashboard/staking`) — before the staking interface loads

### Filling in the Registration Form

| Field        | Description                                   | Example        |
| ------------ | --------------------------------------------- | -------------- |
| **Country**  | The country where you are deploying           | Nigeria        |
| **City**     | The city or region                            | Lagos          |
| **Location** | Click the map or use GPS to pin your location | 6.5244, 3.3792 |

> 💡 **Tip:** Use the location picker on the form to drop a pin on the map for accurate coordinates. Accurate coordinates ensure subscribers can find your hotspot on the [Network Map](https://hederanet.online/map).

### After You Submit

When you click **Register**, the platform:

1. Creates your operator profile in the database.
2. Upgrades your account role from `SUBSCRIBER` to `OPERATOR`.
3. Issues a new authentication token with your updated role automatically.

**You do not need to log out or refresh.** The page updates immediately — operator features unlock right away.

***

## What Changes After Registration

| Feature                 | Before (SUBSCRIBER)               | After (OPERATOR)        |
| ----------------------- | --------------------------------- | ----------------------- |
| Deploy hotspots         | Blocked — registration card shown | Available               |
| Create energy listings  | Blocked — registration card shown | Available               |
| Stake HBAR              | Blocked — registration card shown | Available               |
| View earnings analytics | Blocked                           | Full earnings dashboard |
| Governance voting       | Available                         | Available               |
| Buying energy           | Available                         | Available               |
| Internet subscriptions  | Available                         | Available               |
| Using Swap              | Available                         | Available               |

***

## What You Can Earn

### Subscription Revenue (WiFi Hotspots)

When a subscriber pays the monthly price for your hotspot, the payment is settled on Hedera:

* **85%** goes directly to your Hedera account
* **10%** goes to the platform treasury
* **5%** goes to the community governance fund

Example: price your hotspot at 10 ℏ/month, get 20 subscribers → you earn 170 ℏ/month from that hotspot alone.

### Energy Trade Revenue

When a buyer purchases kWh from your energy listing, the HBAR payment flows directly to your account upon IoT-confirmed delivery.

### Reward Multipliers by Tier

Staking HBAR unlocks higher reward multipliers:

| Tier   | Min Staked | Multiplier |
| ------ | ---------- | ---------- |
| Bronze | 0 ℏ        | 1×         |
| Silver | 100 ℏ      | 1.5×       |
| Gold   | 500 ℏ      | 2×         |

***

## Next Steps

Now that you are an operator:

* [Deploy your first hotspot](deploying-hotspots.md)
* [Register a solar installation](solar-energy.md)
* [Stake HBAR and advance your tier](staking-and-tiers.md)
* [Monitor your earnings](tracking-earnings.md)
