# Glossary

A complete reference of all terms used in the HederaNet documentation, listed alphabetically.

---

## A

**AES-256-GCM**
A symmetric encryption algorithm (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode). HederaNet uses AES-256-GCM to encrypt Hedera private keys before storing them in the database on testnet. The encrypted ciphertext is useless without the server-side encryption key.

**Africa's Talking**
A pan-African developer platform that provides USSD, SMS, voice, and mobile money APIs across 18+ African countries. HederaNet uses Africa's Talking to power the USSD gateway accessible at *384*1#.

**Airtel Money**
A mobile money service operated by Airtel Africa, available in Uganda, Tanzania, Zambia, Malawi, the DRC, and the Republic of Congo. Supported as a HederaNet withdrawal provider.

---

## B

**BRONZE**
The entry-level operator tier. All operators start at Bronze (0+ ℏ staked) with a 1× reward multiplier. No minimum stake required.

**BullMQ**
A Redis-based job queue library for Node.js. HederaNet uses BullMQ to handle asynchronous Hedera operations, oracle confirmations, and reward distributions without blocking the API request/response cycle.

---

## C

**Carbon-Negative**
Hedera Hashgraph offsets more carbon emissions than it generates. It purchases carbon credits that exceed its total energy consumption, making it net carbon-negative. This makes Hedera a natural fit for HederaNet's renewable energy focus.

**Custodial Account**
An account where a third party holds the private key on the user's behalf. On HederaNet testnet, accounts are custodial — the platform generates, encrypts, and stores your Hedera private key. On mainnet, accounts will be non-custodial (you hold your own keys).

---

## D

**DePIN**
Decentralized Physical Infrastructure Network. A system where physical infrastructure (WiFi hotspots, solar panels, compute nodes) is owned and operated by many independent community members rather than a single corporation. Participants earn cryptocurrency rewards for contributing their hardware to the network.

**Dispute Resolution**
The process for resolving contested energy trades. The EnergyMarket contract (0.0.7153712) allows buyers to open a dispute within 24 hours of purchase if energy was not delivered. An admin reviews IoT oracle data and either releases funds to the operator or issues a refund to the buyer.

---

## E

**EnergyListing**
A market offer created by a solar operator to sell a specified number of kWh at a set price in HBAR. Listed in the energy market table at `/dashboard/energy`, visible to all buyers.

**EnergyTrade**
A completed energy purchase transaction. Created when a buyer confirms a purchase from an EnergyListing. On mainnet, finalized after IoT oracle delivery confirmation.

**ESG**
Environmental, Social, and Governance — a framework used by investors and corporations to measure non-financial impact. HEC tokens (Hedera Energy Credits) are analogous to Renewable Energy Certificates (RECs) used in ESG compliance.

---

## F

**Faucet**
A service that dispenses free testnet tokens for testing. HederaNet's USDC Faucet provides 100 USDC per 24 hours to any authenticated user via the **Swap** page in the top navigation bar. Testnet-only — not available on mainnet.

**Flutterwave**
A Nigerian-founded payment infrastructure company providing mobile money disbursement APIs across Africa. HederaNet uses Flutterwave to process mobile money withdrawals (M-Pesa, MTN MoMo, Airtel Money).

---

## G

**GOLD**
The highest operator tier. Requires 500+ ℏ staked and provides a 2× reward multiplier — double the base reward rate on all services.

**Governance**
The system through which HNET token holders make collective decisions about the HederaNet network. Any authenticated user can vote; voting weight equals HNET balance × reputation score. Proposals go through PENDING → ACTIVE → PASSED/REJECTED → EXECUTED.

**Governance Topic**
The HCS topic (ID: 0.0.1006) where all governance votes are published as immutable messages. Viewable publicly on HashScan at `https://hashscan.io/testnet/topic/0.0.1006`.

---

## H

**HBAR**
Hedera's native cryptocurrency. Symbol: ℏ. Used for all payments, fees, and staking on HederaNet. 50 billion total supply. Publicly traded on Binance, Coinbase, and other exchanges. Live price displayed on the Swap page, sourced from CoinGecko.

**HCC**
Hedera Compute Credits. HTS token ID 0.0.7153651. Represents compute resource contributions. 6 decimal places. Infinite supply. AMM-derived price (initial seed: $0.0001, moves with trading).

**HCS (Hedera Consensus Service)**
A Hedera service for creating tamper-proof, ordered message logs called topics. HederaNet uses HCS to log hotspot activity and governance votes. Messages published to an HCS topic are permanent and publicly readable on HashScan.

**HEC**
Hedera Energy Credits. HTS token ID 0.0.7153605. 1 HEC = 1 kWh of verified solar energy. 2 decimal places. Infinite supply. AMM-derived price (initial seed: $0.002, moves with trading). Comparable to Renewable Energy Certificates.

**Hedera Hashgraph**
A distributed ledger technology that uses a directed acyclic graph (DAG) data structure rather than a traditional blockchain. Achieves 3-5 second finality, thousands of transactions per second, and is carbon-negative. Governed by the Hedera Governing Council (Google, IBM, Boeing, etc.).

**HashScan**
Hedera's public blockchain explorer at `https://hashscan.io`. Use `https://hashscan.io/testnet` for testnet activity. Allows viewing accounts, transactions, tokens, smart contracts, and HCS topics.

