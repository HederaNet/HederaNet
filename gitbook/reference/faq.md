# Frequently Asked Questions

---

## General

**Is HederaNet free to use?**

Creating an account and browsing the platform is free. Actual services — subscribing to a hotspot, buying solar energy, making governance proposals — require HBAR for payment. On testnet, you can claim free USDC from the faucet and swap it for HBAR, so exploration costs nothing.

---

**What countries is HederaNet available in?**

HederaNet is available globally via the web app. The USSD gateway (*384*1#) requires Africa's Talking coverage in your country, which currently includes Nigeria, Kenya, Ghana, Uganda, Tanzania, Rwanda, Ethiopia, Zambia, and others. Mobile money withdrawal availability depends on Flutterwave and your mobile operator. See [Mobile Money Withdrawal](../ussd/mobile-money.md) for the current list.

---

**Is this real money?**

On testnet, no. All tokens are test tokens with no real monetary value, and no real money changes hands. On mainnet (not yet launched), HBAR will be real money. You will be clearly informed when the platform transitions to mainnet.

---

## Accounts & Security

**How is my private key stored?**

On testnet, your Hedera private key is encrypted using AES-256-GCM with a server-side encryption key and stored in HederaNet's database. You never see or handle the raw private key — the platform signs transactions on your behalf. On mainnet, accounts will be non-custodial, meaning you will hold your own keys via a wallet like HashPack.

---

**What is KYC and is it required?**

KYC (Know Your Customer) is identity verification. On testnet, KYC is not strictly enforced — you can use all features with PENDING status. On mainnet, operators above certain transaction thresholds will need APPROVED KYC to comply with financial regulations. See [KYC Verification](../account/kyc-verification.md).

---

**Can I use HederaNet from a feature phone?**

Yes. Dial **`*384*1#`** from any mobile phone on a GSM network. This opens the USSD interface where you can check balances, buy energy, subscribe to internet, check earnings, and register as an operator — all without a smartphone or internet connection.

---

## Becoming an Operator

**What do I need to become an operator?**

A HederaNet account (email or Google sign-in) and the GPS coordinates of where you want to deploy infrastructure. On testnet, there are no additional requirements. For mainnet, physical hardware (WiFi hotspot device or solar installation with IoT meter) is required. See [Becoming an Operator](../operators/becoming-an-operator.md).

---

**How much can I earn as an operator?**

Earnings depend on the number and quality of your deployments. Each hotspot subscription pays 85% of the monthly fee directly to you. Energy listings pay 85% of the sale price. A hotspot priced at 5 ℏ/month with 30 subscribers generates 127.5 ℏ/month from that hotspot alone. Reaching Gold tier doubles your reward rate. See [Tracking Earnings](../operators/tracking-earnings.md) for full details.

---

## Tokens & Staking

**What is the difference between HBAR and HNET?**

HBAR is Hedera's native currency — used for all payments and fees on the platform. HNET is HederaNet's own governance token — used for voting on proposals and staking to earn higher reward multipliers. You need HBAR to use services; you need HNET to influence how the network is governed. See [HBAR](../tokens/hbar.md) and [HNET](../tokens/hnet.md).

---

**Can I lose my staked HBAR?**

On the current testnet implementation, staking is non-punitive — your HBAR is always returned when you unstake. There is no "slashing" (automatic penalty for bad behavior). On mainnet, governance may introduce slashing for provably malicious behavior, but only through a community vote.

---

**What happens if I unstake HBAR?**

Your staked HBAR is returned to your liquid balance immediately. Your tier is recalculated based on the remaining staked amount. If you drop below a tier threshold, your reward multiplier decreases immediately. See [Staking & Tiers](../operators/staking-and-tiers.md).

---

**Why does the swap say "simulated"?**

The swap interface shows "simulated" when the `USDC_TOKEN_ID` is not configured as an on-chain Hedera token (common in development environments). In simulation mode, swaps are recorded in the database but do not produce actual Hedera token transfers. On a fully configured testnet or mainnet, all swaps are on-chain. See [Swapping Tokens](../market/swapping-tokens.md).

---

**What is the faucet?**

The USDC Faucet on the market page dispenses 100 free testnet USDC every 24 hours. This is for testing purposes only — USDC on testnet has no real value. Use the faucet to get starting tokens, then swap for HBAR, HNET, HEC, or HCC. See [USDC Faucet](../market/usdc-faucet.md).

---

**How often is HBAR price updated?**

The $0.07/ℏ price shown on the platform is the testnet reference price used for USD estimates. It is not a live market feed on testnet. On mainnet, a Hedera price oracle will provide real-time pricing. For the current market price of HBAR, check CoinMarketCap or CoinGecko.

---

## Hotspots & Energy

**What happens if my hotspot goes offline?**

Your hotspot's uptime percentage (a 30-day trailing average) will decrease. This may deter new subscribers who prefer high-uptime nodes. Existing subscriptions continue until they expire, but subscribers may choose not to renew if reliability is poor. Frequent downtime also affects your reputation score over time.

---

**What is a reputation NFT?**

A Reputation NFT is a soulbound (non-transferable) achievement badge issued to operators for reaching milestones — like maintaining 90% uptime for 90 days, or becoming a top energy provider. You cannot buy or transfer them. They increase your reputation score, which multiplies your HNET voting power in governance. See [Reputation NFTs](../tokens/reputation-nfts.md).

---

## Governance

**How does voting power work?**

`Voting Power = HNET Balance × Reputation Score`. An operator with 10,000 HNET and a reputation score of 5 has 50,000 units of voting power. This dual-factor formula prevents pure token-whale dominance and rewards long-term community contributors. See [How Governance Works](../governance/how-governance-works.md).

---

**What happens to a PASSED proposal?**

PASSED proposals with on-chain execution logic are automatically executed by the Governance contract. Proposals requiring off-chain implementation (UI changes, new features, team priorities) are implemented by the development team manually following the governance outcome. The status moves to EXECUTED when done.

---

**Can I change my vote?**

No. Once a vote is submitted and recorded on-chain, it is permanent. The Governance contract does not allow vote modifications. Read proposals carefully before voting. ABSTAIN is always an option if you are unsure.

---

## Platform & Technical

**What is the 85/10/5 payment split?**

Every service payment on HederaNet is split automatically by the ServicePayment smart contract: 85% goes to the infrastructure operator, 10% goes to the platform treasury, and 5% goes to the community governance fund. This split is encoded in the contract and can only be changed through a governance proposal. See [How Payments Work](../operators/tracking-earnings.md).

---

**How do I get more HBAR on testnet?**

Several methods: (1) Small amount auto-credited on account creation, (2) Earn by deploying hotspots and energy listings, (3) Claim USDC from the faucet and swap to HBAR on the market, (4) Use the official Hedera testnet faucet at portal.hedera.com to top up your account directly.

---

**When is mainnet?**

Mainnet launch date has not been announced. Follow @HederaNet on Twitter/X and join the Discord (https://discord.gg/hederanet) for the latest updates. Registered users will receive an email announcement.

---

**How do I withdraw earnings?**

Via the web app: Dashboard → Earnings (mobile money integration coming). Via USSD: dial *384*1# → Earnings → Withdraw to Mobile Money. Enter the amount, select your provider (M-Pesa, MTN MoMo, Airtel Money), and confirm. Funds arrive via SMS within 1-5 minutes. See [Mobile Money Withdrawal](../ussd/mobile-money.md).

---

**Where can I report a bug?**

Open a GitHub issue at https://github.com/hederanet/hederanet/issues. Include your Account ID (not private key), the steps to reproduce the bug, what you expected to happen, and what actually happened. For security vulnerabilities, email security@hederanet.online instead of opening a public issue.
