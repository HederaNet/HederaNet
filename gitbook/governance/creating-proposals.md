# Creating a Proposal

Any authenticated HederaNet user can create a governance proposal. A well-crafted proposal has a clear problem statement, a specific proposed solution, and gives the community enough information to make an informed vote.

---

## Before You Create a Proposal

Ask yourself:
1. **Is this the right venue?** Governance proposals are for network-level decisions. Bug reports belong on GitHub, and personal support issues belong in email/Discord.
2. **Has this been discussed?** Proposals that have been discussed in Discord or GitHub Discussions first tend to pass with less controversy. The community appreciates pre-proposal conversation.
3. **Is your HNET balance meaningful?** You can submit a proposal without HNET, but without voting weight you cannot personally help pass it. Build your HNET balance first.

---

## How to Create a Proposal

### Step 1: Go to the Governance Page

Navigate to **Governance** in the top navigation bar, or go directly to `/dashboard/governance`.

### Step 2: Click "+ New Proposal"

Click the **+ New Proposal** button in the top right of the governance page. The proposal creation form opens.

### Step 3: Enter the Title

Write a clear, concise title that describes what your proposal is about.

**Requirements:**
- Minimum: 10 characters
- Maximum: 200 characters
- Must clearly indicate the subject of the proposal

**Good examples:**
- `Reduce Silver tier threshold from 100 HBAR to 75 HBAR`
- `Add Amharic language support to the USSD gateway`
- `Increase operator payment share from 85% to 87%`
- `Establish a quarterly operator performance reward pool`

**Avoid:**
- Vague titles: `Improve the platform` (what specifically?)
- Questions: `Should we change fees?` (state your position)
- All-caps titles: `URGENT CHANGE NEEDED` (treated as spam)

### Step 4: Write the Description

The description is where you make your case. The community will read this before voting.

**Requirements:**
- Minimum: 50 characters
- Maximum: 5,000 characters

**What a good description includes:**

1. **Problem statement** — What issue or opportunity are you addressing?
2. **Proposed change** — Exactly what do you want to change? Be specific with numbers, parameters, or code references.
3. **Rationale** — Why is this change beneficial? Who does it help? What data or reasoning supports it?
4. **Expected outcome** — What does success look like? Is there a measurable target?
5. **Risks or tradeoffs** — What could go wrong? What does the community give up with this change?
6. **Implementation notes** — For technical changes, how would this be implemented?

**Example description (abbreviated):**

> The current Silver tier threshold requires operators to stake 100 HBAR (approximately $7 at the current reference price) to access a 1.5× reward multiplier. For small operators in rural areas deploying their first hotspot, this capital requirement is a meaningful barrier. I propose reducing the Silver threshold to 75 HBAR while maintaining the Gold threshold at 500 HBAR. This change would expand Silver tier access to ~30% more current operators (based on the staking distribution data from the last governance report), increasing the average reward rate across the network and accelerating infrastructure growth in underserved areas. The tradeoff is a slight reduction in the minimum commitment signal for Silver operators, which is acceptable given the more important goal of broad participation.

### Step 5: Set the Voting Period

Choose how long the community will have to vote on your proposal.

| Setting | Range | Default |
|---------|-------|---------|
| **Voting Period** | 3 to 30 days | 7 days |

**Guidance:**
- **3–5 days** — For urgent or straightforward proposals with strong pre-existing community consensus.
- **7 days** — The default. Gives most active community members time to see and vote.
- **14–30 days** — For complex or contentious proposals, or those affecting mainnet economics. Longer periods allow more deliberation.

### Step 6: Submit the Proposal

Click **Submit Proposal**. Your proposal is created with `PENDING` status.

---

## After Submitting

**PENDING status** means the proposal exists in the system but voting has not yet opened. This gives time for community members to read and discuss the proposal before the voting clock starts.

Once the voting period opens, the status moves to **ACTIVE** and community members can cast votes.

---

## Tracking Your Proposal

On the governance page, filter by **PENDING** or **ACTIVE** to find your proposal. Each proposal card shows:
- Title and description
- Creator's account
- Voting period end date (when ACTIVE)
- Current vote totals and percentages
- Status badge

---

## What PASSED Means vs EXECUTED

| Status | Meaning |
|--------|---------|
| **PASSED** | The vote succeeded (>50% YES, quorum met). The decision is approved. |
| **EXECUTED** | For on-chain executable proposals, the smart contract action has been triggered. For off-chain changes (like UI updates or team priorities), the team implements the change manually after a PASSED outcome. |

Not all proposals require on-chain execution. A proposal to "prioritize building Amharic USSD support" passes and is implemented by the development team without a contract interaction.

---

## Tips for Proposals That Pass

1. **Discuss before submitting** — Post in Discord or GitHub Discussions first. Gauge community reaction. Revise your proposal based on feedback.
2. **Be specific** — Vague proposals ("improve operator earnings") cannot be implemented. Specific proposals ("increase operator payment share from 85% to 87% in the ServicePayment contract") can.
3. **Show your work** — Cite data, numbers, or examples. Proposals backed by evidence are more persuasive than opinion alone.
4. **Time it well** — A 7-day proposal starting on a Friday runs through the following Friday. Consider when community members are most active.
5. **Campaign for your proposal** — Share it in Discord, explain your reasoning, and ask for votes. Governance does not work without participation.
