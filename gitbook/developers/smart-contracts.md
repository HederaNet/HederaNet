# Smart Contracts

HederaNet uses three smart contracts deployed on the Hedera testnet via the Hedera Smart Contract Service (HSCS). All contracts are written in Solidity and verified on HashScan.

---

## Contract Addresses

| Contract | Address (Testnet) | HashScan |
|----------|------------------|---------|
| **EnergyMarket** | 0.0.7153712 | [View](https://hashscan.io/testnet/contract/0.0.7153712) |
| **ServicePayment** | 0.0.7153764 | [View](https://hashscan.io/testnet/contract/0.0.7153764) |
| **Governance** | 0.0.7153782 | [View](https://hashscan.io/testnet/contract/0.0.7153782) |

---

## EnergyMarket (0.0.7153712)

The EnergyMarket contract handles peer-to-peer energy trading between solar operators and buyers.

### Purpose

- Accept energy purchase payments in HBAR.
- Escrow funds until IoT oracle confirms energy delivery.
- Distribute payment on confirmation or refund on dispute.
- Manage the 24-hour dispute window.

### Key Functions

```solidity
// Create a new energy listing
function createListing(
    uint256 pricePerKwhHbar,    // price in tinybars per kWh
    uint256 availableUnits,     // kWh available for sale
    bytes32 installationId      // on-chain installation identifier
) external returns (uint256 listingId)

// Purchase kWh from a listing (payable — sends HBAR)
function purchaseEnergy(
    uint256 listingId,          // which listing to buy from
    uint256 amountKwh           // how many kWh to purchase
) external payable returns (uint256 tradeId)

// Oracle confirms energy delivery (restricted to oracle addresses)
function confirmDelivery(
    uint256 tradeId,            // the trade being confirmed
    uint256 confirmedKwh        // actual kWh delivered per IoT meter
) external onlyOracle

// Buyer opens a dispute (within 24 hours of purchase)
function openDispute(
    uint256 tradeId
) external onlyBuyer(tradeId)

// Admin resolves a dispute
function resolveDispute(
    uint256 tradeId,
    bool deliveryConfirmed      // true = pay operator; false = refund buyer
) external onlyAdmin
```

### Events

```solidity
event ListingCreated(uint256 indexed listingId, address indexed operator, uint256 pricePerKwh);
event EnergyPurchased(uint256 indexed tradeId, address indexed buyer, uint256 amountKwh, uint256 totalCost);
event DeliveryConfirmed(uint256 indexed tradeId, uint256 confirmedKwh);
event DisputeOpened(uint256 indexed tradeId, address indexed buyer);
event DisputeResolved(uint256 indexed tradeId, bool deliveredToOperator);
```

### Security Features

- **ReentrancyGuard** — Prevents reentrancy attacks on payable functions.
- **Pausable** — Admin can pause the contract in an emergency to prevent new trades.
- **24-hour dispute window** — Disputes can only be opened within 24 hours of purchase.
- **Oracle multi-sig** — Delivery confirmation requires 3-of-5 oracle signatures (see Oracle section below).

---

## ServicePayment (0.0.7153764)

The ServicePayment contract handles internet subscription payments and enforces the 85/10/5 distribution split.

### Purpose

- Accept subscription payments in HBAR.
- Automatically split and distribute to operator, platform, and community fund.
- Track subscription periods.

### Key Functions

```solidity
// Pay for a hotspot subscription (payable)
function subscribe(
    bytes32 hotspotId,          // which hotspot to subscribe to
    address operatorAddress     // operator's Hedera EVM address
) external payable returns (bytes32 subscriptionId)

// Renew an existing subscription (payable)
function renew(
    bytes32 subscriptionId
) external payable

// Check if a subscription is active
function isActive(
    bytes32 subscriptionId
) external view returns (bool)
```

### Payment Distribution

The split is hardcoded at contract deployment:

```solidity
uint256 public constant OPERATOR_SHARE = 85;   // 85%
uint256 public constant PLATFORM_SHARE = 10;   // 10%
uint256 public constant COMMUNITY_SHARE = 5;   // 5%
```

All three transfers happen atomically in a single transaction. If any transfer fails, the entire transaction reverts and no funds move.

### Events

```solidity
event SubscriptionCreated(bytes32 indexed subscriptionId, address indexed subscriber, bytes32 indexed hotspotId);
event PaymentDistributed(bytes32 indexed subscriptionId, uint256 operatorAmount, uint256 platformAmount, uint256 communityAmount);
```

---

## Governance (0.0.7153782)

The Governance contract records proposals, votes, and enforces the quorum and threshold requirements.

### Purpose

- Create and manage governance proposals.
- Record weighted votes (HNET × reputation).
- Determine proposal outcomes (PASSED vs REJECTED).
- Execute on-chain actions for passed proposals.

### Key Functions

```solidity
// Create a new proposal
function createProposal(
    string calldata title,
    string calldata description,
    uint256 votingPeriodDays,   // 3 to 30 days
    bytes calldata executeData  // optional calldata for on-chain execution
) external returns (uint256 proposalId)

// Cast a vote
function castVote(
    uint256 proposalId,
    VoteType voteType,          // 0=YES, 1=NO, 2=ABSTAIN
    uint256 votingWeight        // HNET balance × reputation (provided and verified)
) external

// Finalize a proposal after voting ends
function finalizeProposal(
    uint256 proposalId
) external

// Execute a passed proposal (if executeData is set)
function executeProposal(
    uint256 proposalId
) external
```

### Voting Weight Verification

The contract accepts a `votingWeight` parameter but verifies it against the HNET token contract. The platform API computes `hnetBalance × reputationScore` and submits it, but the contract can cross-check with the HTS token balance for the voter's address.

### Events

```solidity
event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
event VoteCast(uint256 indexed proposalId, address indexed voter, VoteType voteType, uint256 weight);
event ProposalFinalized(uint256 indexed proposalId, ProposalStatus status);
event ProposalExecuted(uint256 indexed proposalId);
```

### HCS Logging

In addition to on-chain events, every vote submission triggers an HCS message to the Governance Topic (0.0.1006). The message includes:

```json
{
  "type": "VOTE",
  "proposalId": 42,
  "voter": "0.0.1234567",
  "vote": "YES",
  "weight": 50000,
  "timestamp": "2026-05-23T10:00:00Z"
}
```

---

## HederaNetOracle

The IoT oracle is not a single smart contract but an off-chain multi-signature system:

### Configuration

- **Signers:** 5 oracle nodes (geographically distributed)
- **Threshold:** 3-of-5 confirmations required to finalize
- **Confirmation window:** 1 hour from purchase
- **Data types:** Energy delivery (kWh), hotspot uptime (boolean), service quality metrics

### Confirmation Flow

```
IoT meter reads solar generation
        │
5 oracle nodes independently fetch the reading
        │
Each node submits: confirmDelivery(tradeId, kWh, signature)
        │
After 3rd matching signature received:
  → EnergyMarket.confirmDelivery() is called
  → Funds released from escrow to operator
  → HEC minted
```

### Expiry

If 3-of-5 confirmations are not received within 1 hour, the trade moves to a disputed state. The dispute resolution admin process then handles the case manually.

---

## OperatorStaking (Integrated into Governance)

Staking tier thresholds are constants managed by the Governance contract (or a separate OperatorRegistry):

```solidity
uint256 public constant BRONZE_THRESHOLD = 0;
uint256 public constant SILVER_THRESHOLD = 100 * 10**8;  // 100 HBAR in tinybars
uint256 public constant GOLD_THRESHOLD   = 500 * 10**8;  // 500 HBAR in tinybars
```

Changing these thresholds requires a governance proposal and contract upgrade.

---

## Interacting with Contracts

### Recommended: Via the HederaNet API

The HederaNet API handles all contract interactions on your behalf. All API endpoints that involve on-chain operations (subscribe, buy energy, vote, stake) internally call the appropriate contract function.

### Direct Interaction: Via Hedera SDK

For developers who want to interact directly:

```typescript
import { ContractExecuteTransaction, ContractId } from '@hashgraph/sdk';

const contractId = ContractId.fromString('0.0.7153764');

const tx = new ContractExecuteTransaction()
  .setContractId(contractId)
  .setGas(100000)
  .setFunction('subscribe', new ContractFunctionParameters()
    .addBytes32(hotspotIdBytes)
    .addAddress(operatorEvmAddress)
  )
  .setPayableAmount(new Hbar(5)); // 5 HBAR subscription

const response = await tx.execute(client);
const receipt = await response.getReceipt(client);
```

See the [Hedera SDK documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts/create-a-smart-contract) for full contract interaction patterns.
