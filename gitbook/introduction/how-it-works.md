# How It Works

HederaNet connects four types of actors — Operators, Subscribers, Energy Buyers, and Governance Participants — through a set of smart contracts and the Hedera Consensus Service. This page walks through the end-to-end flow for each actor so you understand exactly what happens from sign-up to earning or receiving a service.

---

## Operators: Deploy Infrastructure, Earn HBAR

Operators are the backbone of HederaNet. They own physical devices (WiFi hotspots, solar panels) and register them on the platform to monetize them.

```
Operator Flow
─────────────────────────────────────────────────────────
  [1] Sign up at hederanet.vercel.app
        │
        ▼
  [2] Register as Operator
      (Dashboard → Register: fill country, city, lat, lng)
        │
        ▼
  [3a] Deploy WiFi Hotspot              [3b] Register Solar Panel
      (lat, lng, radius, monthly price)     (capacity kW, lat, lng)
        │                                       │
        ▼                                       ▼
  HCS Topic created for hotspot          Create energy listing
  (logged on Hedera forever)             (price/kWh, available kWh)
        │                                       │
        ▼                                       ▼
  [4] Subscribers pay monthly HBAR      Buyers purchase kWh
      Smart contract splits payment:    IoT oracle confirms delivery
      85% → Operator                    HEC minted to operator
      10% → Platform
       5% → Community fund
        │
        ▼
  [5] Track earnings in /dashboard/earnings
      Area chart + transaction history
      Stake HBAR → advance to Silver/Gold tier
      → higher reward multiplier (1× / 1.5× / 2×)
─────────────────────────────────────────────────────────
```

**Key steps in plain language:**
1. Create an account and complete the operator registration form.
2. Deploy a hotspot by entering its GPS coordinates, coverage radius, and monthly subscription price in HBAR.
3. Hedera Consensus Service creates a permanent, tamper-proof log topic for that hotspot.
4. Subscribers pay; the ServicePayment smart contract automatically distributes the HBAR.
5. Stake more HBAR to reach Silver or Gold tier and multiply your earnings rate.

---

## Subscribers: Pay for Internet Access

Subscribers are the customers of the network. They pay operators for internet access using HBAR.

```
Subscriber Flow
─────────────────────────────────────────────────────────
  [1] Sign up (email or Google OAuth)
      Hedera testnet account auto-created
        │
        ▼
  [2] Browse hotspots
      (map or explore page showing coverage radius,
       monthly price, uptime%)
        │
        ▼
  [3] Select a hotspot → Subscribe
      Pay monthly price in HBAR
        │
        ▼
  [4] ServicePayment contract executes
      85% → Operator wallet
      10% → Platform treasury
       5% → Community governance fund
        │
        ▼
  [5] Active subscription shows in dashboard
      Internet access active for 30 days
      Renew before expiry to maintain access
─────────────────────────────────────────────────────────
```

**What to look for when choosing a hotspot:**
- Coverage radius: does it cover your location?
- Monthly price in HBAR: competitive pricing varies by city.
- Uptime percentage: higher uptime means more reliable service.
- Operator tier: Gold-tier operators have more stake locked in, signaling commitment.

---

## Energy Buyers: Purchase Verified Solar Energy

Energy buyers purchase kilowatt-hours directly from local solar operators at market-set prices.

```
Energy Buyer Flow
─────────────────────────────────────────────────────────
  [1] Sign in to hederanet.vercel.app
        │
        ▼
  [2] Go to Dashboard → Energy
      Browse listings table:
      (city, capacity kW, available kWh, price/kWh in ℏ, tier)
        │
        ▼
  [3] Click "Buy" on a listing
      Modal shows: location, price, available units
      Enter kWh amount to purchase
      Live total cost = amount × price shown
        │
        ▼
  [4] Confirm Purchase
      EnergyMarket contract (0.0.7153712) executes
      HBAR transferred from buyer to operator
        │
        ▼
  [5] IoT oracle network confirms energy delivery
      3-of-5 oracle multi-sig required for finalization
      HEC (Hedera Energy Credits) minted to operator
      EnergyTrade record created on-chain
─────────────────────────────────────────────────────────
```

> ℹ️ **Note:** On testnet, IoT delivery is simulated. On mainnet, physical IoT meters report actual solar generation, which the oracle network validates before finalizing the trade.

---

## Governance Participants: Shape the Network

Any authenticated user can vote on proposals. Creating proposals and earning governance weight requires holding HNET tokens.

```
Governance Flow
─────────────────────────────────────────────────────────
  [1] Hold HNET tokens
      (earn as operator reward, or swap USDC → HNET
       on the market page)
        │
        ▼
  [2] Optionally: Create a Proposal
      Governance (top nav) → "+ New Proposal"
      Title (≥10 chars), Description (≥50 chars),
      Voting period (3–30 days)
        │
        ▼
  [3] Proposal lifecycle:
      PENDING → (voting opens) → ACTIVE
        │
        ▼
  [4] Community votes YES / NO / ABSTAIN
      Voting weight = HNET balance × reputation score
      All votes published to Governance HCS topic
      (publicly verifiable on HashScan)
        │
        ▼
  [5] Voting period ends:
      >50% YES + quorum met → PASSED → EXECUTED
      Otherwise → REJECTED
─────────────────────────────────────────────────────────
```

**Examples of what governance decides:**
- Adjusting the 85/10/5 payment split
- Adding new supported countries for USSD
- Changing tier thresholds (Bronze/Silver/Gold)
- Approving major network upgrades
- Prioritizing new feature development

---

## How Everything Connects

At the center of all these flows is Hedera Hashgraph:

- **Hedera Token Service (HTS)** — Issues and transfers HBAR, HNET, HEC, HCC, and USDC.
- **Hedera Consensus Service (HCS)** — Provides tamper-proof, timestamped logs for hotspot activity, governance votes, and oracle confirmations.
- **Hedera Smart Contract Service (HSCS)** — Runs the EnergyMarket, ServicePayment, and Governance contracts that automate payments and decisions.
- **Mirror Node** — The read layer that the HederaNet API queries for balances, transaction history, and token states.

Every action on HederaNet — paying for internet, buying energy, casting a vote — produces a verifiable on-chain record that anyone can inspect at [https://hashscan.io/testnet](https://hashscan.io/testnet).
