# Market Marketplace

The **Market** page (`/explore`) is HederaNet's open marketplace — no account required to browse. It shows every active internet hotspot, solar energy listing, and compute offering on the network in real time.

It is accessible from the **Market** link in the top navigation bar.

***

## What You Can Do

| Action                              | Requires Account? |
| ----------------------------------- | ----------------- |
| Browse all active listings          | No                |
| Filter by service type and location | No                |
| View operator details and pricing   | No                |
| Subscribe / purchase a listing      | Yes               |

***

## Filtering and Search

Use the filter bar at the top of the page to narrow results:

* **Service Type** — toggle between Internet, Energy, and Compute listings
* **Country / Region** — filter by the country where the infrastructure is deployed
* **Price range** — slider to set a maximum cost per unit
* **Availability** — show only listings with active capacity right now

Results update immediately as you adjust filters — no page reload needed.

***

## Reading a Listing Card

Each card shows:

| Field            | What It Means                                                        |
| ---------------- | -------------------------------------------------------------------- |
| **Operator**     | The wallet address (or display name) of who deployed this node       |
| **Service Type** | Internet (Wi-Fi), Solar Energy, or Compute                           |
| **Location**     | Country and region — exact GPS coordinates are not published         |
| **Price**        | Cost per unit — ℏ per month for internet, ℏ/kWh for energy           |
| **Uptime**       | Rolling 30-day availability percentage from on-chain quality reports |
| **Reputation**   | The operator's tier: Bronze, Silver, or Gold                         |

***

## Subscribing to an Internet Listing

1. Click **Subscribe** on any internet listing card.
2. If you are not signed in you will be prompted to create an account or log in.
3. Review the plan details: duration, price, and token required.
4. Confirm — your payment is sent in a single Hedera transaction that finalises in 3–5 seconds.
5. The operator's subscription contract activates your session immediately upon payment confirmation.

***

## Buying Energy

1. Click **Buy** on any energy listing card.
2. Review the kWh amount and total price in HBAR.
3. Confirm the transaction.
4. Your purchased credits appear in your dashboard under **Energy**.

***

## No Listing Near You?

If there are no active listings in your area, you have two options:

1. **Become an operator** — deploy your own hotspot or solar installation and start earning. See [Becoming an Operator](../operators/becoming-an-operator.md).
2. **Use USSD** — HederaNet's USSD service (`*384*1#`) routes you to the nearest available operator even without internet access. See [USSD Access](../subscribers/ussd-access.md).

***

## Relationship to the Network Map

The Market Marketplace and the [Network Map](https://hederanet.online/map) show similar infrastructure but serve different purposes:

|                     | Market (`/explore`)          | Network Map (`/map`)                        |
| ------------------- | ---------------------------- | ------------------------------------------- |
| **Purpose**         | Browse and purchase listings | See geographic distribution                 |
| **Format**          | Cards with pricing detail    | Interactive map with markers                |
| **Clicking a node** | Opens full listing detail    | Opens a popup with subscribe/details action |
| **Filter**          | By type, price, availability | By layer (Internet / Solar / Compute)       |
