# Key Concepts

This page explains every technical concept used throughout the HederaNet documentation. No prior blockchain knowledge is assumed.

---

## DePIN

**Decentralized Physical Infrastructure Network.** A DePIN is a system where physical infrastructure — internet antennas, solar panels, compute nodes — is owned and operated by many independent individuals rather than a single company. Participants earn cryptocurrency rewards for contributing their hardware to the network. HederaNet is a DePIN focused on internet access and solar energy in Africa.

---

## Hedera Hashgraph

**The distributed ledger that powers HederaNet.** Unlike a traditional blockchain (which groups transactions into sequential blocks), Hedera uses a "hashgraph" data structure that allows thousands of transactions per second with finality in 3–5 seconds. It is governed by the Hedera Governing Council — a group of global enterprises including Google, IBM, and Boeing — providing enterprise-grade stability. Hedera is carbon-negative and vastly more energy-efficient than Proof-of-Work blockchains like early Ethereum.

---

## HCS (Hedera Consensus Service)

**A service for creating tamper-proof, public message logs.** When HederaNet creates a hotspot, it also creates an HCS topic — a permanent public channel where the hotspot's service quality events are recorded in order. Anyone can read these logs on HashScan. HCS is also used to log governance votes so they are publicly verifiable. Think of it as an unforgeable public bulletin board.

---

## HTS (Hedera Token Service)

**A native service for issuing and managing tokens on Hedera.** All HederaNet tokens — HNET, HEC, HCC, and our testnet USDC — are HTS tokens. HTS handles transfers, supply management, and token configuration (such as making Reputation NFTs non-transferable). Because HTS is a native Hedera service (not a smart contract), token operations are faster and cheaper than ERC-20 tokens on Ethereum.

---

## HSCS (Hedera Smart Contract Service)

**A service for running Solidity smart contracts on Hedera.** HSCS powers the three HederaNet contracts: EnergyMarket (0.0.7153712), ServicePayment (0.0.7153764), and Governance (0.0.7153782). Smart contracts are programs that execute automatically when their conditions are met — for example, automatically splitting an energy payment 85/10/5 the moment it arrives.

---

## HBAR

**Hedera's native cryptocurrency.** HBAR (symbol: ℏ) is used for all fees on the Hedera network and is HederaNet's primary payment currency for both internet subscriptions and energy purchases. It is publicly traded on exchanges like Binance and Coinbase at a live market-determined price (displayed in real time on the Swap page, sourced from CoinGecko). Total supply is capped at 50 billion HBAR, controlled by the Hedera Governing Council.

---

## Testnet vs Mainnet

**Two separate environments.** The testnet is a sandbox where tokens have no real monetary value, allowing developers and users to experiment without financial risk. Mainnet is the production environment where all tokens have real value and real money is at stake. HederaNet currently runs on testnet. When mainnet launches, custodial accounts will migrate to non-custodial user-held keys, and our testnet USDC will be replaced by Circle's official Hedera USDC.

---

## Custodial Account (Testnet)

**An account where the platform holds your private key on your behalf.** When you create a HederaNet account on testnet, the platform automatically generates a Hedera account and stores the encrypted private key in our database (AES-256-GCM encrypted). This means you do not need a wallet extension or any technical knowledge to get started. On mainnet, accounts will be non-custodial — you hold your own keys using a wallet like HashPack.

---

## Tier System

**A three-level operator ranking based on staked HBAR.** Operators stake HBAR to unlock higher reward multipliers:
- **Bronze** — 0+ ℏ staked, 1× reward rate
- **Silver** — 100+ ℏ staked, 1.5× reward rate
- **Gold** — 500+ ℏ staked, 2× reward rate

Reaching a higher tier signals commitment to the network (staked funds are locked) and directly increases earnings from all services.

---

## Reputation Score

**A number that represents an operator's track record.** Reputation is built over time through consistent uptime, positive service delivery, and governance participation. It is partially encoded in non-transferable Reputation NFTs minted for milestones. Reputation score multiplies HNET voting power in governance — an established operator with a high reputation has proportionally more governance influence than a brand-new participant with the same token balance.

---

## Governance

**The system through which token holders control HederaNet.** Any authenticated user can propose changes to the network. Voting weight equals HNET balance multiplied by reputation score. Proposals go through a lifecycle (PENDING → ACTIVE → PASSED/REJECTED → EXECUTED) and votes are permanently recorded via HCS. The Governance smart contract at 0.0.7153782 enforces the results on-chain.

---

## IoT Oracle

**A trusted data bridge between physical devices and the blockchain.** Smart contracts cannot read physical world data on their own. HederaNet uses an oracle network — a set of trusted nodes that independently read IoT meter data from solar installations and report the measurements on-chain. The system uses a 3-of-5 multi-signature design: at least 3 out of 5 oracle nodes must agree on a reading before it is accepted. This prevents a single rogue oracle from falsifying energy delivery data.

---

## Mirror Node

**A read-only replica of the Hedera ledger.** The HederaNet API queries Hedera's mirror node to fetch live HBAR balances, token balances, and transaction history without submitting its own transactions. This is how your HBAR balance on the staking page is always up to date — it is read directly from the Hedera mirror node, not from a local database that could be stale.

---

## HashScan

**Hedera's public block explorer.** HashScan at [https://hashscan.io/testnet](https://hashscan.io/testnet) lets anyone inspect accounts, transactions, tokens, smart contracts, and HCS topics on the Hedera testnet. Your HederaNet account ID links directly to your HashScan page. Every hotspot's HCS topic is viewable there. Every governance vote is auditable there. Transparency is not a marketing claim — it is a verifiable technical property.
