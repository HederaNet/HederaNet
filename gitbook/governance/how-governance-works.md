# How Governance Works

HederaNet is a community-governed network. The rules, economics, and direction of the platform are decided by token holders through an on-chain governance system — not by a central company or team.

---

## Who Can Participate

| Action | Requirement |
|--------|-------------|
| **View proposals** | Public — no account needed |
| **Vote on proposals** | Any signed-in HederaNet account |
| **Create proposals** | Any authenticated user |
| **Have governance weight** | Must hold HNET tokens |

All authenticated users can vote, but voting without HNET tokens has no weight. To have meaningful governance influence, you must hold HNET. See [HNET Token](../tokens/hnet.md) for how to acquire it.

---

## Voting Weight Formula

Your governance power for any given vote is:

```
Voting Power = HNET Balance × Reputation Score
```

**HNET Balance** — The number of HNET tokens you hold at the time of the vote. This is fetched from your Hedera account via the mirror node.

**Reputation Score** — A number derived from your Reputation NFTs (non-transferable achievement badges). A new user has a reputation score of 1. Established operators with multiple milestone NFTs may have scores of 5, 10, or higher.

### Why This Formula?

Pure token voting (where the richest address always wins) leads to governance capture by large token holders. The reputation multiplier ensures that:
- Long-term contributors with earned reputation have proportionally more influence.
- Financial wealth alone does not dominate governance.
- New participants can still vote, but have less weight until they build a track record.

---

## The Governance Contract

All voting is enforced by the **Governance smart contract** at **0.0.7153782** on the Hedera testnet.

When you vote, the platform submits a transaction to this contract. The contract records your vote, applies your weighted voting power, and updates the proposal's vote tallies. Once a vote is on-chain, it cannot be altered or deleted.

---

## Governance Topic (HCS)

In addition to the smart contract, all governance votes are published to a **Hedera Consensus Service (HCS) topic** for maximum transparency:

- **Governance Topic ID:** 0.0.1006
- **Viewable at:** `https://hashscan.io/testnet/topic/0.0.1006`

Anyone — including non-users, journalists, researchers, or regulators — can read the full governance vote log on HashScan without needing a HederaNet account. This is a strong form of public accountability.

---

## Proposal Lifecycle

Every governance proposal goes through the following states:

```
[PENDING]
   │  Proposal created, voting period not yet started
   │  (or waiting for admin approval before going active)
   ▼
[ACTIVE]
   │  Voting is open
   │  Community can cast YES / NO / ABSTAIN votes
   │  Runs for the specified voting period (3–30 days)
   ▼
[PASSED] ──── or ──── [REJECTED]
   │  >50% YES + quorum met          Not enough YES votes
   ▼                                 or quorum not reached
[EXECUTED]
   │  Decision implemented on-chain
   │  (for technical changes) or
   │  noted for off-chain implementation
```

---

## Quorum and Threshold

For a proposal to pass:
- **>50% YES** — More than half of all cast votes (by weight) must be YES.
- **Quorum** — A minimum total voting weight must participate. Proposals with almost no participation cannot pass, even if all votes are YES.

Specific quorum values are configured in the Governance contract and can be adjusted through a governance proposal.

---

## What Governance Decides

Governance proposals can cover any aspect of the network. Examples include:

**Economic parameters:**
- Adjusting the 85/10/5 payment split between operators, platform, and community fund.
- Changing tier thresholds (e.g., reducing Silver threshold from 100 ℏ to 75 ℏ).
- Setting reward multiplier values for each tier.

**Platform development:**
- Prioritizing new language packs for USSD.
- Approving new mobile money integrations.
- Authorizing development of new features.

**Token policy:**
- Adding new Reputation NFT milestone categories.
- Enabling revenue sharing from platform fees to HNET stakers.
- Adjusting HNET royalty fees on transfers.

**Network operations:**
- Onboarding a new supported country.
- Approving new oracle node operators.
- Responding to a security vulnerability.

---

## Transparency and Immutability

Every governance action on HederaNet leaves a permanent, public record:

- Proposal creation and metadata → Platform database + HCS log
- Every vote cast → Governance contract (0.0.7153782) + HCS topic 0.0.1006
- Execution of passed proposals → On-chain transaction (for executable proposals)

No vote can be deleted, altered, or hidden. Even the HederaNet team cannot modify the governance record after the fact.
