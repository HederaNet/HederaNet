# KYC Verification

KYC (Know Your Customer) is an identity verification process that confirms a user's real-world identity. On HederaNet, KYC status affects what actions are available — particularly for operators on mainnet.

---

## What KYC Status Means

Every HederaNet account has a KYC status that can be one of three values:

| Status | Meaning | What You Can Do |
|--------|---------|----------------|
| **PENDING** | Default status on account creation. Identity not yet verified. | All testnet features available |
| **APPROVED** | Identity has been verified by the HederaNet team. | All features available on testnet and mainnet |
| **REJECTED** | Verification attempt failed. | Contact support to resolve |

---

## Why KYC Exists

KYC verification serves several purposes on HederaNet:

1. **Regulatory compliance** — Platforms operating cross-border financial services (including crypto payments) face regulatory requirements in many jurisdictions to verify the identity of users above certain transaction thresholds.

2. **Operator accountability** — Operators who deploy physical infrastructure (hotspots, solar panels) and receive HBAR payments benefit from a verified identity, especially for dispute resolution and mobile money withdrawals.

3. **Anti-fraud** — KYC helps prevent the creation of fake operator accounts that collect subscription payments without delivering services.

4. **Mobile money integration** — Withdrawal to M-Pesa, MTN MoMo, and similar services requires a verified identity at the mobile money provider level.

---

## How to Get Approved

### On Testnet

KYC is **not strictly enforced** on testnet. Users with `PENDING` status can access all platform features for testing and development purposes. This allows developers and early adopters to explore the full platform without going through a formal verification process.

### On Mainnet

For mainnet operator operations, KYC approval will be required for:
- Receiving HBAR payments above threshold amounts
- Creating energy listings with IoT delivery
- Mobile money withdrawals
- Advanced staking above certain HBAR amounts

The KYC process for mainnet will be conducted in-app and may involve:
- Providing a government-issued photo ID
- Submitting a selfie for identity matching
- Confirming your country of residence

### Requesting KYC Approval Now

Even on testnet, you can request KYC verification to prepare for mainnet:

1. Contact the HederaNet team at **support@hederanet.online**.
2. Include your Hedera Account ID (e.g., `0.0.1234567`) in the subject line.
3. The team will guide you through the verification steps available for your region.

---

## Where to See Your KYC Status

Your KYC status badge is visible in:

1. **Profile page** — A colored status badge next to your account information.
2. **Staking page** — Shown in the account status card at the top of the staking page.

Status badge colors:
- Yellow/orange = PENDING
- Green = APPROVED
- Red = REJECTED

---

## KYC Status After Rejection

If your status is `REJECTED`:

1. Contact **support@hederanet.online** with your account ID and a description of your situation.
2. The team will explain why verification was rejected and what documents or steps are needed to reapply.
3. Common rejection reasons: document not clearly readable, name mismatch, ID expired, address mismatch.

Do not create a new account to bypass a rejection — duplicate accounts for the same individual are prohibited and may result in permanent suspension.

---

## KYC and Privacy

HederaNet handles KYC data with care:
- Identity documents are processed according to applicable data protection laws.
- KYC data is not stored permanently longer than required.
- Your KYC status (PENDING/APPROVED/REJECTED) is visible only to you and platform admins.
- Your Hedera Account ID and on-chain activity are public by design (this is separate from KYC).

For questions about data handling, contact support@hederanet.online.
