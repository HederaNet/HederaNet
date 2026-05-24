# Your Dashboard

The dashboard is the operational hub for HederaNet operators and subscribers. It is accessible at `/dashboard` after signing in and contains pages for managing hotspots, energy listings, and earnings.

---

## The Top Navigation Bar

The main navigation bar — visible on every page — provides direct access to the most-used platform features:

| Link | URL | Who Uses It |
|------|-----|------------|
| **Network Map** | `/map` | Everyone — browse infrastructure geographically |
| **Market** | `/explore` | Everyone — browse listings without an account |
| **Explorer** | `/explorer` | Everyone — live transaction feed and network metrics |
| **Governance** | `/dashboard/governance` | HNET holders — vote on proposals |
| **Staking** | `/dashboard/staking` | Operators — stake HBAR for tier advancement |
| **Swap** | `/dashboard/market` | Signed-in users — swap tokens, check prices, claim faucet |

> **Sign In button** is always in the top-right corner of the nav bar.

---

## The Dashboard Navigation Bar

Inside the dashboard (`/dashboard/...`) a secondary horizontal tab bar appears at the top of the content area with four links:

| Tab | URL | What It Does |
|-----|-----|-------------|
| **Overview** | `/dashboard` | Live network stats and summary cards |
| **Hotspots** | `/dashboard/hotspots` | Deploy and manage WiFi hotspots |
| **Energy** | `/dashboard/energy` | Register solar installations, manage energy listings |
| **Earnings** | `/dashboard/earnings` | Earnings chart and full transaction history |

Governance, Staking, and Swap are accessed directly from the top nav bar rather than the dashboard tabs — they are first-class features, not sub-pages.

---

## Overview Page (`/dashboard`)

The first page you see when entering the dashboard. It displays four live stat cards:

| Card | What It Shows |
|------|--------------|
| **Active Hotspots** | Total deployed and active hotspots across the network |
| **Earnings Today** | Total HBAR earned by all operators in the last 24 hours |
| **Network Nodes** | Total registered nodes (hotspots + solar installations) |
| **Energy Traded** | Total kWh of solar energy transacted on the platform |

---

## Hotspots (`/dashboard/hotspots`)

For operators deploying WiFi coverage nodes. You can:

- View all your deployed hotspots with status, location, and coverage radius.
- Deploy a new hotspot with the **+ Deploy Hotspot** button.
- Toggle a hotspot between Active and Inactive.

> **Not an operator yet?** An inline registration card appears on this page. Fill in your country, city, and GPS coordinates and click **Register as Operator**. Your role upgrades immediately — no re-login required.

---

## Energy (`/dashboard/energy`)

A dual-purpose page for operators and buyers:

- **Operators** register solar installations and create energy listings with a price per kWh.
- **Buyers** browse available energy listings and purchase kWh from local operators.

> **Not an operator yet?** The same inline registration card shown on the Hotspots page appears here for the operator-specific actions.

---

## Earnings (`/dashboard/earnings`)

Your financial history:

- Summary row: Total Earned (in HBAR), transaction count, and average transaction value.
- Area chart of earnings over the last 14 days.
- Transaction history table with type, HBAR amount, and status.

---

## Governance (`/dashboard/governance`) — Top Nav

Accessible directly from the **Governance** link in the top nav. Shows all network proposals and lets you participate:

- View proposals filtered by status: ACTIVE, PENDING, PASSED, or REJECTED.
- Create a proposal with the **+ New Proposal** button.
- Cast your vote (YES / NO / ABSTAIN) on active proposals.
- See live vote percentages on each proposal card.

---

## Staking (`/dashboard/staking`) — Top Nav

Accessible directly from the **Staking** link in the top nav. Manages your HBAR stake:

- Live HBAR balance fetched from the Hedera mirror node.
- Tier card showing your current tier (Bronze / Silver / Gold) and the requirements for each.
- Stake form to deposit HBAR and advance your tier.
- Unstake to withdraw staked HBAR (triggers a tier reduction warning).

> **Not an operator yet?** An inline registration card appears here before the staking interface.

---

## Swap (`/dashboard/market`) — Top Nav

Accessible directly from the **Swap** link in the top nav. Your built-in token exchange:

- **Price ticker** — current rates for all 5 tokens.
- **Portfolio overview** — total USD value, per-token balances fetched live from the Hedera mirror node.
- **Swap interface** — exchange any token for any other token.
- **USDC Faucet** — claim 100 free testnet USDC every 24 hours.
- **Swap history** — recent swaps with on-chain status.

---

## What's Next?

- [Deploying Hotspots](../operators/deploying-hotspots.md)
- [Solar Energy & Listings](../operators/solar-energy.md)
- [Staking & Tiers](../operators/staking-and-tiers.md)
- [Governance](../governance/how-governance-works.md)
- [Swap](../market/overview.md)
