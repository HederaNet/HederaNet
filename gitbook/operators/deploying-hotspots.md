# Deploying Hotspots

WiFi hotspots are the primary internet infrastructure on HederaNet. As an operator, you deploy hotspots at physical locations, set a subscription price, and earn HBAR each time a subscriber pays. This page walks you through the full deployment process and how to manage your hotspot fleet.

---

## Prerequisites

- You must be registered as an **Operator** (see [Becoming an Operator](becoming-an-operator.md)).
- You need the GPS coordinates of your hotspot location.
- You should have a physical WiFi access point device installed at the location.

---

## Deploying a New Hotspot

### Step 1: Go to the Hotspots Page

Navigate to **Dashboard → Hotspots** or go directly to `/dashboard/hotspots`.

### Step 2: Click "+ Deploy Hotspot"

Click the **+ Deploy Hotspot** button in the top right of the page. This opens the deployment form.

### Step 3: Fill in the Hotspot Details

| Field | Description | Example |
|-------|-------------|---------|
| **Latitude** | GPS latitude of the hotspot device | `6.5244` (Lagos, Nigeria) |
| **Longitude** | GPS longitude of the hotspot device | `3.3792` (Lagos, Nigeria) |
| **Coverage Radius (meters)** | How far the WiFi signal reaches from this point | `250` |
| **Monthly Price (HBAR)** | What subscribers pay per month in ℏ | `5` |

> 💡 **Tip — Finding your coordinates:** Open [maps.google.com](https://maps.google.com), navigate to your hotspot location, right-click on the exact spot, and select the coordinates that appear. The first number is latitude, the second is longitude.

> 💡 **Tip — Coverage radius:** A typical home WiFi router has a radius of 30–50m indoors. An outdoor directional antenna can cover 200–1000m. Be honest about your radius — subscribers rely on it to know if they are within range.

### Step 4: Click "Deploy"

Click the **Deploy** button. The platform will:

1. Register your hotspot in the database.
2. Create a new **Hedera Consensus Service (HCS) topic** specifically for this hotspot.
3. Return the hotspot's unique ID, HCS topic ID, and installation date.

The hotspot appears immediately in your hotspot list with **Active** status.

---

## What Happens On-Chain

Every hotspot deployment creates a permanent on-chain record:

- **HCS Topic** — A unique, immutable log channel is created for the hotspot on Hedera. All service quality events, connectivity measurements, and activity logs for that hotspot are published to this topic. The log cannot be altered or deleted.
- **Hotspot Record** — The hotspot's coordinates, radius, price, and operator address are stored in the platform database (with the on-chain HCS topic as the verifiable anchor).

To verify your hotspot on HashScan:
1. Open your hotspot's **View Details** panel.
2. Click the **HashScan** link next to the HCS Topic ID.
3. The topic page at `https://hashscan.io/testnet/topic/YOUR_TOPIC_ID` shows all messages published to that hotspot's log.

---

## Understanding the Node ID

Each hotspot is assigned a **Node ID** — a short identifier displayed in your hotspot list. The format uses the last 6 characters of the full internal ID in uppercase (e.g., `A3F9C2`). Subscribers may reference this when reporting issues or looking up a specific hotspot.

---

## Managing Your Hotspots

### Viewing Hotspot Details

Click **View Details** on any hotspot card to see:

| Detail | Description |
|--------|-------------|
| **HCS Topic ID** | The Hedera Consensus Service topic for this hotspot's log |
| **HashScan Link** | Direct link to view the topic on HashScan |
| **Installation Date** | When the hotspot was deployed |
| **Coverage Radius** | The radius in meters |
| **Monthly Price** | Current subscription price in HBAR |
| **Status** | Active or Inactive |

### Deactivating a Hotspot

If you need to take a hotspot offline (maintenance, relocation, or hardware issue), click **Deactivate** on the hotspot card. Active subscribers will see the hotspot as unavailable. Their current subscription period continues but cannot be renewed until reactivation.

### Reactivating a Hotspot

Click **Reactivate** to bring the hotspot back online. It immediately becomes available to new subscribers.

> ⚠️ **Warning:** Frequently toggling hotspots off and on negatively impacts your reputation score and may deter subscribers who look for high-uptime nodes. Only deactivate for genuine reasons.

---

## Pricing Strategy

### Competitive Pricing

In most African cities, a competitive WiFi hotspot subscription is in the range of **2–10 ℏ/month** (approximately $0.14–$0.70 at $0.07/ℏ). Research local operator prices in the governance discussions to understand the market rate in your city.

### Premium Pricing

If you offer a high-uptime hotspot with a large coverage radius in a high-demand area (near schools, markets, or transport hubs), you can charge a premium. Subscribers will pay more for reliable, well-located connectivity.

### Adjusting Prices

To change your hotspot's subscription price, deactivate the hotspot, redeploy with the new price, or contact support if the platform UI supports in-place price editing.

---

## Tips for Success

1. **Choose high-traffic locations** — Markets, transport hubs, schools, and health centres generate the most subscriptions per hotspot.
2. **Use outdoor-grade hardware** — Consumer routers degrade quickly outdoors. Choose hardware rated for outdoor or tropical environments.
3. **Set an accurate radius** — Overstating your range leads to subscriber complaints and a lower reputation score.
4. **Monitor your uptime** — The platform tracks uptime. A hotspot that is offline frequently will score poorly and lose subscribers to more reliable operators.
5. **Deploy multiple hotspots** — Earnings scale linearly with the number of active, well-subscribed hotspots in your fleet.