**HNET**
HederaNet governance and staking token. HTS token ID 0.0.7153593. 1 billion total supply. 8 decimal places. AMM-derived price (initial seed: $0.01, moves with trading). Used for governance voting weight and operator staking.

**HSCS (Hedera Smart Contract Service)**
A Hedera service for deploying and running Solidity smart contracts. Powers the EnergyMarket (0.0.7153712), ServicePayment (0.0.7153764), and Governance (0.0.7153782) contracts.

**HTS (Hedera Token Service)**
A native Hedera service for issuing and managing fungible and non-fungible tokens. HederaNet's HNET, HEC, HCC, USDC, and Reputation NFT tokens are all HTS tokens.

---

## I

**IoT Oracle**
A network of trusted hardware nodes that read physical sensor data (solar meters, network uptime monitors) and report it on-chain. HederaNet uses a 3-of-5 multi-signature IoT oracle — at least 3 of 5 nodes must agree on a reading for it to be accepted.

---

## K

**KYC (Know Your Customer)**
An identity verification process that confirms a user's real-world identity. HederaNet KYC status has three values: PENDING (default), APPROVED, and REJECTED. On testnet, KYC is not enforced. On mainnet, operators above certain thresholds will require APPROVED status.

---

## M

**Mirror Node**
A read-only replica of the Hedera ledger that allows querying account balances, transaction history, and token states without submitting transactions. HederaNet's API queries the Hedera mirror node for live HBAR and token balances.

**M-Pesa**
A mobile money service operated by Safaricom (Kenya) and Vodacom (Tanzania, Mozambique). The most widely used mobile money service in East Africa, with over 50 million users. Supported as a HederaNet withdrawal provider.

**MTN MoMo**
Mobile Money service by MTN Group, operating in Nigeria, Ghana, Uganda, Cameroon, Rwanda, and other African countries. Supported as a HederaNet withdrawal provider.

---

## N

**Node ID**
A short identifier for a deployed hotspot, displayed in the hotspot list. Formatted as the last 6 characters of the hotspot's internal ID in uppercase (e.g., `A3F9C2`).

---

## O

**OPERATOR**
A HederaNet user role for infrastructure providers. Operators can deploy hotspots, register solar installations, create energy listings, stake HBAR, and view detailed earnings analytics. Upgraded from SUBSCRIBER via the operator registration form.

---

## P

**Proposal**
A governance decision request submitted by a user. Proposals have a title, description, and voting period (3-30 days). They go through: PENDING → ACTIVE → PASSED/REJECTED → EXECUTED.

---

## R

**Reputation NFT**
A soulbound (non-transferable) non-fungible token issued to operators for achieving network milestones. HTS token ID 0.0.7153666. Cannot be bought, sold, or transferred. Accumulation increases an operator's reputation score, which multiplies HNET voting power.

**Reputation Score**
A numeric value derived from a user's Reputation NFT holdings. Multiplies HNET balance in the governance voting weight formula: `Voting Power = HNET Balance × Reputation Score`.

---

## S

**SILVER**
The middle operator tier. Requires 100+ ℏ staked and provides a 1.5× reward multiplier.

**Soulbound**
A token property meaning the token is permanently bound to the wallet that received it and cannot be transferred. HederaNet's Reputation NFTs are soulbound — enforced at the HTS protocol level.

**Staking**
The act of locking HBAR in the operator staking system to advance tiers and earn higher reward multipliers. Staked HBAR can be unstaked at any time (with a resulting tier reduction).

**SUBSCRIBER**
The default HederaNet user role for new accounts. Subscribers can purchase internet subscriptions, buy solar energy, and vote in governance.

**Smart Contract**
A self-executing program deployed on a blockchain that automatically enforces rules when conditions are met. HederaNet uses three smart contracts on Hedera: EnergyMarket, ServicePayment, and Governance.

---

## T

**Testnet**
A sandbox environment for Hedera where tokens have no real monetary value. HederaNet currently runs on testnet. Testnet account IDs, transactions, and balances are separate from mainnet.

**Tier**
An operator level determined by staked HBAR: BRONZE (0+), SILVER (100+), GOLD (500+). Each tier has a different reward multiplier (1×, 1.5×, 2×).

**Transaction**
A single financial event recorded in the HederaNet system. Types include: SUBSCRIPTION, ENERGY_TRADE, STAKE, UNSTAKE, REWARD, SWAP, FAUCET.

---

## U

**USDC**
USD Coin — a USD-pegged stablecoin. On testnet, HederaNet uses a custom USDC token (ID: 0.0.9038720). On mainnet, this will be replaced by Circle's official Hedera USDC (0.0.456858).

**USSD**
Unstructured Supplementary Service Data. A GSM protocol that delivers text-based menus to any mobile phone without requiring internet. HederaNet's USSD gateway is accessible by dialing *384*1# and supports energy purchases, internet subscriptions, earnings checks, and operator registration.

---

## V

**Vote**
A governance decision cast on an active proposal. Can be YES, NO, or ABSTAIN. Weighted by `HNET Balance × Reputation Score`. Recorded on-chain in the Governance contract (0.0.7153782) and the Governance HCS topic (0.0.1006). Permanent and unalterable.
