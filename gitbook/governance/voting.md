# Voting on Proposals

Voting is how HNET holders shape the HederaNet network. Every active proposal can receive YES, NO, or ABSTAIN votes. All votes are on-chain, publicly verifiable, and permanent.

---

## Finding Proposals to Vote On

Navigate to **Governance** in the top navigation bar, or go directly to `/dashboard/governance`.

The governance page lists all proposals. Use the status filter to find the ones you want to vote on:

| Filter | Shows |
|--------|-------|
| **ACTIVE** | Proposals currently accepting votes |
| **PENDING** | Proposals not yet open for voting |
| **PASSED** | Completed proposals that reached quorum with >50% YES |
| **REJECTED** | Completed proposals that did not pass |

> 💡 **Tip:** Bookmark the governance page and check the ACTIVE filter regularly. Voting periods can be as short as 3 days, so important proposals can close quickly.

---

## How to Cast Your Vote

### Step 1: Find an Active Proposal

Make sure you are viewing **ACTIVE** proposals. Pending, passed, and rejected proposals do not accept votes.

### Step 2: Read the Proposal

Each proposal card shows:
- **Title** — A concise description of what is being decided
- **Description** — Full details on the problem, proposed change, and rationale
- **Vote bar** — Current vote percentages (green = YES, red = NO, gray = ABSTAIN)
- **Voting period end date** — When voting closes

Read the full description before voting. Informed votes produce better governance outcomes.

### Step 3: Cast Your Vote

Three vote buttons are available on each ACTIVE proposal card:

| Button | Meaning |
|--------|---------|
| **Vote Yes** | You support this proposal and want it to pass |
| **Vote No** | You oppose this proposal and want it to fail |
| **Abstain** | You are registering your participation but not voting for or against |

Click your choice. A **loading spinner** appears on the button you clicked while the vote is being processed.

### Step 4: Confirm the Vote Registered

After the vote is submitted:
- The spinner disappears.
- The vote bar updates to reflect your new vote.
- Your vote appears in the on-chain record at the Governance HCS topic (0.0.1006).
- The specific button you clicked shows as "selected" or becomes disabled to prevent duplicate votes.

---

## Understanding the Vote Bar

Each proposal card displays a horizontal bar divided into three colored segments:

```
[██████████████░░░░░░░░░░░░░░░░░░░░]
  YES (45%)       NO (30%)  ABSTAIN (25%)
```

| Color | Vote Type | Percentage Shown |
|-------|-----------|-----------------|
| Green | YES | Share of total weighted votes |
| Red | NO | Share of total weighted votes |
| Gray | ABSTAIN | Share of total weighted votes |

The percentages are based on **weighted votes** — a voter with 10,000 HNET × reputation 5 contributes 50,000 units of voting weight, not just "1 vote."

---

## Can You Change Your Vote?

**No.** Once a vote is submitted and recorded on-chain, it is permanent and cannot be changed. The Governance contract (0.0.7153782) does not permit vote modification.

Before voting, take your time to read the proposal thoroughly. If you are unsure, ABSTAIN is always a valid choice — it registers your participation in the quorum without committing to a position.

---

## What Happens When Voting Ends

When the voting period expires:

1. The platform checks the final vote tallies.
2. **If >50% YES and quorum is met** → Status changes to `PASSED`.
3. **If not** → Status changes to `REJECTED`.
4. PASSED proposals move to `EXECUTED` after implementation.

You will see these status changes reflected in the governance filter immediately.

---

## Viewing Historical Results

Filter by **PASSED** or **REJECTED** to see the full history of governance decisions. Each completed proposal card shows:

- Final vote percentages (YES/NO/ABSTAIN)
- Total voting weight that participated
- Whether quorum was reached
- The date the proposal closed

This historical record is also permanently available on HashScan via the Governance HCS topic (0.0.1006) at `https://hashscan.io/testnet/topic/0.0.1006`.

---

## Building Your Voting Power

Your vote's influence depends on your governance weight:

```
Voting Power = HNET Balance × Reputation Score
```

To maximize your governance influence:

1. **Accumulate HNET** — Claim USDC from the faucet and swap to HNET, or earn HNET as operator rewards.
2. **Build reputation** — Become an operator, maintain high uptime, participate in governance consistently, and earn Reputation NFTs.
3. **Vote regularly** — Some future governance designs reward consistent participation with reputation boosts.

---

## Why Your Vote Matters

Even if your individual voting weight feels small, consistent participation:

- Contributes to quorum (proposals cannot pass without sufficient participation)
- Signals to the community that an issue matters
- Prevents a small group of whale voters from dominating all decisions
- Qualifies you for governance participation reputation rewards in the future

A well-distributed governance system where many moderate-weight voters participate is more resilient than one where only a few large holders vote.
