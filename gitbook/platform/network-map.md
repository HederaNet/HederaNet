# Network Map

The **Network Map** (`/map`) shows the geographic distribution of all HederaNet infrastructure across Africa. It is public — no account required.

Access it from the **Network Map** link in the top navigation bar.

---

## Map Layers

Three infrastructure layers can be toggled independently using the **Layers** panel in the top-right corner of the map:

| Layer | Icon | Colour | What It Shows |
|-------|------|--------|--------------|
| **Internet Hotspots** | 📡 | Blue | Active and offline WiFi mesh nodes |
| **Solar Energy** | ☀️ | Amber | Solar installations with active energy listings |
| **Edge Compute** | ⚡ | Purple | Edge compute nodes (coming soon to testnet) |

Internet and Solar Energy are enabled by default. Toggling a layer on or off immediately shows or hides the corresponding markers on the map.

---

## The Sidebar

A collapsible sidebar on the left lists all nodes for the currently selected layer. Use the three tabs at the top of the sidebar to switch between **Internet**, **Solar**, and **Compute**.

Each row in the sidebar shows:

- **Status dot** — coloured if online, grey if offline
- **Label** — "Hotspot · ABC123" for internet nodes, "Solar · 5 kW" for solar installations
- **Sub-line** — uptime and monthly price for hotspots; city name for solar installations
- **Coordinates** — latitude and longitude in small monospace text

### Navigating to a Node

Click any row in the sidebar to fly the map directly to that node's location. The map smoothly animates to zoom level 14, centred on the selected node. Click the marker on the map to open its detail popup.

Use the **‹** / **›** button to collapse or expand the sidebar.

---

## Marker Popups

### Internet Hotspot Popup

Clicking a blue marker opens a popup with:

| Field | Description |
|-------|-------------|
| **Status** | Online (green dot) or Offline |
| **Node ID** | Truncated hotspot ID |
| **Monthly Price** | Cost in ℏ per 30-day subscription |
| **30-Day Uptime** | Percentage shown in green (≥95%) or amber (<95%) |
| **Coverage Radius** | Radius in metres of WiFi coverage |
| **Subscribe button** | Subscribes you immediately — requires sign-in |

### Solar Energy Popup

Clicking an amber marker opens a popup with:

| Field | Description |
|-------|-------------|
| **Location** | City and country, plus operator tier |
| **Capacity** | Panel capacity in kilowatts (kW) |
| **Active Listings** | Number of open energy listings on this installation |
| **Price** | Lowest available price in ℏ/kWh |
| **Available** | Total kWh currently available for purchase |
| **Browse listings link** | Takes you to the Energy page in the Dashboard |

---

## Data Freshness

Map data refreshes every **60 seconds**. If a new hotspot is deployed or a solar installation is registered while you have the map open, it will appear on the next refresh without requiring a page reload.

---

## Relationship to the Market Marketplace

The Network Map and the [Market Marketplace](/explore) show overlapping data from different perspectives:

| | Network Map (`/map`) | Market Marketplace (`/explore`) |
|--|----------------------|----------------------------------|
| **Format** | Interactive map, geographic view | Card list, sortable and filterable |
| **Navigation** | Click sidebar item → fly to location | Scroll / filter cards |
| **Best for** | "Where is the nearest node?" | "What is the cheapest listing?" |
