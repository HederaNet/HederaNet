# Chain Explorer

The **Chain Explorer** (`/explorer`) is HederaNet's public proof-of-impact and transaction explorer. It is accessible to anyone without an account and refreshes automatically every 15–60 seconds.

Every metric, operator profile, and transaction shown here is verifiable on Hedera Hashgraph — click any transaction hash to open it on [HashScan](https://hashscan.io/testnet).

---

## Accessing the Explorer

The Explorer is linked in the top navigation bar under **Explorer**. No sign-in required.

```
https://hederanet.vercel.app/explorer
```

---

## What the Explorer Contains

The page is divided into four sections, from top to bottom:

| Section | What It Shows |
|---------|--------------|
| **Live Network Metrics** | Six key stats pulled from the HederaNet API every 60 s |
| **Live Network Stats** | Detailed breakdown of operator, energy, and subscriber activity |
| **On-Chain Transaction Feed** | Every transaction recorded on the platform, filterable by type |
| **Operator Profiles** | Active operators with on-chain verification links |
| **On-Chain Verification** | HCS topics and HTS token IDs you can verify on HashScan |

---

## Live Network Metrics

Six stat cards are displayed at the top of the page:

| Metric | Description |
|--------|-------------|
| **Active Hotspot Nodes** | Internet mesh nodes currently operating |
| **Community Wallets** | Individual Hedera accounts using the network |
| **Energy Traded Today** | kWh of peer-to-peer solar energy sold on-chain today |
| **HBAR Settled** | Total on-chain payments processed to date |
| **Active Subscriptions** | Live internet subscriptions held by community members |
| **Operators** | Registered infrastructure entrepreneurs |

These metrics are sourced from the HederaNet API, which aggregates on-chain data every 60 seconds.

---

## On-Chain Transaction Feed

The Transaction Feed shows every transaction that has been processed through the HederaNet platform. It auto-refreshes every **15 seconds**.

### Filtering

Use the filter tabs above the table to narrow by transaction type:

| Filter | What It Shows |
|--------|--------------|
| **All Types** | Every transaction (default) |
| **SWAP** | Token swaps executed via the Swap page |
| **FAUCET** | Testnet USDC faucet claims |
| **SUBSCRIPTION** | Hotspot subscription payments |
| **ENERGY TRADE** | Peer-to-peer solar energy purchases |
| **STAKE** | HBAR stake deposits |
| **UNSTAKE** | HBAR stake withdrawals |
| **REWARD** | Staking reward disbursements |

### Table Columns

| Column | Description |
|--------|-------------|
| **Tx Hash** | The Hedera transaction ID — click to open on HashScan, or copy with the ⎘ button |
| **Type** | Color-coded badge indicating the transaction category |
| **Details** | Human-readable summary — e.g. `2 USDC → 22.09 HBAR` for a swap, or `Testnet USDC faucet claim` for a faucet tx |
| **From → To** | Abbreviated Hedera account IDs of the sender and recipient |
| **Amount (ℏ)** | The HBAR amount involved in the transaction |
| **USD Value** | HBAR amount × live HBAR/USD price from CoinGecko |
| **Status** | `SUCCESS` (green), `FAILED` (red), or `PENDING` (yellow) |

> Timestamps are intentionally omitted — click the transaction hash to view the exact block time on HashScan.

### Simulated Transactions

If a transaction shows **Simulated** in the Tx Hash column instead of a hash, it means the platform recorded the event in its database but no on-chain transfer was completed (for example, if an on-chain step failed after a partial execution). Simulated entries do not produce a verifiable Hedera transaction ID.

### Pagination

The table shows 20 transactions per page. Use the **← Prev** / **Next →** buttons at the bottom of the table to navigate. The total transaction count is shown in the top-right corner of the section.

---

## Operator Profiles

The Operator Profiles section lists active operators registered on the network. Each card shows:

- The operator's city and country
- Their tier (Bronze / Silver / Gold)
- Hotspot count and solar installation count
- Reputation score and staked HBAR
- A direct link to the operator's Hedera account on HashScan

---

## On-Chain Verification

The On-Chain Verification section links to the raw Hedera entities that power the platform:

### HCS Topics (Testnet)

| Topic ID | Name | Purpose |
|----------|------|---------|
| 0.0.1005 | Service Quality Topic | Hotspot uptime confirmations and quality scores |
| 0.0.1006 | Governance Topic | On-chain governance proposals and votes |
| 0.0.1007 | Energy Trading Topic | IoT-confirmed energy delivery records |

### HTS Tokens (Testnet)

| Token ID | Symbol | Description |
|----------|--------|-------------|
| 0.0.7153593 | HNET | Governance and staking token |
| 0.0.7153605 | HEC | Energy credit token (1 HEC = 1 kWh) |
| 0.0.7153651 | HCC | Compute credit token |
| 0.0.7153666 | REP NFT | Operator reputation NFT collection |

Click any entity ID in this section to open it live on [HashScan](https://hashscan.io/testnet).

---

## Data Freshness

| Data | Refresh Rate |
|------|-------------|
| Network metrics | Every 60 seconds |
| Transaction feed | Every 15 seconds |
| HBAR/USD price (used for USD values) | Every 5 minutes via CoinGecko |
| Operator profiles | Every 2 minutes |
| HCS topic messages | Every 60 seconds |

---

## Sharing the Explorer

The Explorer is fully public. Share the URL for grant applications, investor updates, or community reports:

```
https://hederanet.vercel.app/explorer
```
