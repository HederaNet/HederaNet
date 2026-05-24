# Smart Contract Reference

## EnergyMarket.sol

**Deployed:** 0.0.7153712 (testnet)

### Functions
| Function | Description |
|----------|-------------|
| `createListing(amount, pricePerKwh, duration, qualityProof)` | Create energy listing |
| `purchaseEnergy(listingId, maxPricePerKwh)` | Buy energy with slippage protection |
| `confirmDelivery(tradeId)` | Oracle confirms energy delivery |
| `raiseDispute(tradeId)` | Open dispute within 24-hour window |
| `resolveDispute(tradeId, favorBuyer)` | Admin resolves dispute |
| `cancelListing(listingId)` | Seller cancels listing |
| `pause()` / `unpause()` | Emergency stop |

### Events
- `EnergyListed(listingId, seller, amount, price)`
- `EnergyPurchased(listingId, tradeId, buyer, amount, totalCost)`
- `DeliveryConfirmed(tradeId, confirmedAt)`
- `DisputeRaised(tradeId, raiser)`
- `DisputeResolved(tradeId, buyerFavored)`

---

## OperatorStaking.sol

### Tier Thresholds
| Tier | Minimum Stake | Reward Multiplier |
|------|--------------|-------------------|
| Bronze | 100 HBAR | 1.0x |
| Silver | 500 HBAR | 1.5x |
| Gold | 2000 HBAR | 2.0x |

### Functions
| Function | Description |
|----------|-------------|
| `stake()` payable | Stake HBAR |
| `requestUnstake(amount)` | Begin 14-day cooldown |
| `unstake()` | Withdraw after cooldown |
| `claimRewards()` | Claim pending rewards |
| `slash(operator, reason)` | 5% penalty for poor uptime |

---

## HederaNetOracle.sol

3-of-5 multi-sig oracle for IoT confirmations.

### Reading Types
- `EnergyDelivery` — kWh delivered, triggers trade confirmation
- `NetworkUptime` — hotspot availability reporting
- `ComputeJob` — compute task completion

### Functions
| Function | Description |
|----------|-------------|
| `registerOracle(oracle)` | Add oracle (requires 50 HBAR stake) |
| `submitReading(type, deviceId, dataHash, value)` | First confirmation |
| `confirmReading(readingId)` | Additional confirmations |

Readings expire after 1 hour. Finalized at 3/5 confirmations.

---

## GovernanceContract.sol

### Lifecycle
```
PENDING (2-day discussion) → ACTIVE (voting) → PASSED/REJECTED → EXECUTED
```

### Functions
| Function | Description |
|----------|-------------|
| `createProposal(title, description, votingPeriod, quorum, threshold)` | Min 50 reputation |
| `activateProposal(proposalId)` | After discussion period |
| `castVote(proposalId, choice)` | YES / NO / ABSTAIN |
| `finalizeProposal(proposalId)` | After voting ends |
