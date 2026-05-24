# Reputation NFTs

Reputation NFTs are non-transferable achievement badges issued on Hedera to recognize operators who have demonstrated excellence, consistency, and long-term commitment to the HederaNet network.

---

## Token Details

| Property | Value |
|----------|-------|
| **Token ID (Testnet)** | 0.0.7153666 |
| **Type** | Non-Fungible Token (NFT) |
| **Transferability** | Soulbound — cannot be transferred or sold |
| **Market Value** | None — not traded on the market |
| **Decimals** | N/A (NFTs are whole units) |

---

## What "Soulbound" Means

A soulbound token is an NFT that is permanently bound to the wallet that received it. Unlike regular NFTs that can be bought, sold, and traded on secondary markets, soulbound tokens cannot be transferred to another account.

This property is enforced at the HTS (Hedera Token Service) level — the token configuration marks all transfers as frozen except from the issuer. Attempting to send a Reputation NFT to another account will fail at the protocol level.

The term "soulbound" was popularized by Ethereum co-founder Vitalik Buterin in a 2022 paper on non-transferable social identity tokens. HederaNet implements this concept for operator reputation.

---

## Why Non-Transferable?

Reputation must be earned, not bought. If Reputation NFTs could be purchased on secondary markets, wealthy new entrants could simply buy high-reputation status without having served the community. The soulbound design ensures that:

1. **Reputation is authentic** — Only operators who actually achieved a milestone can hold the corresponding NFT.
2. **Gaming is prevented** — You cannot accumulate reputation by acquiring other operators' badges.
3. **Governance is protected** — Since reputation multiplies HNET voting power, non-transferability ensures governance influence reflects real community contribution.

---

## What Reputation NFTs Are Issued For

Reputation NFTs are minted by platform admins and governance for verified operator milestones. Examples include:

| Achievement | Milestone |
|-------------|---------|
| **90-Day Uptime** | Maintaining 90%+ hotspot uptime for 90 consecutive days |
| **Top Energy Provider** | Ranking in the top 10% of energy sellers for a quarter |
| **Governance Contributor** | Submitting 5+ accepted governance proposals |
| **Early Adopter** | One of the first 100 operators on the network |
| **Community Builder** | Helping onboard 10+ new operators to the network |
| **Gold Achiever** | First time reaching Gold tier staking status |

New milestone categories can be added through governance proposals.

---

## How Reputation NFTs Affect Governance

The governance voting weight formula is:

```
Voting Power = HNET Balance × Reputation Score
```

Your reputation score is derived from the number and type of Reputation NFTs you hold. An operator with more achievement badges has a higher reputation score, which multiplies their HNET voting power proportionally.

### Example Comparison

| Operator | HNET Balance | Reputation Score | Voting Power |
|----------|-------------|-----------------|-------------|
| New operator | 10,000 HNET | 1 | 10,000 |
| Established operator | 10,000 HNET | 8 | 80,000 |
| Long-term operator | 5,000 HNET | 15 | 75,000 |

This design gives experienced operators with less token wealth more governance influence than wealthy newcomers — rewarding real contribution over financial speculation.

---

## Viewing Your Reputation NFTs

Your Reputation NFTs are visible on your Hedera account on HashScan:

`https://hashscan.io/testnet/account/YOUR_ACCOUNT_ID`

Click on the **Tokens** tab to see all NFTs associated with your account. Each Reputation NFT will show its serial number, the issuing account (the HederaNet platform), and the date it was minted.

---

## How to Earn Reputation NFTs

Reputation NFTs are not purchasable or swappable — they can only be earned:

1. **Operate consistently** — Maintain high uptime, deliver verified energy, participate in governance.
2. **Achieve milestones** — The platform tracks eligible milestones automatically.
3. **NFT is issued** — When you qualify, the platform mints the NFT to your Hedera account.
4. **Reputation score updates** — Your governance voting weight increases immediately.

The best strategy for accumulating Reputation NFTs is to be an active, reliable, long-term operator: deploy quality hotspots, maintain high uptime, list energy regularly, and participate in governance discussions.

---

## NFTs and the Governance Balance

The dual-factor governance design (HNET × reputation) is one of HederaNet's most important anti-capture mechanisms. Without reputation:
- The governance system would be pure token voting — whoever buys the most HNET wins every vote.
- Well-funded outside parties could acquire governance control without community contribution.

With reputation:
- Token wealth alone is insufficient for governance dominance.
- Community members who have served the network for years have proportionally more influence.
- This aligns governance outcomes with the interests of the actual user and operator community.
